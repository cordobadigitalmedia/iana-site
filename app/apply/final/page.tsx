import type { Metadata } from "next";
import { readNav } from "@/lib/content/nav";
import { readHeader } from "@/lib/content/header";
import { readFooter } from "@/lib/content/footer";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { submitFinalApplication } from "./actions";
import fieldDefinitions from "@/lib/forms/schemas/final-application-fields.json";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Final Interest-Free Loan Application | IANA Financial",
  description: "Submit your final interest-free loan application.",
};

export default async function FinalApplicationPage() {
  const [nav, header, footer] = await Promise.all([
    readNav(),
    readHeader(),
    readFooter(),
  ]);

  return (
    <>
      <SiteHeader nav={nav as any} header={header as any} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        <div className="grow container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8">
                <h1 className="text-3xl font-bold mb-6">Final Interest-Free Loan Application</h1>
                <p className="text-muted-foreground mb-8">
                  Please fill out all required fields. Your information will be saved automatically as you type.
                </p>
                <ApplicationForm
                  fields={fieldDefinitions.fields}
                  sections={fieldDefinitions.sections}
                  formKey="final"
                  onSubmit={submitFinalApplication}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer footer={footer as any} />
      </div>
    </>
  );
}


