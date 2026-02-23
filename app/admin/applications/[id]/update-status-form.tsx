'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { APPLICATION_STATUS_LABELS } from '@/lib/applications';
import { updateApplicationStatus } from './actions';

const STATUS_OPTIONS = [
  'submitted',
  'not_now',
  'pending',
  'invite_full_application',
  'awaiting_final_application',
  'awaiting_interview',
  'approved',
] as const;

type Props = {
  applicationId: string;
  currentStatus: string;
};

export function UpdateStatusForm({ applicationId, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await updateApplicationStatus(applicationId, formData);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
      <label htmlFor="status" className="text-sm font-medium">
        Status
      </label>
      <select
        id="status"
        name="status"
        defaultValue={currentStatus}
        disabled={isPending}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 min-w-44"
      >
        {STATUS_OPTIONS.map((value) => (
          <option key={value} value={value}>
            {APPLICATION_STATUS_LABELS[value] ?? value}
          </option>
        ))}
        {/* Legacy values may exist in DB; show if current status is one of these */}
        {!STATUS_OPTIONS.includes(currentStatus as (typeof STATUS_OPTIONS)[number]) && (
          <option value={currentStatus}>{APPLICATION_STATUS_LABELS[currentStatus] ?? currentStatus}</option>
        )}
      </select>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Updating…' : 'Update status'}
      </Button>
    </form>
  );
}
