import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminUser } from '@/lib/admin-auth';
import { sql } from '@/lib/db';
import { getOrderedFieldNames } from '@/lib/forms/field-order';
import { getApplicantName, getApplicantPhone, getStatusLabel, getApplicationTypeLabel } from '@/lib/applications';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

type AppRow = {
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
};

type LinkRow = {
  id: string;
  application_id: string;
  role: string;
  reference_index: number;
  email: string;
  submitted_at: string | null;
  answers: Record<string, string> | null;
  document_url: string | null;
};

type NoteRow = {
  id: string;
  application_id: string;
  type: string;
  content: string;
  created_at: string;
  author_email: string | null;
};

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
  const currentApp = appRows[0] as AppRow | undefined;

  if (!currentApp) notFound();

  const allApplications: AppRow[] =
    currentApp.applicant_email != null
      ? (await sql`
          SELECT id, application_type, status, submitted_at, applicant_email, form_data,
                 guarantor_approved, references_approved, interview_date, interview_notes, loan_approved_at
          FROM applications
          WHERE applicant_email = ${currentApp.applicant_email}
          ORDER BY submitted_at DESC NULLS LAST
        `) as AppRow[]
      : [currentApp];

  const appIds = allApplications.map((a) => a.id);

  const linksByAppId: Record<string, LinkRow[]> = {};
  if (currentApp.applicant_email != null && appIds.length > 0) {
    const linksRows = (await sql`
      SELECT rl.id, rl.application_id, rl.role, rl.reference_index, rl.email, rl.submitted_at, rl.answers, rl.document_url
      FROM response_links rl
      JOIN applications a ON a.id = rl.application_id
      WHERE a.applicant_email = ${currentApp.applicant_email}
      ORDER BY rl.application_id, rl.role, rl.reference_index
    `) as LinkRow[];
    for (const row of linksRows) {
      if (!linksByAppId[row.application_id]) linksByAppId[row.application_id] = [];
      linksByAppId[row.application_id].push(row);
    }
  }
  if (currentApp.applicant_email == null) {
    const singleLinks = (await sql`
      SELECT id, application_id, role, reference_index, email, submitted_at, answers, document_url
      FROM response_links
      WHERE application_id = ${id}
      ORDER BY role, reference_index
    `) as LinkRow[];
    linksByAppId[id] = singleLinks;
  }

  const notesByAppId: Record<string, NoteRow[]> = {};
  if (appIds.length > 0) {
    const notesQuery =
      currentApp.applicant_email != null
        ? sql`
            SELECT n.id, n.application_id, n.type, n.content, n.created_at, u.email AS author_email
            FROM application_notes n
            JOIN admin_users u ON u.id = n.admin_user_id
            JOIN applications a ON a.id = n.application_id
            WHERE a.applicant_email = ${currentApp.applicant_email}
            ORDER BY n.application_id, n.created_at DESC
          `
        : sql`
            SELECT n.id, n.application_id, n.type, n.content, n.created_at, u.email AS author_email
            FROM application_notes n
            JOIN admin_users u ON u.id = n.admin_user_id
            WHERE n.application_id = ${id}
            ORDER BY n.created_at DESC
          `;
    const notesRows = (await notesQuery) as NoteRow[];
    for (const row of notesRows) {
      if (!notesByAppId[row.application_id]) notesByAppId[row.application_id] = [];
      notesByAppId[row.application_id].push(row);
    }
  }

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

  const applicantName =
    allApplications.length > 0
      ? getApplicantName((allApplications[0].form_data || {}) as Record<string, unknown>)
      : 'Applicant';

  const preliminaries = allApplications.filter((a) => a.application_type !== 'final');
  const finalApplication = allApplications.find((a) => a.application_type === 'final');
  const defaultTab = currentApp.application_type === 'final' ? 'final' : 'preliminaries';

  const buildPrelimSectionsAndContent = (app: AppRow) => {
    const formData = (app.form_data || {}) as Record<string, unknown>;
    const fileKeys = Object.keys(formData).filter(
      (k) =>
        typeof formData[k] === 'string' &&
        (formData[k] as string).startsWith('http')
    );
    const orderedFieldNames = getOrderedFieldNames(app.application_type);
    const notes = (notesByAppId[app.id] ?? []).map((r) => ({
      id: r.id,
      type: r.type,
      content: r.content,
      author_email: r.author_email,
      created_at: r.created_at,
    }));
    const sections: SectionSpec[] = [
      { value: 'overview', title: 'Overview' },
      ...(canEdit ? [{ value: 'email', title: 'Email applicant' }] : []),
      { value: 'form', title: 'Form data' },
      ...(fileKeys.length > 0 ? [{ value: 'documents', title: 'Application documents' }] : []),
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
          <UpdateStatusForm key={app.status} applicationId={app.id} currentStatus={app.status} />
        )}
      </div>
    );
    const emailContent = canEdit ? (
      <EmailApplicantForm
        applicationId={app.id}
        applicantEmail={app.applicant_email}
        currentStatus={app.status}
        templates={filledTemplates}
      />
    ) : null;
    const formContent = (
      <FormDataView
        formData={formData}
        fileKeys={fileKeys}
        applicationId={app.id}
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
    const notesContent = (
      <NotesSection applicationId={app.id} notes={notes} canEdit={canEdit} />
    );
    const accordionChildren = [
      overviewContent,
      ...(canEdit ? [emailContent] : []),
      formContent,
      ...(fileKeys.length > 0 ? [documentsContent] : []),
      notesContent,
    ];
    return { sections, accordionChildren };
  };

  const buildFinalSectionsAndContent = (app: AppRow) => {
    const formData = (app.form_data || {}) as Record<string, unknown>;
    const fileKeys = Object.keys(formData).filter(
      (k) =>
        typeof formData[k] === 'string' &&
        (formData[k] as string).startsWith('http')
    );
    const orderedFieldNames = getOrderedFieldNames(app.application_type);
    const linkRows = linksByAppId[app.id] ?? [];
    const notes = (notesByAppId[app.id] ?? []).map((r) => ({
      id: r.id,
      type: r.type,
      content: r.content,
      author_email: r.author_email,
      created_at: r.created_at,
    }));
    const sections: SectionSpec[] = [
      { value: 'overview', title: 'Overview' },
      ...(canEdit ? [{ value: 'email', title: 'Email applicant' }] : []),
      ...(canEdit ? [{ value: 'checklist', title: 'Checklist' }] : []),
      { value: 'form', title: 'Form data' },
      ...(fileKeys.length > 0 ? [{ value: 'documents', title: 'Application documents' }] : []),
      ...(linkRows.length > 0 ? [{ value: 'guarantor-refs', title: 'Guarantor & references' }] : []),
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
          <UpdateStatusForm key={app.status} applicationId={app.id} currentStatus={app.status} />
        )}
      </div>
    );
    const emailContent = canEdit ? (
      <EmailApplicantForm
        applicationId={app.id}
        applicantEmail={app.applicant_email}
        currentStatus={app.status}
        templates={filledTemplates}
      />
    ) : null;
    const checklistContent = canEdit ? (
      <ChecklistForm
        applicationId={app.id}
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
        applicationId={app.id}
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
      linkRows.length > 0 ? (
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
      <NotesSection applicationId={app.id} notes={notes} canEdit={canEdit} />
    );
    const accordionChildren = [
      overviewContent,
      ...(canEdit ? [emailContent] : []),
      ...(canEdit ? [checklistContent] : []),
      formContent,
      ...(fileKeys.length > 0 ? [documentsContent] : []),
      ...(linkRows.length > 0 ? [guarantorRefsContent] : []),
      notesContent,
    ];
    return { sections, accordionChildren };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/applications">Back to list</Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {applicantName !== '—' ? applicantName : 'Applicant'}
        </h1>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-4 flex h-auto flex-wrap gap-1 bg-muted/60 p-2">
          <TabsTrigger
            value="preliminaries"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Preliminaries {preliminaries.length > 0 && `(${preliminaries.length})`}
          </TabsTrigger>
          <TabsTrigger
            value="final"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Final application
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preliminaries" className="mt-2">
          {preliminaries.length === 0 ? (
            <p className="text-muted-foreground">No preliminary applications.</p>
          ) : (
            <Accordion
              type="multiple"
              defaultValue={currentApp.application_type !== 'final' ? [id] : [preliminaries[0]!.id]}
              className="w-full space-y-2"
            >
              {preliminaries.map((app) => {
                const { sections, accordionChildren } = buildPrelimSectionsAndContent(app);
                const typeLabel = getApplicationTypeLabel(app.application_type);
                const dateStr = app.submitted_at
                  ? new Date(app.submitted_at).toLocaleDateString()
                  : '—';
                return (
                  <AccordionItem key={app.id} value={app.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-base font-semibold hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:pb-3 [&[data-state=open]]:mb-0">
                      {typeLabel} ({dateStr})
                    </AccordionTrigger>
                    <AccordionContent>
                      <ApplicationDetailAccordion sections={sections} defaultOpen={['overview', 'form']}>
                        {accordionChildren}
                      </ApplicationDetailAccordion>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="final" className="mt-2">
          {finalApplication ? (
            (() => {
              const { sections, accordionChildren } = buildFinalSectionsAndContent(finalApplication);
              return (
                <ApplicationDetailAccordion sections={sections} defaultOpen={['overview', 'form']}>
                  {accordionChildren}
                </ApplicationDetailAccordion>
              );
            })()
          ) : (
            <p className="text-muted-foreground">No final application submitted.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
