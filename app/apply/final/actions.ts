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
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed. Please check your inputs.' };
    }
    return { success: false, error: 'An error occurred while submitting your application.' };
  }
}
