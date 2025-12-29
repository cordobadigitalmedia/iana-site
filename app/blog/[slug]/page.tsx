import type { Metadata } from "next"
import { readPost, getAllPostSlugs } from "@/lib/content/posts"
import { readNav } from "@/lib/content/nav"
import { readHeader } from "@/lib/content/header"
import { readFooter } from "@/lib/content/footer"

import { BlogPageComponent } from "@/components/app/blog-page"

export const dynamic = "force-static"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = await readPost(slug)
    return {
      title: `${post.title} | IANA Financial`,
      description: post.description,
    }
  } catch (error) {
    return {
      title: "Post Not Found",
    }
  }
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [post, nav, header, footer] = await Promise.all([
    readPost(slug),
    readNav(),
    readHeader(),
    readFooter(),
  ])

  return (
    <BlogPageComponent
      post={{ ...post, slug }}
      nav={nav as any}
      header={header as any}
      footer={footer as any}
    />
  )
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}
