'use client';

import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { APPLICATION_STATUS_LABELS } from '@/lib/applications';
import type { EmailTemplateId } from '@/lib/email-templates';
import { sendApplicantStatusEmail } from './actions';

type FilledTemplate = { subject: string; bodyText: string };

type Props = {
  applicationId: string;
  applicantEmail: string | null;
  currentStatus: string;
  /** Pre-filled templates (subject + body text) for each status email type. */
  templates: Record<EmailTemplateId, FilledTemplate>;
};

const TEMPLATE_IDS: EmailTemplateId[] = [
  'invite_full_application',
  'pending',
  'not_now',
];

const TEMPLATE_LABELS: Record<EmailTemplateId, string> = {
  invite_full_application: 'Invite for Full Application',
  pending: 'Pending',
  not_now: 'Not Now',
};

export function EmailApplicantForm({
  applicationId,
  applicantEmail,
  currentStatus,
  templates,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<EmailTemplateId | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
  };

  const loadTemplate = (templateId: EmailTemplateId) => {
    const t = templates[templateId];
    if (t) {
      setSubject(t.subject);
      setBody(t.bodyText);
      setSelectedTemplateId(templateId);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as EmailTemplateId | '';
    if (value) loadTemplate(value);
    else {
      setSelectedTemplateId('');
      setSubject('');
      setBody('');
    }
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      showModal('Missing information', 'Please enter subject and message body.');
      return;
    }
    startTransition(async () => {
      const result = await sendApplicantStatusEmail(
        applicationId,
        subject,
        body,
        selectedTemplateId || undefined
      );
      if (result?.error) {
        showModal('Unable to send email', result.error);
        return;
      }
      showModal('Email sent', 'Email sent.');
      router.refresh();
    });
  };

  if (!applicantEmail) {
    return (
      <p className="text-muted-foreground text-sm">
        No applicant email on this application. Add an email to send a message.
      </p>
    );
  }

  const statusSuggestsTemplate =
    currentStatus === 'invite_full_application' ||
    currentStatus === 'pending' ||
    currentStatus === 'not_now';
  const suggestedId =
    statusSuggestsTemplate && (currentStatus as EmailTemplateId) in templates
      ? (currentStatus as EmailTemplateId)
      : null;

  return (
    <div className="space-y-4 rounded-md border bg-muted/20 p-4">
      <p className="text-sm text-muted-foreground">
        Draft an email from a template (e.g. after setting status to &quot;Invite for Full Application&quot;, &quot;Pending&quot;, or &quot;Not Now&quot;). Edit as needed and send.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email-template" className="block text-sm font-medium mb-1">
            Template
          </label>
          <select
            id="email-template"
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            onFocus={() => {
              if (!selectedTemplateId && suggestedId) loadTemplate(suggestedId);
            }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full max-w-xs"
          >
            <option value="">— Choose template —</option>
            {TEMPLATE_IDS.map((id) => (
              <option key={id} value={id}>
                {TEMPLATE_LABELS[id]}
              </option>
            ))}
          </select>
          {suggestedId && !selectedTemplateId && (
            <button
              type="button"
              onClick={() => loadTemplate(suggestedId)}
              className="mt-1 text-sm text-primary hover:underline"
            >
              Use &quot;{APPLICATION_STATUS_LABELS[currentStatus] ?? currentStatus}&quot; template
            </button>
          )}
        </div>
        <div>
          <span className="block text-sm font-medium mb-1">To</span>
          <span className="text-sm text-muted-foreground">{applicantEmail}</span>
        </div>
      </div>
      <div>
        <label htmlFor="email-subject" className="block text-sm font-medium mb-1">
          Subject
        </label>
        <input
          id="email-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={isPending}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full max-w-xl"
          placeholder="Email subject"
        />
      </div>
      <div>
        <label htmlFor="email-body" className="block text-sm font-medium mb-1">
          Message (edit as needed)
        </label>
        <p className="text-sm text-muted-foreground mb-2">
          When sending the &quot;Invite for Full Application&quot; template, a unique link with a token is added automatically so the applicant can pre-fill their form. Do not delete the application link (the URL) in the message—it will be replaced with the tokenized link when the email is sent.
        </p>
        <textarea
          id="email-body"
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isPending}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full max-w-xl font-mono text-sm"
          placeholder="Message body"
        />
      </div>
      <Button type="button" onClick={handleSend} disabled={isPending || !subject.trim() || !body.trim()}>
        {isPending ? 'Sending…' : 'Send email'}
      </Button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>{modalMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setModalOpen(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
