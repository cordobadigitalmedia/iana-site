import type { Metadata } from "next"
import { readNav } from "@/lib/content/nav"
import { readHeader } from "@/lib/content/header"
import { readFooter } from "@/lib/content/footer"

import { WelcomeHero } from "@/components/page/welcome-hero"
import { CardGrid } from "@/components/page/card-grid"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"

export const dynamic = "force-static"

export const metadata: Metadata = {
  title: "Interest-Free Financial Services – Ethical & Sharia-Compliant Solutions",
  description:
    "Join Iana Financial in building a God-centered financial system. Explore interest-free savings, ethical loans, Islamic finance resources, and expert advisory.",
}

export default async function HomePage() {
  const [nav, header, footer] = await Promise.all([
    readNav(),
    readHeader(),
    readFooter(),
  ])

  const welcomeHero = {
    title: "(Interest-Free) Loans",
    message: `### Join us in building a God-centered cooperative financial system that serves the common good.


### Ethically save while helping your brothers and sisters with interest-free loans.`,
    links: [
      { link: "/support-iana", label: "Lend or Donate", style: "button" as const },
      { link: "/applications", label: "Apply", style: "button" as const },
    ],
    backgroundType: "image" as const,
    backgroundImage: "/images/img-Sa4G3VcXvmIRoyfzcok6l.jpeg",
    backgroundColor: "#242424",
  }

  const cardblock = [
    {
      headline: "Apply for a Loan",
      coverimage: "/images/leon-dewiwje-ldDmTgf89gU-unsplash.jpg",
      imageFit: "cover" as const,
      content: `1. Before you Apply
2. Award Philosophy
3. Review FAQs
4. Submit an Application`,
      links: [
        {
          link: "/applications",
          label: "Apply for a Loan",
          style: "button" as const,
        },
      ],
    },
    {
      headline: "Learn More",
      coverimage: "/images/sincerely-media--IIIr1Hu6aY-unsplash.jpg",
      imageFit: "cover" as const,
      content: `Money will not solve our problems. Sincerely returning to our Lord and our purpose in life will set things right in our personal lives, our families, communities, and the world. This requires sound knowledge on how things ought to be to restore the sacred balance on earth. Here are some resources:


[Seekersguidance.org](https://seekersguidance.org/): a free online resource to study Islam with qualified teachers.


[Muslimmoney.co:](https://muslimmoney.co/) money management for Muslims including wills, zakat-calculator, etc.


[Oasis](https://www.theoasisinitiative.org/publications): in-depth articles emphasizing the beauty the Islamic tradition has to offer in our times.`,
      links: [],
    },
    {
      headline: "About Us",
      coverimage: "/images/absolutvision-uCMKx2H1Y38-unsplash.jpg",
      imageFit: "cover" as const,
      content: `* [Our Story](/our-story)
* [Testimonials](/testimonials)`,
      links: [
        {
          link: "/team-andadvisors",
          label: "Advisors and Management",
          style: "button" as const,
        },
      ],
    },
  ]

  return (
    <>
      <SiteHeader nav={nav as any} header={header as any} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        <div className="grow">
          <WelcomeHero {...welcomeHero} />
          <div className="container mx-auto grid gap-8 p-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <CardGrid cardblock={cardblock} />
          </div>
        </div>
        <Footer footer={footer as any} />
      </div>
    </>
  )
}
