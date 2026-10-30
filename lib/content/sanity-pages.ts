import { client, sanityFetchOptions } from "@/sanity/lib/client"
import { sanityImageUrl } from "@/sanity/lib/image"
import {
  GALLERY_QUERY,
  HOME_QUERY,
  PAGE_QUERY,
  PAGE_SLUGS_QUERY,
  SITEMAP_PAGES_QUERY,
} from "@/sanity/lib/queries"
import type {
  SanityCard,
  SanityGallery,
  SanityHome,
  SanityPage,
} from "@/sanity/lib/types"

export const RESERVED_SLUGS = [
  "studio",
  "api",
  "blog",
  "resources",
  "admin",
  "apply",
  "contract",
  "respond",
  "gallery",
] as const

export async function getPageBySlug(slug: string): Promise<SanityPage | null> {
  if ((RESERVED_SLUGS as readonly string[]).includes(slug)) return null
  return client.fetch<SanityPage | null>(PAGE_QUERY, { slug }, sanityFetchOptions)
}

export async function getPublishedPageSlugs(): Promise<string[]> {
  const slugs = await client.fetch<string[]>(
    PAGE_SLUGS_QUERY,
    {},
    sanityFetchOptions
  )
  return (slugs || []).filter(
    (slug) => slug && !(RESERVED_SLUGS as readonly string[]).includes(slug)
  )
}

export async function getHome(): Promise<SanityHome | null> {
  return client.fetch<SanityHome | null>(HOME_QUERY, {}, sanityFetchOptions)
}

export async function getGallery(): Promise<SanityGallery | null> {
  return client.fetch<SanityGallery | null>(
    GALLERY_QUERY,
    {},
    sanityFetchOptions
  )
}

export async function getSitemapPages(): Promise<
  { slug: string; _updatedAt?: string }[]
> {
  const pages = await client.fetch<{ slug: string; _updatedAt?: string }[]>(
    SITEMAP_PAGES_QUERY,
    {},
    sanityFetchOptions
  )
  return (pages || []).filter(
    (page) =>
      page.slug && !(RESERVED_SLUGS as readonly string[]).includes(page.slug)
  )
}

export function cardsToGrid(cards: SanityCard[] | null | undefined) {
  return (cards || []).map((card) => ({
    headline: card.headline,
    coverimage: sanityImageUrl(card.coverImage, 800),
    imageFit: (card.imageFit || "cover") as "cover" | "contain",
    content: card.content || "",
    links:
      card.linkHref && card.linkLabel
        ? [
            {
              link: card.linkHref,
              label: card.linkLabel,
              style: "button" as const,
            },
          ]
        : [],
  }))
}
