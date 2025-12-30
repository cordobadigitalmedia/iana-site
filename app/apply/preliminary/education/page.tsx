import type { Metadata } from "next";
import { PreliminaryApplicationPage } from "@/components/forms/PreliminaryApplicationPage";
import { submitEducationApplication } from "./actions";
import fieldDefinitions from "@/lib/forms/schemas/preliminary-education-fields.json";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preliminary Application - Education | IANA Financial",
  description: "Submit your preliminary application for an educational loan.",
};

export default async function PreliminaryEducationPage() {
  return (
    <PreliminaryApplicationPage
      title="Preliminary Application - Educational Loan"
      description="Submit your preliminary application for an educational loan."
      fields={fieldDefinitions.fields}
      sections={fieldDefinitions.sections}
      formKey="preliminary-education"
      onSubmit={submitEducationApplication}
    />
  );
}


