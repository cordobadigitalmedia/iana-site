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
  title: "Donate to Iana – Ethical Giving Without Credit Cards",
  description:
    "Support Iana Financial through direct deposit or e-transfer. Avoid credit card fees and contribute to grassroots economic reform while earning lasting rewards.",
}

export default async function DonatePage() {
  const [content, nav, header, footer] = await Promise.all([
    readPageContent("donate"),
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
            headline="Donate"
            backgroundImage="/images/img-RsfAQQQapIcAT0jgfpVlQ (1).jpeg"
          />
          <PageContent>{content}</PageContent>
        </div>
        <Footer footer={footer as any} />
      </div>
    </>
  )
}

