import Image from "next/image"

interface GalleryImage {
  galleryImage: string
  caption?: string
}

interface ImageGalleryProps {
  galleryImages?: GalleryImage[]
  galleryTitle?: string
}

export function ImageGallery({
  galleryImages,
  galleryTitle,
}: ImageGalleryProps): JSX.Element {
  if (!galleryImages || galleryImages.length === 0) {
    return <></>
  }

  return (
    <>
      {galleryTitle && (
        <h2 className="container mx-auto px-4 text-2xl font-bold">
          {galleryTitle}
        </h2>
      )}
      <div className="container mx-auto grid grid-cols-1 gap-8 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleryImages.map((item, i) => {
          const galleryImage = item.galleryImage || "none"
          if (galleryImage === "none") return null

          return (
            <div key={item.caption || i}>
              <div className="relative h-80">
                <Image
                  src={galleryImage}
                  fill
                  alt={item.caption || "Gallery Image"}
                  className="object-contain"
                />
              </div>
              {item.caption && (
                <div className="prose flex items-center justify-center gap-2 py-2">
                  {item.caption}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
