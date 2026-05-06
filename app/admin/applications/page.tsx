import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin-auth';
import { sql } from '@/lib/db';
import {
  buildApplicantRows,
  getStatusLabel,
  type ApplicantRow,
} from '@/lib/applications';
import Link from 'next/link';
import { StatusSelect } from './status-select';

export const dynamic = 'force-dynamic';

export default async function AdminApplicationsListPage() {
  const user = await getAdminUser();
  if (!user) {
    redirect('/admin/access-denied');
  }
  const canEdit = user.role === 'admin';

  const applications = await sql`
    SELECT id, application_type, status, submitted_at, applicant_email, form_data,
           guarantor_approved, references_approved, interview_date, interview_notes, loan_approved_at
    FROM applications
    ORDER BY submitted_at DESC
  `;

  const responseLinks = await sql`
    SELECT application_id, role, submitted_at
    FROM response_links
  `;

  const appRows = applications as Array<{
    id: string;
    application_type: string;
    status: string;
    submitted_at: string | null;
    applicant_email: string | null;
    form_data: Record<string, unknown> | null;
    guarantor_approved?: boolean | null;
    references_approved?: boolean | null;
    interview_date?: string | null;
    interview_notes?: string | null;
    loan_approved_at?: string | null;
  }>;

  const linkRows = responseLinks as Array<{
    application_id: string;
    role: string;
    submitted_at: string | null;
  }>;

  const rows: ApplicantRow[] = buildApplicantRows(appRows, linkRows);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Applications</h1>
      <p className="text-muted-foreground text-sm mb-4">
        One row per applicant. Checklist tracks journey from prelim → final → guarantor/references → interview → Loan Approved.
      </p>
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Applicant</th>
              <th className="text-left p-3 font-medium">Phone</th>
              <th className="text-left p-3 font-medium">Prelim submitted</th>
              <th className="text-left p-3 font-medium">Final application</th>
              <th className="text-left p-3 font-medium">Guarantor</th>
              <th className="text-left p-3 font-medium">References</th>
              <th className="text-left p-3 font-medium">Interview</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Loan approved</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.primaryApplicationId} className="border-b">
                <td className="p-3">
                  <Link
                    href={`/admin/applications/${row.primaryApplicationId}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {row.applicantName}
                  </Link>
                  {row.applicantEmail && (
                    <span className="block text-muted-foreground text-xs mt-0.5">{row.applicantEmail}</span>
                  )}
                </td>
                <td className="p-3">{row.applicantPhone}</td>
                <td className="p-3">
                  {row.prelimSubmittedAt
                    ? new Date(row.prelimSubmittedAt).toLocaleDateString()
                    : '—'}
                </td>
                <td className="p-3">
                  {row.finalSubmittedAt
                    ? new Date(row.finalSubmittedAt).toLocaleDateString()
                    : '—'}
                </td>
                <td className="p-3">
                  {row.guarantorReceived ? '✓ Received' : '—'}
                  {row.guarantorReceived && (
                    <span className={row.guarantorApproved ? ' text-green-600' : ''}>
                      {row.guarantorApproved ? ' ✓ Approved' : ''}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {row.referencesReceived
                    ? `✓ ${row.referencesReceivedCount}/${row.referenceCount} received`
                    : row.referenceCount > 0
                      ? `0/${row.referenceCount}`
                      : '—'}
                  {row.referencesReceived && (
                    <span className={row.referencesApproved ? ' text-green-600' : ''}>
                      {row.referencesApproved ? ' ✓ Approved' : ''}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {row.interviewDate
                    ? new Date(row.interviewDate).toLocaleDateString()
                    : '—'}
                  {row.interviewNotes && (
                    <span className="block text-muted-foreground text-xs mt-0.5" title={row.interviewNotes}>
                      {row.interviewNotes.slice(0, 30)}
                      {row.interviewNotes.length > 30 ? '…' : ''}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {canEdit ? (
                    <StatusSelect
                      applicationId={row.primaryApplicationId}
                      currentStatus={row.status}
                    />
                  ) : (
                    getStatusLabel(row.status)
                  )}
                </td>
                <td className="p-3">
                  {row.loanApprovedAt
                    ? new Date(row.loanApprovedAt).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="text-muted-foreground py-8 text-center">No applications yet.</p>
      )}
    </div>
  );
}
