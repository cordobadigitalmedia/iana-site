import type { Metadata } from "next"
import { readNav } from "@/lib/content/nav"
import { readHeader } from "@/lib/content/header"
import { readFooter } from "@/lib/content/footer"

import { CoverSection } from "@/components/page/cover-section"
import { CardGrid } from "@/components/page/card-grid"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"

export const dynamic = "force-static"

export const metadata: Metadata = {
  title: "Donate, Save & Learn – Interest-Free Financial Solutions by Iana",
  description:
    "Support Iana's vision with donations or savings while helping others with interest-free loans. No tax receipts—only lasting rewards.",
}

export default async function SupportIanaPage() {
  const [nav, header, footer] = await Promise.all([
    readNav(),
    readHeader(),
    readFooter(),
  ])

  const cardblock = [
    {
      headline: "Donate",
      coverimage: "/images/img-RsfAQQQapIcAT0jgfpVlQ (1).jpeg",
      imageFit: "cover" as const,
      content: `### The example of those who spend their wealth in the way of Allah is like a seed \[of grain] which grows seven spikes; in each spike is a hundred grains. And Allah multiplies \[His reward] for whom He wills. And Allah is all-Encompassing and Knowing.


Holy Qur'an (2:261)


* We do not have charitable status: Your donation will not receive a tax-receipt. Instead of tax-receipts, God's gifts are immediate and ever-lasting and come in many shapes and colours!

* Donations will be used to further Iana Financial's vision: This includes providing interest-free loans as well as other initiatives related to Islamic financial community services such as education initiatives or loan forgiveness.

* Every penny counts: Every contribution goes to the pool of funds while all administrative are covered by Iana volunteers.


How to Donate: 


1. Directly to Iana's Servus Credit Union Account – Walk into any Servus Credit Union and donate directly to Iana Financial under the account number: 5176250. **Please leave a memo with your donation indicating your name.**

2. By e-transfer to [support-iana@ianafinancial.org](mailto:support-iana@ianafinancial.org).`,
      links: [
        {
          link: "/donate",
          label: "Donate",
          style: "button" as const,
        },
      ],
    },
    {
      headline: "Save/Lend",
      coverimage: "/images/img-zI09Ogp4aMgUZnE5L5n8G.jpeg",
      imageFit: "cover" as const,
      content: `Lending Iana is an effective way to save your money while helping others. Whether saving for Hajj, towards purchasing a home, for your children's education, or retirement.


It's simple:


1. Contact us to setup your account and a loan agreement.

2. Transfer funds to Iana as often as you like via e-transfer or cheque (these funds help your brothers and sisters with interest-free loans).

3. When you need any funds back, simply reach out and we pay you back via e-transfer or wire insha'Allah – easy!


Contact us for more information - email [support-iana@ianafinancial.org](mailto:support-iana@ianafinancial.org).


This option is far more rewarding than keeping your money in the bank – rather than helping banks lend your money at interest, let Iana help people interest-free!`,
      links: [
        {
          link: "mailto:support-iana@ianafinancial.org",
          label: "Email us to Open a Savings/Lending Account",
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
          <CoverSection
            headline="Support Your Community"
            content="Many people need financial help for a short while and most places take advantage of their situation by charging them interest/usury.


You can help change this, insha'Allah."
            backgroundImage="/images/img-HgkVvg9J8poPW5rwGYiiW.jpeg"
            backgroundColor="#AAA9A9"
          />
          <div className="container mx-auto p-4">
            <h2 className="mb-4 text-2xl font-bold">Support Options</h2>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
              <CardGrid cardblock={cardblock} />
            </div>
          </div>
        </div>
        <Footer footer={footer as any} />
      </div>
    </>
  )
}

