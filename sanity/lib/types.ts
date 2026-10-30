import type { PortableTextBlock } from "@portabletext/react"
import type { SanityImageSource } from "@sanity/image-url"

export type SanityCard = {
  headline: string
  coverImage?: SanityImageSource | null
  imageFit?: "cover" | "contain" | null
  content?: string | null
  linkLabel?: string | null
  linkHref?: string | null
}

export type SanityPage = {
  _id: string
  title: string
  slug: string
  description?: string | null
  coverImage?: SanityImageSource | null
  coverHeadline?: string | null
  coverContent?: string | null
  bodyTextAlign?: "left" | "center" | "right" | null
  body?: PortableTextBlock[] | null
  cardsTitle?: string | null
  cards?: SanityCard[] | null
}

export type SanityHome = {
  seoTitle?: string | null
  seoDescription?: string | null
  heroTitle?: string | null
  heroMessage?: string | null
  heroBackgroundImage?: SanityImageSource | null
  heroBackgroundColor?: string | null
  heroLinks?: { label: string; link: string }[] | null
  cards?: SanityCard[] | null
}

export type SanityGallery = {
  title?: string | null
  seoDescription?: string | null
  images?: Array<SanityImageSource & { caption?: string | null }> | null
}
