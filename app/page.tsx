import type { Metadata } from "next"

import { cardsToGrid, getHome } from "@/lib/content/sanity-pages"
import { sanityImageUrl } from "@/sanity/lib/image"
import { CardGrid } from "@/components/page/card-grid"
import { WelcomeHero } from "@/components/page/welcome-hero"
import { PageShell } from "@/components/page-shell"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHome()
  return {
    title:
      home?.seoTitle ||
      "Interest-Free Financial Services – Ethical & Sharia-Compliant Solutions",
    description:
      home?.seoDescription ||
      "Join Iana Financial in building a God-centered financial system. Explore interest-free savings, ethical loans, Islamic finance resources, and expert advisory.",
  }
}

export default async function HomePage() {
  const home = await getHome()
  const cards = cardsToGrid(home?.cards)

  return (
    <PageShell>
      <WelcomeHero
        title={home?.heroTitle || "(Interest-Free) Loans"}
        message={
          home?.heroMessage ||
          `### Join us in building a God-centered cooperative financial system that serves the common good.


### Ethically save while helping your brothers and sisters with interest-free loans.`
        }
        links={(home?.heroLinks && home.heroLinks.length > 0
          ? home.heroLinks
          : [
              { link: "/support-iana", label: "Lend or Donate" },
              { link: "/applications", label: "Apply" },
            ]
        ).map((link) => ({
          link: link.link,
          label: link.label,
          style: "button" as const,
        }))}
        backgroundType="image"
        backgroundImage={sanityImageUrl(home?.heroBackgroundImage)}
        backgroundColor={home?.heroBackgroundColor || "#242424"}
      />
      {cards.length > 0 ? (
        <div className="container mx-auto grid gap-8 p-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <CardGrid cardblock={cards} />
        </div>
      ) : null}
    </PageShell>
  )
}
