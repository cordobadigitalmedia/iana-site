import React, { Suspense } from "react"
import type { Metadata } from "next"
import client from "@/tina/__generated__/client"

import { SEOProps, generateMetadata as generateSeoMetadata } from "@/lib/seo"
import { PageComponent } from "@/components/app/page"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const pageResponse = await client.queries.page({
      relativePath: `home.mdx`,
    })
    const page = pageResponse.data.page

    if (!page) {
      return {
        title: "Page Not Found",
      }
    }

    return generateSeoMetadata(page as { title: string; seo?: SEOProps }, {
      siteName: "IANA Financial",
    })
  } catch (error) {
    console.error("Error fetching page metadata:", error)
    return {
      title: "Error Loading Page",
    }
  }
}

export default async function Page() {
  const result = await client.queries.pageAndNav({
    relativePath: `home.mdx`,
  })
  return (
    <Suspense>
      <PageComponent {...result} />
    </Suspense>
  )
}
