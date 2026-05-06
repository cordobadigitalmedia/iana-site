'use server';

import { sql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { checkBotId } from 'botid/server';
import { finalApplicationSchema } from '@/lib/forms/schemas/final-application-schema';
import { randomBytes } from 'crypto';
import {
  sendApplicationEmail,
  sendGuarantorLinkEmail,
  sendReferenceLinkEmail,
  sendApplicantAcknowledgementEmail,
} from '@/lib/email';

function generateToken(): string {
  return randomBytes(16).toString('hex');
}

/** Map preliminary form_data to final application fields (Personal Info + Confirmation of Loan Terms). */
function mapPrelimToFinal(prelim: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const legalName = (prelim.legal_name as string)?.trim() || '';
  const parts = legalName.split(/\s+/).filter(Boolean);
  if (parts.length >= 1) {
    out.first_name = parts[0];
    out.last_name = parts.length > 1 ? parts[parts.length - 1] : '';
    out.middle_name = parts.length > 2 ? parts.slice(1, -1).join(' ') : '';
  }
  const direct = [
    'city', 'province_state', 'country', 'postal_zip_code', 'phone', 'cell', 'email',
    'amount_requested', 'expected_monthly_payment', 'proposed_start_date',
    'expected_repayment_start_date', 'expected_repayment_finish_date',
  ] as const;
  for (const key of direct) {
    if (prelim[key] !== undefined && prelim[key] !== null && prelim[key] !== '') {
      out[key] = prelim[key];
    }
  }
  if (prelim.address !== undefined && prelim.address !== null && prelim.address !== '') {
    out.permanent_address = prelim.address;
  }
  const appType = prelim.application_type as string | undefined;
  if (appType === 'Preliminary Application for a small, short-term, Personal/Emergency loan') {
    out.loan_type = 'Personal';
  } else if (appType === 'Preliminary Application for an Educational loan') {
    out.loan_type = 'Education';
  } else if (appType === 'Preliminary Application for a Business or Institutional loan') {
    out.loan_type = 'Business/Institutional';
  }
  return out;
}

/** Get preliminary data for pre-filling the final form. Uses token (from invite link) or email. */
export async function getPrelimDataForFinal(
  token: string | null | undefined,
  email: string | null | undefined
): Promise<Record<string, unknown> | null> {
  let applicantEmail: string | null = null;
  if (token) {
    const rows = await sql`
      SELECT applicant_email FROM final_apply_tokens WHERE token = ${token} LIMIT 1
    `;
    const row = rows[0] as { applicant_email: string } | undefined;
    applicantEmail = row?.applicant_email ?? null;
  }
  if (!applicantEmail && email?.trim()) {
    applicantEmail = email.trim();
  }
  if (!applicantEmail) return null;

  const rows = await sql`
    SELECT form_data, application_type
    FROM applications
    WHERE applicant_email = ${applicantEmail}
      AND application_type IN ('preliminary-personal', 'preliminary-education', 'preliminary-business')
    ORDER BY submitted_at DESC NULLS LAST
    LIMIT 1
  `;
  const row = rows[0] as { form_data: Record<string, unknown>; application_type: string } | undefined;
  if (!row?.form_data) return null;

  const prelim = typeof row.form_data === 'string' ? JSON.parse(row.form_data) : row.form_data;
  return mapPrelimToFinal(prelim);
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function submitFinalApplication(formData: Record<string, any>) {
  try {
    // Check if the request is from a bot
    const verification = await checkBotId();
    
    if (verification.isBot) {
      return { success: false, error: 'Bot detected. Access denied.' };
    }
    
    const validatedData = finalApplicationSchema.parse(formData);
    const applicationId = uuidv4();
    
    await sql`
      INSERT INTO applications (id, application_type, form_data, applicant_email)
      VALUES (${applicationId}, ${'final'}, ${JSON.stringify(validatedData)}, ${validatedData.email || null})
    `;
    
    await sendApplicationEmail({
      applicationId,
      applicationType: 'final',
      formData: validatedData
    });
    
    const applicantName = [validatedData.first_name, validatedData.middle_name, validatedData.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();

    const baseUrl = getBaseUrl();
    const guarantorEmail = validatedData.guarantor_email as string | undefined;
    if (guarantorEmail && applicantName) {
      const token = generateToken();
      await sql`
        INSERT INTO response_links (application_id, role, reference_index, token, email)
        VALUES (${applicationId}, ${'guarantor'}, ${0}, ${token}, ${guarantorEmail})
      `;
      await sendGuarantorLinkEmail({
        applicantName,
        email: guarantorEmail,
        linkUrl: `${baseUrl}/respond/guarantor/${token}`,
      });
    }

    // Send Reference Questions email to each reference (automatic on submit)
    const refEmails = [
      validatedData.reference1_email,
      validatedData.reference2_email,
      validatedData.reference3_email,
    ].filter((e): e is string => Boolean(e));

    for (let i = 0; i < refEmails.length; i++) {
      const email = refEmails[i];
      if (!applicantName) continue;
      const token = generateToken();
      await sql`
        INSERT INTO response_links (application_id, role, reference_index, token, email)
        VALUES (${applicationId}, ${'reference'}, ${i + 1}, ${token}, ${email})
      `;
      await sendReferenceLinkEmail({
        applicantName,
        email,
        linkUrl: `${baseUrl}/respond/reference/${token}`,
      });
    }

    if (validatedData.email) {
      await sendApplicantAcknowledgementEmail({
        to: validatedData.email as string,
        applicationId,
        applicationType: 'final',
      });
    }

    await sql`
      UPDATE applications SET email_sent = true, email_sent_at = NOW() WHERE id = ${applicationId}
    `;
    
    return { success: true, applicationId };
  } catch (error: any) {
    console.error('Error submitting application:', error);
    const issues = error?.name === 'ZodError' ? (error.issues ?? error.errors) : null;
    if (issues && Array.isArray(issues)) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of issues) {
        const path = issue.path?.filter(Boolean);
        const key = path && path.length > 0 ? (path[0] as string) : 'form';
        const msg = issue.message || 'Invalid value';
        if (!fieldErrors[key] || key === 'form') {
          fieldErrors[key] = msg;
        }
      }
      return {
        success: false,
        error: 'Please fix the highlighted fields below.',
        fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      };
    }
    return { success: false, error: 'An error occurred while submitting your application.' };
  }
}
