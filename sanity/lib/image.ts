import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url"

import { dataset, projectId } from "../env"

const builder = createImageUrlBuilder({ projectId, dataset })

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

export function sanityImageUrl(
  source: SanityImageSource | string | null | undefined,
  width = 1920
): string | undefined {
  if (!source) return undefined
  if (typeof source === "string") return source
  try {
    return urlFor(source).width(width).auto("format").url()
  } catch {
    return undefined
  }
}
