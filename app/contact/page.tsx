import type { Metadata } from "next"
import { readNav } from "@/lib/content/nav"
import { readHeader } from "@/lib/content/header"
import { readFooter } from "@/lib/content/footer"

import { WelcomeHero } from "@/components/page/welcome-hero"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"

export const dynamic = "force-static"

export const metadata: Metadata = {
  title: "Contact Us | IANA Financial",
  description: "Contact IANA Financial for inquiries about interest-free loans and financial services.",
}

export default async function ContactPage() {
  const [nav, header, footer] = await Promise.all([
    readNav(),
    readHeader(),
    readFooter(),
  ])

  return (
    <>
      <SiteHeader nav={nav as any} header={header as any} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        <div className="grow">
          <WelcomeHero title="Hello world" message="# Hello" />
        </div>
        <Footer footer={footer as any} />
      </div>
    </>
  )
}

