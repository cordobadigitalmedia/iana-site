import type { MetadataRoute } from "next"

import { getSitemapPages } from "@/lib/content/sanity-pages"

const siteUrl = "https://www.ianafinancial.org"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getSitemapPages()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/resources/relief-orgs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  const cmsRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: page._updatedAt ? new Date(page._updatedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  return [...staticRoutes, ...cmsRoutes]
}
