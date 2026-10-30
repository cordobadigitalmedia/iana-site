import { groq } from "next-sanity"

export const PAGE_QUERY = groq`*[_type == "page" && slug.current == $slug && published == true][0]{
  _id,
  title,
  "slug": slug.current,
  description,
  coverImage,
  coverHeadline,
  coverContent,
  bodyTextAlign,
  body,
  cardsTitle,
  cards[]{
    headline,
    coverImage,
    imageFit,
    content,
    linkLabel,
    linkHref
  }
}`

export const PAGE_SLUGS_QUERY = groq`*[_type == "page" && published == true && defined(slug.current)].slug.current`

export const HOME_QUERY = groq`*[_type == "home" && _id == "home"][0]{
  seoTitle,
  seoDescription,
  heroTitle,
  heroMessage,
  heroBackgroundImage,
  heroBackgroundColor,
  heroLinks[]{ label, link },
  cards[]{
    headline,
    coverImage,
    imageFit,
    content,
    linkLabel,
    linkHref
  }
}`

export const GALLERY_QUERY = groq`*[_type == "gallery" && _id == "gallery"][0]{
  title,
  seoDescription,
  images[]{
    ...,
    caption
  }
}`

export const SITEMAP_PAGES_QUERY = groq`*[_type == "page" && published == true && defined(slug.current)]{
  "slug": slug.current,
  _updatedAt
}`
