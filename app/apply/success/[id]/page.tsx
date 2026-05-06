import type { Metadata } from "next";
import { readNav } from "@/lib/content/nav";
import { readHeader } from "@/lib/content/header";
import { readFooter } from "@/lib/content/footer";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Application Submitted - ${id} | IANA Financial`,
    description: "Your application has been successfully submitted.",
  };
}

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [nav, header, footer] = await Promise.all([
    readNav(),
    readHeader(),
    readFooter(),
  ]);

  return (
    <>
      <SiteHeader nav={nav as any} header={header as any} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        <div className="grow container mx-auto px-4 py-8 max-w-3xl">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold">Application Submitted Successfully</h1>
            <p className="text-muted-foreground">
              Your application has been received and will be reviewed by our team.
            </p>
            <div className="bg-muted p-6 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Your Application ID:</p>
              <p className="text-2xl font-mono font-bold">{id}</p>
              <p className="text-sm text-muted-foreground mt-4">
                Please save this ID for your records. You may be contacted using the email address you provided.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                What happens next?
              </p>
              <ul className="text-left space-y-2 text-muted-foreground max-w-md mx-auto">
                <li>• Your application will be reviewed by our team</li>
                <li>• You may be contacted for additional information</li>
                <li>• A decision will be communicated to you via email</li>
              </ul>
            </div>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/start-applying">Back to Applications</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer footer={footer as any} />
      </div>
    </>
  );
}


