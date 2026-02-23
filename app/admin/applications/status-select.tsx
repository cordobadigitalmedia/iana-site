'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { APPLICATION_STATUS_LABELS } from '@/lib/applications';
import { updateApplicationStatus } from './[id]/actions';

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

export function StatusSelect({ applicationId, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    if (!newStatus) return;
    const formData = new FormData();
    formData.set('status', newStatus);
    startTransition(async () => {
      await updateApplicationStatus(applicationId, formData);
      router.refresh();
    });
  }

  return (
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
  );
}
