import type { Metadata } from "next";
import { readNav } from "@/lib/content/nav";
import { readHeader } from "@/lib/content/header";
import { readFooter } from "@/lib/content/footer";
import { readPageContent } from "@/lib/content/pages";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { ApplicationIntro } from "@/components/forms/ApplicationIntro";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number' | 'email' | 'tel' | 'file';
  required: boolean;
  section?: string;
  width?: 'full' | 'half';
  options?: string[];
  placeholder?: string;
  rowLabel?: string;
  isTotal?: boolean;
  conditionalRequired?: {
    field: string;
    value: string;
  };
  conditionalShow?: {
    field: string;
    value: string;
  };
}

interface PreliminaryApplicationPageProps {
  title: string;
  description: string;
  fields: FieldDefinition[];
  sections: string[];
  formKey: string;
  onSubmit: (data: Record<string, any>) => Promise<{ success: boolean; applicationId?: string; error?: string }>;
}

export async function PreliminaryApplicationPage({
  title,
  description,
  fields,
  sections,
  formKey,
  onSubmit,
}: PreliminaryApplicationPageProps) {
  const [nav, header, footer, beforeApplyingContent, awardPhilosophyContent, faqsContent] = await Promise.all([
    readNav(),
    readHeader(),
    readFooter(),
    readPageContent("before-applying"),
    readPageContent("award-philosophy"),
    readPageContent("faqs"),
  ]);

  const stepContents = {
    step1: {
      title: "Before Applying",
      content: beforeApplyingContent,
    },
    step2: {
      title: "Award Philosophy",
      content: awardPhilosophyContent,
    },
    step3: {
      title: "Frequently Asked Questions",
      content: faqsContent,
    },
  };

  return (
    <>
      <SiteHeader nav={nav as any} header={header as any} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        <div className="grow container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Link href="/start-applying">
                <Button variant="outline">Back to Application Home</Button>
              </Link>
            </div>
            <Card className="border-2">
              <CardContent className="p-8">
                <h1 className="text-3xl font-bold mb-6">{title}</h1>
                <ApplicationIntro stepContents={stepContents} />
                <ApplicationForm
                  fields={fields}
                  sections={sections}
                  formKey={formKey}
                  onSubmit={onSubmit}
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

