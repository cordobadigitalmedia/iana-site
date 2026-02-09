import { notFound } from 'next/navigation';
import { getResponseLinkByToken, getApplicationApplicantName } from '@/lib/respond';
import { REFERENCE_QUESTIONS } from '@/lib/respond-questions';
import { ReferenceRespondForm } from './reference-respond-form';

export const dynamic = 'force-dynamic';

export default async function ReferenceRespondPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const link = await getResponseLinkByToken(token);
  if (!link) notFound();
  if (link.submitted_at) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Already submitted</h1>
        <p className="text-muted-foreground">This reference form has already been submitted. Thank you.</p>
      </div>
    );
  }
  if (link.role !== 'reference') notFound();

  const applicantName = await getApplicationApplicantName(link.application_id);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Reference form</h1>
      <p className="text-muted-foreground mb-6">
        You have been listed as a reference for <strong>{applicantName || 'the applicant'}</strong>.
        Please answer the questions below and upload your letter of reference.
      </p>
      <ReferenceRespondForm token={token} questions={REFERENCE_QUESTIONS} />
    </div>
  );
}
