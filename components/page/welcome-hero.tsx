import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface WelcomeHeroLink {
  link: string
  label: string
  style?: "button" | "simple"
}

interface WelcomeHeroProps {
  title?: string
  message?: string
  links?: WelcomeHeroLink[]
  backgroundImage?: string
  backgroundColor?: string
  backgroundType?: "image" | "color"
}

export function WelcomeHero({
  title,
  message,
  links,
  backgroundImage,
  backgroundColor = "#ffffff",
  backgroundType = "image",
}: WelcomeHeroProps) {
  const bgColor = backgroundColor || "#ffffff"
  const bgImage = backgroundImage ? `${backgroundImage}` : "none"
  const showImage = backgroundType === "image" && bgImage !== "none"

  return (
    <>
      <section
        className="relative flex h-[80vh] w-full items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        {showImage && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              alt={title || ""}
              className="size-full object-cover opacity-50"
              height={1080}
              src={bgImage}
              style={{
                aspectRatio: "1920/1080",
                objectFit: "cover",
              }}
              width={1920}
            />
          </div>
        )}
        <div className="z-5 relative max-w-3xl px-4 text-center">
          {title && (
            <h1 className="text-primary-foreground mb-4 text-5xl font-bold">
              {title}
            </h1>
          )}
          {message && (
            <div className="prose text-primary-foreground [&_h3]:text-primary-foreground max-w-none">
              <MarkdownRenderer content={message} />
            </div>
          )}
          {links && links.length > 0 && (
            <div className="flex items-center justify-center gap-5 py-12">
              {links.map((link) => {
                switch (link.style) {
                  case "button": {
                    return (
                      <Link key={link.label} href={link.link || ""}>
                        <Button size="lg">{link.label}</Button>
                      </Link>
                    )
                  }
                  case "simple": {
                    return (
                      <Link key={link.label} href={link.link || ""}>
                        <Button size="lg" variant={"ghost"}>
                          Learn More
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </Link>
                    )
                  }
                  default: {
                    return (
                      <Link key={link.label} href={link.link || ""}>
                        <Button size="lg">{link.label}</Button>
                      </Link>
                    )
                  }
                }
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
