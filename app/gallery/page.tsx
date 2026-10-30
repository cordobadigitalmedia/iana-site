import type { Metadata } from "next"

import { getGallery } from "@/lib/content/sanity-pages"
import { sanityImageUrl } from "@/sanity/lib/image"
import { ImageGallery } from "@/components/page/image-gallery"
import { PageShell } from "@/components/page-shell"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const gallery = await getGallery()
  return {
    title: gallery?.title || "Gallery",
    description: gallery?.seoDescription || "Image gallery of IANA Financial.",
  }
}

export default async function GalleryPage() {
  const gallery = await getGallery()
  const galleryImages = (gallery?.images || [])
    .map((image) => ({
      galleryImage: sanityImageUrl(image, 1200) || "",
      caption: image.caption || undefined,
    }))
    .filter((image) => image.galleryImage)

  return (
    <PageShell>
      <ImageGallery
        galleryImages={galleryImages}
        galleryTitle={gallery?.title || "Image gallery"}
      />
    </PageShell>
  )
}
