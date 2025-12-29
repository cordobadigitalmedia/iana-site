import type { Metadata } from "next"
import { readNav } from "@/lib/content/nav"
import { readHeader } from "@/lib/content/header"
import { readFooter } from "@/lib/content/footer"
import { readPageContent } from "@/lib/content/pages"

import { CoverSection } from "@/components/page/cover-section"
import { PageContent } from "@/components/page/page-content"
import { CardGrid } from "@/components/page/card-grid"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"

export const dynamic = "force-static"

export const metadata: Metadata = {
  title: "Apply for an Interest-Free Loan – Iana Financial",
  description:
    "Apply for an interest-free loan with Iana Financial. Review guidelines, award philosophy, and FAQs before applying. Ethical, Sharia-compliant financial assistance.",
}

export default async function ApplicationsPage() {
  const [content, nav, header, footer] = await Promise.all([
    readPageContent("applications"),
    readNav(),
    readHeader(),
    readFooter(),
  ])

  const cardblock = [
    {
      headline: "Before Applying",
      coverimage: "/images/steps.png",
      imageFit: "contain" as const,
      content: `1. **Renew Your Intentions**
2. **Reflect**
3. **Seek Advice**
4. **Consider Other Avenues**
5. **Trust in God**`,
      links: [
        {
          link: "/before-applying",
          label: "Review these guidelines",
          style: "button" as const,
        },
      ],
    },
    {
      headline: "Award Philosophy",
      coverimage: "/images/step-02.png",
      content: `1. **Sacred Sciences of Islam**
2. **General Financial Help**
3. **Specific Visionaries**`,
      links: [
        {
          link: "/award-philosophy",
          label: "Review the Award Philosophy",
          style: "button" as const,
        },
      ],
    },
    {
      headline: "Frequently Asked Questions",
      coverimage: "/images/step-03.png",
      content: `1. Are there any fees?
2. Are international applicants eligible?
3. What types of loans are available?
4. How do applicants apply?

And more...`,
      links: [
        {
          link: "/faqs",
          label: "Review the FAQs",
          style: "button" as const,
        },
      ],
    },
    {
      headline: "Start Applying",
      coverimage: "/images/step-04.png",
      content: `Now that you have reviewed our guidelines, philosophy and FAQs, you can start applying below:


1. Preliminary Application

2. Final Interest-Free Loan Application`,
      links: [
        {
          link: "/start-applying",
          label: "Apply now",
          style: "button" as const,
        },
      ],
    },
  ]

  return (
    <>
      <SiteHeader nav={nav as any} header={header as any} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        <div className="grow">
          <CoverSection
            headline="Apply for an Interest-Free Loan"
            backgroundImage="/images/leon-dewiwje-ldDmTgf89gU-unsplash.jpg"
          />
          <PageContent textAlign="center">{content}</PageContent>
          <div className="container mx-auto p-4">
            <h2 className="mb-4 text-2xl font-bold">Application Sections</h2>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
              <CardGrid cardblock={cardblock} />
            </div>
          </div>
        </div>
        <Footer footer={footer as any} />
      </div>
    </>
  )
}

