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
  title: "Award Philosophy | IANA Financial",
  description:
    "Learn about IANA Financial's award philosophy and the principles guiding our interest-free loan program.",
}

export default async function AwardPhilosophyPage() {
  const [content, nav, header, footer] = await Promise.all([
    readPageContent("award-philosophy"),
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
            headline="Award Philosophy"
            backgroundImage="/images/step-02.png"
          />
          <PageContent>{content}</PageContent>
        </div>
        <Footer footer={footer as any} />
      </div>
    </>
  )
}

