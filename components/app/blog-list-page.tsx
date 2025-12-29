import { BlogList } from "@/components/blog-list"
import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"
import type { Post } from "@/lib/content/posts"
import type { Nav } from "@/components/site-header"
import type { Header } from "@/components/site-header"
import type { FooterData } from "@/components/footer"

interface BlogIndexPageComponentProps {
  posts: Post[]
  nav: Nav
  header: Header
  footer: FooterData
}

export function BlogIndexPageComponent({
  posts,
  nav,
  header,
  footer,
}: BlogIndexPageComponentProps) {
  return (
    <>
      <SiteHeader header={header} nav={nav} />
      <div className="bg-muted h-full">
        <div className="container flex flex-col gap-8 py-8">
          <BlogList posts={posts} />
        </div>
      </div>
      <Footer footer={footer} />
    </>
  )
}
