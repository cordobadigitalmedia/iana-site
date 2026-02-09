import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin-auth';
import { sql } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminApplicationsListPage() {
  const admin = await getAdminUser();
  if (!admin || admin.role !== 'admin') {
    redirect('/admin/access-denied');
  }

  const applications = await sql`
    SELECT id, application_type, status, submitted_at, applicant_email
    FROM applications
    ORDER BY submitted_at DESC
  `;

  const rows = applications as Array<{
    id: string;
    application_type: string;
    status: string;
    submitted_at: string | null;
    applicant_email: string | null;
  }>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Applications</h1>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Application ID</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Applicant email</th>
              <th className="text-left p-3 font-medium">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="p-3">
                  <Link href={`/admin/applications/${row.id}`} className="text-primary hover:underline font-mono">
                    {row.id.slice(0, 8)}…
                  </Link>
                </td>
                <td className="p-3">{row.application_type}</td>
                <td className="p-3">{row.status}</td>
                <td className="p-3">{row.applicant_email ?? '—'}</td>
                <td className="p-3">
                  {row.submitted_at
                    ? new Date(row.submitted_at).toLocaleDateString()
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
