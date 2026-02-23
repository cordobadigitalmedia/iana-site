'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { updateChecklist, approveLoan } from './actions';

type Props = {
  applicationId: string;
  applicationType: string;
  guarantorApproved: boolean;
  referencesApproved: boolean;
  interviewDate: string | null;
  interviewNotes: string | null;
  loanApprovedAt: string | null;
};

export function ChecklistForm({
  applicationId,
  applicationType,
  guarantorApproved,
  referencesApproved,
  interviewDate,
  interviewNotes,
  loanApprovedAt,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [approvePending, setApprovePending] = useTransition();
  const isFinal = applicationType === 'final';
  const canApprove = isFinal && !loanApprovedAt;

  function handleChecklistSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await updateChecklist(applicationId, formData);
      router.refresh();
    });
  }

  function handleApprove() {
    setApprovePending(async () => {
      const result = await approveLoan(applicationId);
      if (result?.error) alert(result.error);
      router.refresh();
    });
  }

  if (!isFinal) {
    return (
      <p className="text-muted-foreground text-sm">
        Checklist (guarantor, references, interview) applies once the applicant has submitted their final application.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleChecklistSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="guarantor_approved"
              value="true"
              defaultChecked={guarantorApproved}
              disabled={isPending}
              className="rounded border-input"
            />
            <input type="hidden" name="guarantor_approved" value="false" />
            <span className="text-sm font-medium">Guarantor information approved</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="references_approved"
              value="true"
              defaultChecked={referencesApproved}
              disabled={isPending}
              className="rounded border-input"
            />
            <input type="hidden" name="references_approved" value="false" />
            <span className="text-sm font-medium">References received / approved</span>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="interview_date" className="block text-sm font-medium mb-1">
              Interview date
            </label>
            <input
              type="date"
              id="interview_date"
              name="interview_date"
              defaultValue={interviewDate ?? ''}
              disabled={isPending}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full max-w-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="interview_notes" className="block text-sm font-medium mb-1">
              Interview notes
            </label>
            <textarea
              id="interview_notes"
              name="interview_notes"
              rows={3}
              defaultValue={interviewNotes ?? ''}
              disabled={isPending}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full max-w-xl"
              placeholder="Brief notes from the interview…"
            />
          </div>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save checklist'}
        </Button>
      </form>

      {canApprove && (
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            When guarantor, references, and interview are complete, click below to approve the loan. The system will draft a loan agreement and send an award email to the applicant.
          </p>
          <Button
            type="button"
            onClick={handleApprove}
            disabled={approvePending}
            className="bg-green-600 hover:bg-green-700"
          >
            {approvePending ? 'Processing…' : 'Loan Approved'}
          </Button>
        </div>
      )}

      {loanApprovedAt && (
        <p className="text-sm text-green-600 font-medium">
          Loan approved on {new Date(loanApprovedAt).toLocaleString()}. Award email sent; agreement draft logged.
        </p>
      )}
    </div>
  );
}
