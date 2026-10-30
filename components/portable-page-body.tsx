"use client"

import Image from "next/image"
import Link from "next/link"
import { PortableText, type PortableTextComponents } from "@portabletext/react"

import { sanityImageUrl } from "@/sanity/lib/image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { GoogleMap } from "@/components/ui/iframe-googlemap"
import { VideoPlayer } from "@/components/ui/iframe-video"

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const src = sanityImageUrl(value, 1200)
      if (!src) return null
      const alt = value?.alt || ""
      return (
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          className="h-auto w-full"
        />
      )
    },
    buttonBlock: ({ value }) => {
      const alignment =
        value?.alignment === "center"
          ? "text-center"
          : value?.alignment === "right"
            ? "text-right"
            : "text-left"
      return (
        <p className={alignment}>
          <Button asChild>
            <Link href={value?.link || ""}>{value?.title || ""}</Link>
          </Button>
        </p>
      )
    },
    alertBlock: ({ value }) => (
      <Alert variant={value?.tone === "warning" ? "destructive" : "default"}>
        {value?.title ? <AlertTitle>{value.title}</AlertTitle> : null}
        {value?.description ? (
          <AlertDescription>{value.description}</AlertDescription>
        ) : null}
      </Alert>
    ),
    youtubeBlock: ({ value }) =>
      value?.id ? (
        <VideoPlayer url={`https://www.youtube.com/embed/${value.id}`} />
      ) : null,
    googlemapBlock: ({ value }) =>
      value?.src ? <GoogleMap url={value.src} /> : null,
  },
  marks: {
    link: ({ value, children }) => {
      const href = value?.href || ""
      if (href.startsWith("https") || href.startsWith("mailto:")) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        )
      }
      return <Link href={href}>{children}</Link>
    },
  },
}

export function PortablePageBody({ value }: { value: unknown }) {
  if (!value || !Array.isArray(value) || value.length === 0) return null
  return <PortableText value={value as never} components={components} />
}
