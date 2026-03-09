import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getContractByToken } from './actions';
import { ContractSignForm } from './contract-sign-form';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function ContractPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { found, contractContent, alreadySigned } = await getContractByToken(token);

  if (!found) notFound();
  if (!contractContent?.trim()) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Contract not ready</h1>
        <p className="text-muted-foreground">This contract link is not yet ready. Please contact IANA Financial.</p>
      </div>
    );
  }

  if (alreadySigned) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Contract already submitted</h1>
        <p className="text-muted-foreground mb-6">
          Thank you. Your signed contract has already been received.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Return to IANA Financial</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Review and sign your loan agreement</h1>
        <p className="text-muted-foreground">
          Your interest-free loan has been approved. Please review the contract below, download and sign it, then upload the signed copy and submit.
        </p>
      </div>
      <ContractSignForm token={token} contractContent={contractContent} />
    </div>
  );
}
