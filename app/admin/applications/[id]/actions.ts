'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';
import { getAdminUser } from '@/lib/admin-auth';
import { sql } from '@/lib/db';
import { getApplicantName } from '@/lib/applications';
import { sendLoanApprovedEmail, sendApplicantCustomEmail } from '@/lib/email';
import { getApplyUrl } from '@/lib/email-templates';
import type { EmailTemplateId } from '@/lib/email-templates';

export async function updateApplicationStatus(applicationId: string, formData: FormData): Promise<void> {
  const admin = await getAdminUser();
  if (!admin || admin.role !== 'admin') {
    redirect('/admin/access-denied');
  }

  const status = formData.get('status') as string | null;
  const allowed = [
    'submitted',
    'not_now',
    'pending',
    'invite_full_application',
    'awaiting_final_application',
    'awaiting_interview',
    'approved',
    'reviewed',
    'rejected',
  ];
  if (!status || !allowed.includes(status)) {
    return;
  }

  await sql`
    UPDATE applications
    SET status = ${status}
    WHERE id = ${applicationId}
  `;

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath('/admin/applications');
}

export async function updateChecklist(
  applicationId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const admin = await getAdminUser();
  if (!admin || admin.role !== 'admin') {
    redirect('/admin/access-denied');
  }

  const guarantorApproved = formData.get('guarantor_approved') === 'true';
  const referencesApproved = formData.get('references_approved') === 'true';
  const interviewDateRaw = formData.get('interview_date') as string | null;
  const interviewDate = interviewDateRaw?.trim() || null;
  const interviewNotes = (formData.get('interview_notes') as string | null)?.trim() || null;

  await sql`
    UPDATE applications
    SET guarantor_approved = ${guarantorApproved},
        references_approved = ${referencesApproved},
        interview_date = ${interviewDate},
        interview_notes = ${interviewNotes}
    WHERE id = ${applicationId}
  `;

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath('/admin/applications');
  return {};
}

/** Set loan_approved_at, update status to approved, draft agreement (stub), send award email. */
export async function approveLoan(applicationId: string): Promise<{ error?: string }> {
  const admin = await getAdminUser();
  if (!admin || admin.role !== 'admin') {
    redirect('/admin/access-denied');
  }

  const rows = await sql`
    SELECT id, applicant_email, form_data, application_type, loan_approved_at
    FROM applications
    WHERE id = ${applicationId}
    LIMIT 1
  `;
  const app = rows[0] as {
    id: string;
    applicant_email: string | null;
    form_data: Record<string, unknown>;
    application_type: string;
    loan_approved_at: string | null;
  } | undefined;
  if (!app) return { error: 'Application not found' };
  if (app.loan_approved_at) return { error: 'Loan already approved' };
  if (app.application_type !== 'final') return { error: 'Only final applications can be approved for loan' };

  const now = new Date().toISOString();
  await sql`
    UPDATE applications
    SET loan_approved_at = ${now},
        status = 'approved'
    WHERE id = ${applicationId}
  `;

  const applicantName = getApplicantName(app.form_data);
  const to = app.applicant_email;
  if (to) {
    try {
      await sendLoanApprovedEmail({
        to,
        applicantName: applicantName !== '—' ? applicantName : 'Applicant',
        applicationId,
      });
    } catch (e) {
      console.error('Failed to send loan approved email:', e);
      revalidatePath(`/admin/applications/${applicationId}`);
      revalidatePath('/admin/applications');
      return { error: 'Loan approved but award email failed to send.' };
    }
  }

  // Record approval in application_notes (multiple approvals per application)
  await sql`
    INSERT INTO application_notes (application_id, admin_user_id, type, content)
    VALUES (${applicationId}, ${admin.id}, 'approval', 'Loan approved')
  `;

  // Draft loan agreement: placeholder – in production you would generate PDF and store/link
  console.log('[Loan] Draft agreement placeholder for application', applicationId);

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath('/admin/applications');
  return {};
}

/** Add a note, comment, or approval to an application (admin only). */
export async function addApplicationNote(
  applicationId: string,
  type: 'note' | 'comment' | 'approval',
  content: string
): Promise<{ error?: string }> {
  const admin = await getAdminUser();
  if (!admin || admin.role !== 'admin') {
    redirect('/admin/access-denied');
  }

  const trimmed = content?.trim();
  if (!trimmed) return { error: 'Content is required.' };

  await sql`
    INSERT INTO application_notes (application_id, admin_user_id, type, content)
    VALUES (${applicationId}, ${admin.id}, ${type}, ${trimmed})
  `;

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath('/admin/applications');
  return {};
}

/** Send a draft email to the applicant (admin-edited subject/body). */
export async function sendApplicantStatusEmail(
  applicationId: string,
  subject: string,
  bodyText: string,
  templateId?: EmailTemplateId | null
): Promise<{ error?: string }> {
  const admin = await getAdminUser();
  if (!admin || admin.role !== 'admin') {
    redirect('/admin/access-denied');
  }

  const rows = await sql`
    SELECT applicant_email FROM applications WHERE id = ${applicationId} LIMIT 1
  `;
  const row = rows[0] as { applicant_email: string | null } | undefined;
  if (!row?.applicant_email) {
    return { error: 'No applicant email on this application.' };
  }

  let finalBody = bodyText.trim() || 'No message body.';
  if (templateId === 'invite_full_application') {
    const token = randomBytes(16).toString('hex');
    await sql`
      INSERT INTO final_apply_tokens (token, applicant_email)
      VALUES (${token}, ${row.applicant_email})
      ON CONFLICT (token) DO NOTHING
    `;
    const baseUrl = getApplyUrl();
    const applyUrlWithToken = `${baseUrl}?token=${token}`;
    finalBody = finalBody.replace(new RegExp(escapeRegex(baseUrl), 'g'), applyUrlWithToken);
  }

  const result = await sendApplicantCustomEmail({
    to: row.applicant_email,
    subject: subject.trim() || 'Message from IANA Financial',
    bodyText: finalBody,
  });
  return result;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
