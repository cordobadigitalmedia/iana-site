import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminUser } from '@/lib/admin-auth';
import { sql } from '@/lib/db';
import { getOrderedFieldNames } from '@/lib/forms/field-order';
import { getApplicantName, getApplicantPhone, getStatusLabel, getApplicationTypeLabel } from '@/lib/applications';
import { Button } from '@/components/ui/button';
import {
  APPLICANT_EMAIL_TEMPLATES,
  fillTemplate,
  type EmailTemplateId,
} from '@/lib/email-templates';
import { UpdateStatusForm } from './update-status-form';
import { ChecklistForm } from './checklist-form';
import { EmailApplicantForm } from './email-applicant-form';
import { FormDataView } from './form-data-view';
import { NotesSection } from './notes-section';
import { DocumentPreviewLink } from './document-preview-dialog';
import { ApplicationDetailAccordion, type SectionSpec } from './application-detail-accordion';

export const dynamic = 'force-dynamic';

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAdminUser();
  if (!user) {
    redirect('/admin/access-denied');
  }
  const canEdit = user.role === 'admin';

  const { id } = await params;

  const appRows = await sql`
    SELECT id, application_type, status, submitted_at, applicant_email, form_data,
           guarantor_approved, references_approved, interview_date, interview_notes, loan_approved_at
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
    guarantor_approved: boolean | null;
    references_approved: boolean | null;
    interview_date: string | null;
    interview_notes: string | null;
    loan_approved_at: string | null;
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

  const templateIds: EmailTemplateId[] = [
    'invite_full_application',
    'pending',
    'not_now',
  ];
  const filledTemplates = Object.fromEntries(
    templateIds.map((tid) => {
      const filled = fillTemplate(APPLICANT_EMAIL_TEMPLATES[tid]);
      return [tid, { subject: filled.subject, bodyText: filled.bodyText }];
    })
  ) as Record<EmailTemplateId, { subject: string; bodyText: string }>;

  const notesRows = await sql`
    SELECT n.id, n.type, n.content, n.created_at, u.email AS author_email
    FROM application_notes n
    JOIN admin_users u ON u.id = n.admin_user_id
    WHERE n.application_id = ${id}
    ORDER BY n.created_at DESC
  `;
  const notes = (notesRows as Array<{
    id: string;
    type: string;
    content: string;
    created_at: string;
    author_email: string | null;
  }>).map((r) => ({
    id: r.id,
    type: r.type,
    content: r.content,
    author_email: r.author_email,
    created_at: r.created_at,
  }));

  const applicationTypeLabel = getApplicationTypeLabel(app.application_type);

  const sections: SectionSpec[] = [
    { value: 'overview', title: 'Overview' },
    ...(canEdit ? [{ value: 'email', title: 'Email applicant' }] : []),
    ...(canEdit ? [{ value: 'checklist', title: 'Checklist' }] : []),
    { value: 'form', title: 'Form data' },
    ...(fileKeys.length > 0 ? [{ value: 'documents', title: 'Application documents' }] : []),
    ...(app.application_type === 'final' && linkRows.length > 0
      ? [{ value: 'guarantor-refs', title: 'Guarantor & references' }]
      : []),
    { value: 'notes', title: 'Notes & comments' },
  ];

  const overviewContent = (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        <strong>Applicant:</strong> {getApplicantName(formData)} · {getApplicantPhone(formData)}
      </p>
      <p className="text-muted-foreground">
        <strong>Status:</strong> {getStatusLabel(app.status)} ·{' '}
        <strong>Submitted:</strong>{' '}
        {app.submitted_at ? new Date(app.submitted_at).toLocaleString() : '—'}
      </p>
      <p className="text-muted-foreground">
        <strong>Email:</strong> {app.applicant_email ?? '—'}
      </p>
      {canEdit && (
        <UpdateStatusForm key={app.status} applicationId={id} currentStatus={app.status} />
      )}
    </div>
  );

  const emailContent = canEdit ? (
    <EmailApplicantForm
      applicationId={id}
      applicantEmail={app.applicant_email}
      currentStatus={app.status}
      templates={filledTemplates}
    />
  ) : null;

  const checklistContent = canEdit ? (
    <ChecklistForm
      applicationId={id}
      applicationType={app.application_type}
      guarantorApproved={app.guarantor_approved ?? false}
      referencesApproved={app.references_approved ?? false}
      interviewDate={app.interview_date}
      interviewNotes={app.interview_notes}
      loanApprovedAt={app.loan_approved_at}
    />
  ) : null;

  const formContent = (
    <FormDataView
      formData={formData}
      fileKeys={fileKeys}
      applicationId={id}
      orderedFieldNames={orderedFieldNames}
    />
  );

  const documentsContent =
    fileKeys.length > 0 ? (
      <ul className="list-disc list-inside space-y-1">
        {fileKeys.map((key) => (
          <li key={key}>
            <DocumentPreviewLink
              label={key.replace(/_/g, ' ')}
              url={formData[key] as string}
              className="text-primary hover:underline"
            >
              {key.replace(/_/g, ' ')} (preview)
            </DocumentPreviewLink>
          </li>
        ))}
      </ul>
    ) : null;

  const guarantorRefsContent =
    app.application_type === 'final' && linkRows.length > 0 ? (
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
                    <DocumentPreviewLink
                      label={link.role === 'guarantor' ? 'Government ID' : 'Letter of reference'}
                      url={link.document_url}
                      className="text-primary hover:underline text-sm"
                    >
                      {link.role === 'guarantor' ? 'Government ID' : 'Letter of reference'} (preview)
                    </DocumentPreviewLink>
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const notesContent = (
    <NotesSection applicationId={id} notes={notes} canEdit={canEdit} />
  );

  const accordionChildren = [
    overviewContent,
    ...(canEdit ? [emailContent] : []),
    ...(canEdit ? [checklistContent] : []),
    formContent,
    ...(fileKeys.length > 0 ? [documentsContent] : []),
    ...(app.application_type === 'final' && linkRows.length > 0 ? [guarantorRefsContent] : []),
    notesContent,
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/applications">Back to list</Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">
          {applicationTypeLabel}
        </h1>
        <p className="text-muted-foreground text-sm">
          Application ID: {app.id.slice(0, 8)}…
        </p>
      </div>

      <ApplicationDetailAccordion sections={sections} defaultOpen={['overview', 'form']}>
        {accordionChildren}
      </ApplicationDetailAccordion>
    </div>
  );
}
