import type { Metadata } from "next"
import { getAllPosts } from "@/lib/content/posts"
import { readNav } from "@/lib/content/nav"
import { readHeader } from "@/lib/content/header"
import { readFooter } from "@/lib/content/footer"

import { BlogIndexPageComponent } from "@/components/app/blog-list-page"

export const dynamic = "force-static"

export const metadata: Metadata = {
  title: "Blog | IANA Financial",
  description: "Read articles and updates from IANA Financial.",
}

export default async function BlogIndexPage() {
  const [posts, nav, header, footer] = await Promise.all([
    getAllPosts(),
    readNav(),
    readHeader(),
    readFooter(),
  ])

  // Add slug to each post
  const postsWithSlugs = posts.map((post) => ({
    ...post,
    slug: post.slug,
  }))

  return (
    <BlogIndexPageComponent
      posts={postsWithSlugs}
      nav={nav as any}
      header={header as any}
      footer={footer as any}
    />
  )
}
