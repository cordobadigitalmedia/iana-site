import type { Metadata } from "next"

export type SEOProps = {
  title?: string
  description?: string
  ogImage?: string
  keywords?: string
}

export function generateMetadata(
  pageMeta: { title: string; seo?: SEOProps },
  options?: {
    absoluteImagePath?: boolean
    siteName?: string
  }
): Metadata {
  const { title, seo } = pageMeta
  const { absoluteImagePath = true, siteName = "IANA Financial" } =
    options || {}

  // Use SEO title if available, otherwise use page title
  const metaTitle = seo?.title || title

  // Format OG image URL if it exists
  let ogImageUrl = seo?.ogImage
  if (ogImageUrl && absoluteImagePath) {
    // Make sure the URL is absolute
    if (!ogImageUrl.startsWith("http")) {
      ogImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}${ogImageUrl}`
    }
  }

  return {
    title: metaTitle,
    description: seo?.description,
    keywords: seo?.keywords,
    openGraph: ogImageUrl
      ? {
          title: metaTitle,
          description: seo?.description,
          images: [{ url: ogImageUrl }],
          siteName,
        }
      : undefined,
    twitter: ogImageUrl
      ? {
          card: "summary_large_image",
          title: metaTitle,
          description: seo?.description,
          images: [ogImageUrl],
        }
      : undefined,
  }
}
