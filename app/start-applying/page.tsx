import type { Metadata } from "next"
import { readPageContent } from "@/lib/content/pages"
import { readNav } from "@/lib/content/nav"
import { readHeader } from "@/lib/content/header"
import { readFooter } from "@/lib/content/footer"

import { CoverSection } from "@/components/page/cover-section"
import { PageContent } from "@/components/page/page-content"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Apply for an Interest-Free Loan – Iana Financial",
  description:
    "Apply for an interest-free loan with Iana Financial. Review guidelines, award philosophy, and FAQs before applying. Ethical, Sharia-compliant financial assistance.",
}

export default async function StartApplyingPage() {
  const [content, nav, header, footer] = await Promise.all([
    readPageContent("start-applying"),
    readNav(),
    readHeader(),
    readFooter(),
  ])

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
        </div>
        <Footer footer={footer as any} />
      </div>
    </>
  )
}

