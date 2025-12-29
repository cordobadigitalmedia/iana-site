import type { Metadata } from "next"
import { readPageContent } from "@/lib/content/pages"
import { readNav } from "@/lib/content/nav"
import { readHeader } from "@/lib/content/header"
import { readFooter } from "@/lib/content/footer"

import { CoverSection } from "@/components/page/cover-section"
import { PageContent } from "@/components/page/page-content"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"

export const dynamic = "force-static"

export const metadata: Metadata = {
  title: "Before Applying | IANA Financial",
  description:
    "Guidelines and advice for applicants considering an interest-free loan from IANA Financial.",
}

export default async function BeforeApplyingPage() {
  const [content, nav, header, footer] = await Promise.all([
    readPageContent("before-applying"),
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
            headline="Before Applying"
            backgroundImage="/images/steps.png"
          />
          <PageContent>{content}</PageContent>
        </div>
        <Footer footer={footer as any} />
      </div>
    </>
  )
}

