import type { Metadata } from "next";
import { PreliminaryApplicationPage } from "@/components/forms/PreliminaryApplicationPage";
import { submitPreliminaryApplication } from "./actions";
import fieldDefinitions from "@/lib/forms/schemas/preliminary-unified-fields.json";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preliminary Application | IANA Financial",
  description: "Submit your preliminary application for an interest-free loan.",
};

export default async function PreliminaryPage() {
  return await PreliminaryApplicationPage({
    title: "Preliminary Application",
    description: "Please select the type of loan you are applying for and complete the form below.",
    fields: fieldDefinitions.fields as any,
    sections: fieldDefinitions.sections,
    formKey: "preliminary-unified",
    onSubmit: submitPreliminaryApplication,
  });
}
