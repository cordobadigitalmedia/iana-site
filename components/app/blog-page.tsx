import Image from "next/image"

import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import type { Post } from "@/lib/content/posts"
import type { Nav } from "@/components/site-header"
import type { Header } from "@/components/site-header"
import type { FooterData } from "@/components/footer"

interface BlogPageComponentProps {
  post: Post
  nav: Nav
  header: Header
  footer: FooterData
}

export function BlogPageComponent({
  post,
  nav,
  header,
  footer,
}: BlogPageComponentProps) {
  const backgroundImage = post.image || "none"
  return (
    <>
      <SiteHeader header={header} nav={nav} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        {backgroundImage !== "none" && (
          <section className="relative h-[35vh]">
            <Image
              alt={post.title || ""}
              className="size-full object-cover"
              height={1080}
              src={backgroundImage}
              style={{
                aspectRatio: "1920/1080",
                objectFit: "cover",
              }}
              width={1920}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50">
              <h1 className="max-w-5xl px-4 text-center text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                {post.title || ""}
              </h1>
            </div>
          </section>
        )}
        <section className="container mx-auto max-w-5xl grow px-4 py-8">
          <div className="prose max-w-none">
            <MarkdownRenderer content={post.body} />
          </div>
        </section>
        <Footer footer={footer} />
      </div>
    </>
  )
}
