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
  title: "Team and Advisors | IANA Financial",
  description:
    "Meet the advisory board and management team of IANA Financial, dedicated to providing interest-free financial services.",
}

export default async function TeamAndAdvisorsPage() {
  const [content, nav, header, footer] = await Promise.all([
    readPageContent("team-andadvisors"),
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
            headline="Team and Advisors"
            backgroundImage="/images/getimg_ai_img-ysniBbR19j0WbNd750s1S.jpeg"
          />
          <PageContent>{content}</PageContent>
        </div>
        <Footer footer={footer as any} />
      </div>
    </>
  )
}

