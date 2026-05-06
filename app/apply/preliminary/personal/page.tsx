import type { Metadata } from "next";
import { PreliminaryApplicationPage } from "@/components/forms/PreliminaryApplicationPage";
import { submitPersonalApplication } from "./actions";
import fieldDefinitions from "@/lib/forms/schemas/preliminary-personal-fields.json";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preliminary Application - Personal/Emergency | IANA Financial",
  description: "Submit your preliminary application for a personal or emergency loan.",
};

export default async function PreliminaryPersonalPage() {
  return await PreliminaryApplicationPage({
    title: "Preliminary Application - Personal/Emergency Loan",
    description: "Submit your preliminary application for a personal or emergency loan.",
    fields: fieldDefinitions.fields as any,
    sections: fieldDefinitions.sections,
    formKey: "preliminary-personal",
    onSubmit: submitPersonalApplication,
  });
}


