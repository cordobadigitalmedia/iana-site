import React from "react"
import type { Metadata } from "next"
import client from "@/tina/__generated__/client"

import { SEOProps, generateMetadata as generateSeoMetadata } from "@/lib/seo"
import { PageComponent } from "@/components/app/page"

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const { slug } = params

  try {
    const pageResponse = await client.queries.page({
      relativePath: `${slug}.mdx`,
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

export default async function Page({
  params,
}: {
  params: Promise<{ filename: string[] }>
}) {
  const result = await client.queries.pageAndNav({
    relativePath: `${(await params).filename}.mdx`,
  })
  return <PageComponent {...result} />
}

export async function generateStaticParams() {
  const pages = await client.queries.pageConnection()
  const paths = pages.data?.pageConnection.edges?.map((edge) => ({
    filename: edge?.node?._sys.breadcrumbs,
  }))

  return paths || []
}
