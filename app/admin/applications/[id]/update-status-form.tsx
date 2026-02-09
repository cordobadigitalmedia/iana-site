'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { updateApplicationStatus } from './actions';

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
        className="rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
      >
        <option value="submitted">Submitted</option>
        <option value="reviewed">Reviewed</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Updating…' : 'Update status'}
      </Button>
    </form>
  );
}
