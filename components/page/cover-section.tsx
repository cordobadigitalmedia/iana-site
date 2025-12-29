import Image from "next/image"

import { MarkdownRenderer } from "@/components/markdown-renderer"

interface CoverSectionProps {
  headline?: string
  content?: string
  backgroundImage?: string
  backgroundColor?: string
}

export function CoverSection({
  headline,
  content,
  backgroundImage,
  backgroundColor = "#ffffff",
}: CoverSectionProps) {
  const bgImage = backgroundImage ? `${backgroundImage}` : "none"
  const bgColor = backgroundColor || "#ffffff"

  if (bgImage === "none") {
    return null
  }

  return (
    <section className="relative h-[35vh]" style={{ backgroundColor: bgColor }}>
      <Image
        alt={headline || ""}
        className="size-full object-cover"
        height={1080}
        src={bgImage}
        style={{
          aspectRatio: "1920/1080",
          objectFit: "cover",
        }}
        width={1920}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50">
        {headline && (
          <h1 className="px-4 text-center text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            {headline}
          </h1>
        )}
        {content && (
          <div className="prose py-2 text-white">
            <MarkdownRenderer content={content} />
          </div>
        )}
      </div>
    </section>
  )
}
