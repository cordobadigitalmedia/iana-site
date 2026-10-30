import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { cardsToGrid, getPageBySlug, getPublishedPageSlugs } from "@/lib/content/sanity-pages"
import { sanityImageUrl } from "@/sanity/lib/image"
import { CardGrid } from "@/components/page/card-grid"
import { CoverSection } from "@/components/page/cover-section"
import { PageContent } from "@/components/page/page-content"
import { PageShell } from "@/components/page-shell"
import { PortablePageBody } from "@/components/portable-page-body"

export const revalidate = 60
export const dynamicParams = true

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getPublishedPageSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) return {}
  return {
    title: page.title,
    description: page.description || undefined,
  }
}

export default async function CmsPage({ params }: PageProps) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) notFound()

  const cards = cardsToGrid(page.cards)
  const align = page.bodyTextAlign || "left"

  return (
    <PageShell>
      <CoverSection
        headline={page.coverHeadline || page.title}
        content={page.coverContent || undefined}
        backgroundImage={sanityImageUrl(page.coverImage)}
      />
      <PageContent textAlign={align}>
        <PortablePageBody value={page.body} />
      </PageContent>
      {cards.length > 0 ? (
        <div className="container mx-auto p-4">
          {page.cardsTitle ? (
            <h2 className="mb-4 text-2xl font-bold">{page.cardsTitle}</h2>
          ) : null}
          <div
            className={`grid gap-8 grid-cols-1 sm:grid-cols-2 ${
              cards.length > 2 ? "md:grid-cols-2" : ""
            }`}
          >
            <CardGrid cardblock={cards} />
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}
