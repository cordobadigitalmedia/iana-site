import { sql } from '@/lib/db';

export interface ResponseLinkRow {
  id: string;
  application_id: string;
  role: string;
  reference_index: number;
  token: string;
  email: string;
  created_at: Date;
  submitted_at: Date | null;
  answers: Record<string, string> | null;
  document_url: string | null;
}

export async function getResponseLinkByToken(
  token: string
): Promise<ResponseLinkRow | null> {
  const rows = await sql`
    SELECT id, application_id, role, reference_index, token, email, created_at, submitted_at, answers, document_url
    FROM response_links
    WHERE token = ${token}
    LIMIT 1
  `;
  const row = rows[0] as ResponseLinkRow | undefined;
  return row ?? null;
}

export async function getApplicationApplicantName(applicationId: string): Promise<string> {
  const rows = await sql`
    SELECT form_data->>'first_name' AS first_name, form_data->>'middle_name' AS middle_name, form_data->>'last_name' AS last_name
    FROM applications
    WHERE id = ${applicationId}
    LIMIT 1
  `;
  const row = rows[0] as { first_name: string | null; middle_name: string | null; last_name: string | null } | undefined;
  if (!row) return '';
  return [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(' ').trim();
}

export async function submitResponseLink(
  token: string,
  answers: Record<string, string>,
  documentUrl: string
): Promise<{ success: boolean; error?: string }> {
  const link = await getResponseLinkByToken(token);
  if (!link) return { success: false, error: 'Invalid or expired link.' };
  if (link.submitted_at) return { success: false, error: 'This form has already been submitted.' };

  await sql`
    UPDATE response_links
    SET answers = ${JSON.stringify(answers)}, document_url = ${documentUrl}, submitted_at = NOW()
    WHERE token = ${token}
  `;
  return { success: true };
}
