'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { APPLICATION_STATUS_LABELS } from '@/lib/applications';
import { updateApplicationStatus } from './[id]/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const STATUS_CHANGE_EMAIL_REMINDER =
  "Don't forget to go to the Email application section of the concerned application to send the appropriate email template based on the status change you updated";

const STATUS_OPTIONS = [
  'submitted',
  'not_now',
  'pending',
  'invite_full_application',
  'awaiting_final_application',
  'awaiting_interview',
  'approved',
  'contract_signed',
] as const;

type Props = {
  applicationId: string;
  currentStatus: string;
};

export function StatusSelect({ applicationId, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showReminder, setShowReminder] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    if (!newStatus) return;
    const formData = new FormData();
    formData.set('status', newStatus);
    startTransition(async () => {
      await updateApplicationStatus(applicationId, formData);
      setShowReminder(true);
      router.refresh();
    });
  }

  return (
    <>
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className="rounded-md border border-input bg-background px-2 py-1.5 text-sm disabled:opacity-50 min-w-40 w-full max-w-48"
        aria-label="Change status"
      >
        {STATUS_OPTIONS.map((value) => (
          <option key={value} value={value}>
            {APPLICATION_STATUS_LABELS[value] ?? value}
          </option>
        ))}
        {!STATUS_OPTIONS.includes(currentStatus as (typeof STATUS_OPTIONS)[number]) && (
          <option value={currentStatus}>{APPLICATION_STATUS_LABELS[currentStatus] ?? currentStatus}</option>
        )}
      </select>

      <Dialog open={showReminder} onOpenChange={setShowReminder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Status updated</DialogTitle>
            <DialogDescription>{STATUS_CHANGE_EMAIL_REMINDER}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setShowReminder(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
