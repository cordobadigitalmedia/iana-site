'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitGuarantorResponse } from './actions';

type Question = { key: string; label: string };

export function GuarantorRespondForm({
  token,
  questions,
}: {
  token: string;
  questions: readonly Question[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!file) {
        setError('Please upload your government-issued ID.');
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.set('file', file);
      formData.set('token', token);
      formData.set('type', 'guarantor-id');

      const res = await fetch('/api/respond/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Upload failed.');
        setSubmitting(false);
        return;
      }

      const documentUrl = data.url as string;
      const result = await submitGuarantorResponse(token, answers, documentUrl);

      if (!result.success) {
        setError(result.error || 'Submission failed.');
        setSubmitting(false);
        return;
      }

      router.push(`/respond/guarantor/${token}/thank-you`);
    } catch {
      setError('An error occurred. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((q) => (
        <div key={q.key}>
          <Label htmlFor={q.key}>{q.label}</Label>
          <textarea
            id={q.key}
            name={q.key}
            required
            rows={4}
            className="mt-1 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={answers[q.key] ?? ''}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))}
          />
        </div>
      ))}

      <div>
        <Label htmlFor="document">Government-issued ID (required)</Label>
        <Input
          id="document"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          required
          className="mt-1"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
