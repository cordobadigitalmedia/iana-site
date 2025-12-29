import type { Metadata } from "next"
import { readNav } from "@/lib/content/nav"
import { readHeader } from "@/lib/content/header"
import { readFooter } from "@/lib/content/footer"

import { ImageGallery } from "@/components/page/image-gallery"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"

export const dynamic = "force-static"

export const metadata: Metadata = {
  title: "Gallery | IANA Financial",
  description: "Image gallery of IANA Financial.",
}

export default async function GalleryPage() {
  const [nav, header, footer] = await Promise.all([
    readNav(),
    readHeader(),
    readFooter(),
  ])

  const galleryImages = [
    {
      galleryImage: "/images/micheile-henderson-SoT4-mZhyhE-unsplash.jpg",
      caption: "Image caption 2",
    },
    {
      galleryImage: "/images/lms-image-GaaFkDYJQ9gmTXSZLtgbLTXAy2qDs8.jpg",
      caption: "Image caption 1",
    },
  ]

  return (
    <>
      <SiteHeader nav={nav as any} header={header as any} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        <div className="grow">
          <ImageGallery
            galleryImages={galleryImages}
            galleryTitle="Image gallery"
          />
        </div>
        <Footer footer={footer as any} />
      </div>
    </>
  )
}

