import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminUser } from '@/lib/admin-auth';
import { sql } from '@/lib/db';
import { getOrderedFieldNames } from '@/lib/forms/field-order';
import { Button } from '@/components/ui/button';
import { UpdateStatusForm } from './update-status-form';
import { FormDataView } from './form-data-view';

export const dynamic = 'force-dynamic';

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getAdminUser();
  if (!admin || admin.role !== 'admin') {
    redirect('/admin/access-denied');
  }

  const { id } = await params;

  const appRows = await sql`
    SELECT id, application_type, status, submitted_at, applicant_email, form_data
    FROM applications
    WHERE id = ${id}
    LIMIT 1
  `;
  const app = appRows[0] as {
    id: string;
    application_type: string;
    status: string;
    submitted_at: string | null;
    applicant_email: string | null;
    form_data: Record<string, unknown>;
  } | undefined;

  if (!app) notFound();

  const links =
    app.application_type === 'final'
      ? await sql`
          SELECT id, role, reference_index, email, submitted_at, answers, document_url
          FROM response_links
          WHERE application_id = ${id}
          ORDER BY role, reference_index
        `
      : [];

  const linkRows = links as Array<{
    id: string;
    role: string;
    reference_index: number;
    email: string;
    submitted_at: string | null;
    answers: Record<string, string> | null;
    document_url: string | null;
  }>;

  const formData = (app.form_data || {}) as Record<string, unknown>;
  const fileKeys = Object.keys(formData).filter(
    (k) =>
      typeof formData[k] === 'string' &&
      (formData[k] as string).startsWith('http')
  );
  const orderedFieldNames = getOrderedFieldNames(app.application_type);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/applications">Back to list</Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Application {app.id.slice(0, 8)}…</h1>
        <p className="text-muted-foreground">
          Type: {app.application_type} · Status: {app.status} · Submitted:{' '}
          {app.submitted_at ? new Date(app.submitted_at).toLocaleString() : '—'}
        </p>
        <p className="text-muted-foreground">Applicant email: {app.applicant_email ?? '—'}</p>

        <UpdateStatusForm key={app.status} applicationId={id} currentStatus={app.status} />
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Form data</h2>
        <FormDataView
          formData={formData}
          fileKeys={fileKeys}
          applicationId={id}
          orderedFieldNames={orderedFieldNames}
        />
      </section>

      {fileKeys.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Application documents</h2>
          <ul className="list-disc list-inside space-y-1">
            {fileKeys.map((key) => (
              <li key={key}>
                <a
                  href={formData[key] as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {key.replace(/_/g, ' ')} (open)
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {app.application_type === 'final' && linkRows.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Guarantor & references</h2>
          <div className="space-y-6">
            {linkRows.map((link) => (
              <div key={link.id} className="rounded-md border p-4">
                <p className="font-medium">
                  {link.role === 'guarantor'
                    ? 'Guarantor'
                    : `Reference ${link.reference_index}`}{' '}
                  · {link.email} ·{' '}
                  {link.submitted_at ? (
                    <span className="text-green-600">Submitted</span>
                  ) : (
                    <span className="text-amber-600">Pending</span>
                  )}
                </p>
                {link.submitted_at && (
                  <>
                    {link.answers && (
                      <div className="mt-3 text-sm">
                        {Object.entries(link.answers).map(([q, a]) => (
                          <div key={q} className="mb-2">
                            <span className="text-muted-foreground">{q}:</span>{' '}
                            {String(a).slice(0, 200)}
                            {String(a).length > 200 ? '…' : ''}
                          </div>
                        ))}
                      </div>
                    )}
                    {link.document_url && (
                      <p className="mt-2">
                        <a
                          href={link.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          {link.role === 'guarantor' ? 'Government ID' : 'Letter of reference'} (open)
                        </a>
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
