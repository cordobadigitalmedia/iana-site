import type { Metadata } from "next";
import { PreliminaryApplicationPage } from "@/components/forms/PreliminaryApplicationPage";
import { submitBusinessApplication } from "./actions";
import fieldDefinitions from "@/lib/forms/schemas/preliminary-business-fields.json";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preliminary Application - Business/Institutional | IANA Financial",
  description: "Submit your preliminary application for a business or institutional loan.",
};

export default async function PreliminaryBusinessPage() {
  return await PreliminaryApplicationPage({
    title: "Preliminary Application - Business/Institutional Loan",
    description: "Submit your preliminary application for a business or institutional loan.",
    fields: fieldDefinitions.fields as any,
    sections: fieldDefinitions.sections,
    formKey: "preliminary-business",
    onSubmit: submitBusinessApplication,
  });
}


