import { createReadStream, existsSync, readFileSync } from "fs"
import { basename, join } from "path"
import { createClient } from "@sanity/client"

type PortableBlock = Record<string, unknown>

const ROOT = process.cwd()
const PAGES_DIR = join(ROOT, "content", "pages")
const PUBLIC_DIR = join(ROOT, "public")

loadEnvFile(join(ROOT, ".env.local"))

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_API_PROJECT_ID
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_API_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or SANITY_API_WRITE_TOKEN"
  )
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-10-29",
  token,
  useCdn: false,
})

const imageCache = new Map<string, { _type: "reference"; _ref: string }>()

const PAGE_META: Record<
  string,
  {
    title: string
    description: string
    coverImage?: string
    coverHeadline?: string
    coverContent?: string
    bodyTextAlign?: "left" | "center"
    cardsTitle?: string
    file?: string
  }
> = {
  "our-story": {
    title: "Our Story",
    description:
      "Learn about the origins and mission of IANA Financial, an interest-free lending program inspired by Islamic principles.",
    coverImage: "/images/img-5Ecenat6s6MFvji1ArQGK.jpeg",
    coverHeadline: "Our Story",
    file: "our-story.md",
  },
  faqs: {
    title: "Frequently Asked Questions",
    description:
      "Find answers to common questions about IANA Financial's interest-free loan program, eligibility, application process, and repayment terms.",
    coverImage: "/images/step-03.png",
    coverHeadline: "Frequently Asked Questions",
    file: "faqs.md",
  },
  "start-applying": {
    title: "Start Applying",
    description:
      "Download and submit your preliminary and final interest-free loan applications to IANA Financial.",
    coverImage: "/images/step-04.png",
    coverHeadline: "Start Applying",
    file: "start-applying.md",
  },
  "before-applying": {
    title: "Before Applying",
    description:
      "Guidelines and advice for applicants considering an interest-free loan from IANA Financial.",
    coverImage: "/images/steps.png",
    coverHeadline: "Before Applying",
    file: "before-applying.md",
  },
  "award-philosophy": {
    title: "Award Philosophy",
    description:
      "Learn about IANA Financial's award philosophy and the principles guiding our interest-free loan program.",
    coverImage: "/images/step-02.png",
    coverHeadline: "Award Philosophy",
    file: "award-philosophy.md",
  },
  testimonials: {
    title: "Testimonials",
    description:
      "Read testimonials from scholars, advisors, and loan recipients about IANA Financial's interest-free loan program.",
    coverImage: "/images/img-aBJsxdwGl1SLvay7qchip.jpeg",
    coverHeadline: "Testimonials",
    file: "testimonials.md",
  },
  donate: {
    title: "Donate to Iana – Ethical Giving Without Credit Cards",
    description:
      "Support Iana Financial through direct deposit or e-transfer. Avoid credit card fees and contribute to grassroots economic reform while earning lasting rewards.",
    coverImage: "/images/img-RsfAQQQapIcAT0jgfpVlQ (1).jpeg",
    coverHeadline: "Donate",
    file: "donate.md",
  },
  "team-andadvisors": {
    title: "Team and Advisors",
    description:
      "Meet the advisory board and management team of IANA Financial, dedicated to providing interest-free financial services.",
    coverImage: "/images/getimg_ai_img-ysniBbR19j0WbNd750s1S.jpeg",
    coverHeadline: "Team and Advisors",
    file: "team-andadvisors.md",
  },
  contact: {
    title: "Contact Us",
    description:
      "Contact IANA Financial for inquiries about interest-free loans and financial services.",
    coverHeadline: "Contact Us",
  },
  applications: {
    title: "Apply for an Interest-Free Loan – Iana Financial",
    description:
      "Apply for an interest-free loan with Iana Financial. Review guidelines, award philosophy, and FAQs before applying. Ethical, Sharia-compliant financial assistance.",
    coverImage: "/images/leon-dewiwje-ldDmTgf89gU-unsplash.jpg",
    coverHeadline: "Apply for an Interest-Free Loan",
    bodyTextAlign: "center",
    cardsTitle: "Application Sections",
    file: "applications.md",
  },
  "support-iana": {
    title: "Donate, Save & Learn – Interest-Free Financial Solutions by Iana",
    description:
      "Support Iana's vision with donations or savings while helping others with interest-free loans. No tax receipts—only lasting rewards.",
    coverImage: "/images/img-HgkVvg9J8poPW5rwGYiiW.jpeg",
    coverHeadline: "Support Your Community",
    coverContent:
      "Many people need financial help for a short while and most places take advantage of their situation by charging them interest/usury.\n\n\nYou can help change this, insha'Allah.",
    cardsTitle: "Support Options",
  },
}

async function main() {
  console.log(`Importing into ${projectId}/${dataset}…`)

  await importPages()
  await importHome()
  await importGallery()

  console.log("Import complete.")
}

async function importPages() {
  for (const [slug, meta] of Object.entries(PAGE_META)) {
    const markdown = meta.file
      ? readFileSync(join(PAGES_DIR, meta.file), "utf-8")
      : slug === "contact"
        ? `Email [support-iana@ianafinancial.org](mailto:support-iana@ianafinancial.org) for inquiries about interest-free loans and financial services.`
        : ""

    const body = await markdownToPortableText(markdown)
    const cards = await cardsForSlug(slug)

    await client.createOrReplace({
      _id: `page.${slug}`,
      _type: "page",
      title: meta.title,
      slug: { _type: "slug", current: slug },
      description: meta.description,
      coverImage: await imageField(meta.coverImage),
      coverHeadline: meta.coverHeadline,
      coverContent: meta.coverContent,
      published: true,
      bodyTextAlign: meta.bodyTextAlign || "left",
      body,
      cardsTitle: meta.cardsTitle,
      cards,
    })
    console.log(`  page: /${slug}`)
  }
}

async function importHome() {
  await client.createOrReplace({
    _id: "home",
    _type: "home",
    seoTitle:
      "Interest-Free Financial Services – Ethical & Sharia-Compliant Solutions",
    seoDescription:
      "Join Iana Financial in building a God-centered financial system. Explore interest-free savings, ethical loans, Islamic finance resources, and expert advisory.",
    heroTitle: "(Interest-Free) Loans",
    heroMessage: `### Join us in building a God-centered cooperative financial system that serves the common good.


### Ethically save while helping your brothers and sisters with interest-free loans.`,
    heroBackgroundImage: await imageField(
      "/images/img-Sa4G3VcXvmIRoyfzcok6l.jpeg"
    ),
    heroBackgroundColor: "#242424",
    heroLinks: [
      { _key: key(), _type: "heroLink", label: "Lend or Donate", link: "/support-iana" },
      { _key: key(), _type: "heroLink", label: "Apply", link: "/applications" },
    ],
    cards: [
      await card({
        headline: "Apply for a Loan",
        image: "/images/leon-dewiwje-ldDmTgf89gU-unsplash.jpg",
        imageFit: "cover",
        content: `1. Before you Apply
2. Award Philosophy
3. Review FAQs
4. Submit an Application`,
        linkLabel: "Apply for a Loan",
        linkHref: "/applications",
      }),
      await card({
        headline: "Learn More",
        image: "/images/sincerely-media--IIIr1Hu6aY-unsplash.jpg",
        imageFit: "cover",
        content: `Money will not solve our problems. Sincerely returning to our Lord and our purpose in life will set things right in our personal lives, our families, communities, and the world. This requires sound knowledge on how things ought to be to restore the sacred balance on earth. Here are some resources:


[Seekersguidance.org](https://seekersguidance.org/): a free online resource to study Islam with qualified teachers.


[Muslimmoney.co:](https://muslimmoney.co/) money management for Muslims including wills, zakat-calculator, etc.


[Oasis](https://www.theoasisinitiative.org/publications): in-depth articles emphasizing the beauty the Islamic tradition has to offer in our times.`,
      }),
      await card({
        headline: "About Us",
        image: "/images/absolutvision-uCMKx2H1Y38-unsplash.jpg",
        imageFit: "cover",
        content: `* [Our Story](/our-story)
* [Testimonials](/testimonials)`,
        linkLabel: "Advisors and Management",
        linkHref: "/team-andadvisors",
      }),
    ],
  })
  console.log("  singleton: home")
}

async function importGallery() {
  const images = []
  for (const item of [
    {
      src: "/images/micheile-henderson-SoT4-mZhyhE-unsplash.jpg",
      caption: "Image caption 2",
    },
    {
      src: "/images/lms-image-GaaFkDYJQ9gmTXSZLtgbLTXAy2qDs8.jpg",
      caption: "Image caption 1",
    },
  ]) {
    const asset = await uploadLocalImage(item.src)
    if (!asset) continue
    images.push({
      _type: "image",
      _key: key(),
      asset,
      caption: item.caption,
    })
  }

  await client.createOrReplace({
    _id: "gallery",
    _type: "gallery",
    title: "Image gallery",
    seoDescription: "Image gallery of IANA Financial.",
    images,
  })
  console.log("  singleton: gallery")
}

async function cardsForSlug(slug: string) {
  if (slug === "applications") {
    return [
      await card({
        headline: "Before Applying",
        image: "/images/steps.png",
        imageFit: "contain",
        content: `1. **Renew Your Intentions**
2. **Reflect**
3. **Seek Advice**
4. **Consider Other Avenues**
5. **Trust in God**`,
        linkLabel: "Review these guidelines",
        linkHref: "/before-applying",
      }),
      await card({
        headline: "Award Philosophy",
        image: "/images/step-02.png",
        content: `1. **Sacred Sciences of Islam**
2. **General Financial Help**
3. **Specific Visionaries**`,
        linkLabel: "Review the Award Philosophy",
        linkHref: "/award-philosophy",
      }),
      await card({
        headline: "Frequently Asked Questions",
        image: "/images/step-03.png",
        content: `1. Are there any fees?
2. Are international applicants eligible?
3. What types of loans are available?
4. How do applicants apply?

And more...`,
        linkLabel: "Review the FAQs",
        linkHref: "/faqs",
      }),
      await card({
        headline: "Start Applying",
        image: "/images/step-04.png",
        content: `Now that you have reviewed our guidelines, philosophy and FAQs, you can start applying below:


1. Preliminary Application

2. Final Interest-Free Loan Application`,
        linkLabel: "Apply now",
        linkHref: "/start-applying",
      }),
    ]
  }

  if (slug === "support-iana") {
    return [
      await card({
        headline: "Donate",
        image: "/images/img-RsfAQQQapIcAT0jgfpVlQ (1).jpeg",
        imageFit: "cover",
        content: `### The example of those who spend their wealth in the way of Allah is like a seed \[of grain] which grows seven spikes; in each spike is a hundred grains. And Allah multiplies \[His reward] for whom He wills. And Allah is all-Encompassing and Knowing.


Holy Qur'an (2:261)


* We do not have charitable status: Your donation will not receive a tax-receipt. Instead of tax-receipts, God's gifts are immediate and ever-lasting and come in many shapes and colours!

* Donations will be used to further Iana Financial's vision: This includes providing interest-free loans as well as other initiatives related to Islamic financial community services such as education initiatives or loan forgiveness.

* Every penny counts: Every contribution goes to the pool of funds while all administrative are covered by Iana volunteers.


How to Donate: 


1. Directly to Iana's Servus Credit Union Account – Walk into any Servus Credit Union and donate directly to Iana Financial under the account number: 5176250. **Please leave a memo with your donation indicating your name.**

2. By e-transfer to [support-iana@ianafinancial.org](mailto:support-iana@ianafinancial.org).`,
        linkLabel: "Donate",
        linkHref: "/donate",
      }),
      await card({
        headline: "Save/Lend",
        image: "/images/img-zI09Ogp4aMgUZnE5L5n8G.jpeg",
        imageFit: "cover",
        content: `Lending Iana is an effective way to save your money while helping others. Whether saving for Hajj, towards purchasing a home, for your children's education, or retirement.


It's simple:


1. Contact us to setup your account and a loan agreement.

2. Transfer funds to Iana as often as you like via e-transfer or cheque (these funds help your brothers and sisters with interest-free loans).

3. When you need any funds back, simply reach out and we pay you back via e-transfer or wire insha'Allah – easy!


Contact us for more information - email [support-iana@ianafinancial.org](mailto:support-iana@ianafinancial.org).


This option is far more rewarding than keeping your money in the bank – rather than helping banks lend your money at interest, let Iana help people interest-free!`,
        linkLabel: "Email us to Open a Savings/Lending Account",
        linkHref: "mailto:support-iana@ianafinancial.org",
      }),
    ]
  }

  return []
}

async function card(input: {
  headline: string
  image?: string
  imageFit?: "cover" | "contain"
  content: string
  linkLabel?: string
  linkHref?: string
}) {
  return {
    _key: key(),
    _type: "pageCard",
    headline: input.headline,
    coverImage: await imageField(input.image),
    imageFit: input.imageFit || "cover",
    content: input.content,
    linkLabel: input.linkLabel,
    linkHref: input.linkHref,
  }
}

async function imageField(src?: string) {
  const asset = await uploadLocalImage(src)
  if (!asset) return undefined
  return { _type: "image" as const, asset }
}

async function uploadLocalImage(src?: string) {
  if (!src) return undefined
  if (imageCache.has(src)) return imageCache.get(src)

  const relative = src.replace(/^\//, "")
  const filePath = join(PUBLIC_DIR, relative)
  if (!existsSync(filePath)) {
    console.warn(`  skip missing image: ${src}`)
    return undefined
  }

  const uploaded = await client.assets.upload("image", createReadStream(filePath), {
    filename: basename(filePath),
  })
  const ref = { _type: "reference" as const, _ref: uploaded._id }
  imageCache.set(src, ref)
  return ref
}

async function markdownToPortableText(markdown: string): Promise<PortableBlock[]> {
  const blocks: PortableBlock[] = []
  const pattern = /<(Button|Alert|Youtube|Googlemap)([^>]*?)\/>/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(markdown)) !== null) {
    const before = markdown.slice(lastIndex, match.index)
    blocks.push(...(await markdownSegmentToBlocks(before)))
    blocks.push(customTagToBlock(match[1], parseAttributes(match[2])))
    lastIndex = match.index + match[0].length
  }

  blocks.push(...(await markdownSegmentToBlocks(markdown.slice(lastIndex))))
  return blocks.filter(Boolean)
}

function customTagToBlock(type: string, props: Record<string, string>): PortableBlock {
  switch (type) {
    case "Button":
      return {
        _type: "buttonBlock",
        _key: key(),
        title: props.title || "",
        link: props.link || "",
        alignment: props.alignment || "left",
      }
    case "Alert":
      return {
        _type: "alertBlock",
        _key: key(),
        title: props.title || "",
        description: props.description || "",
        tone: props.type === "warning" ? "warning" : "info",
      }
    case "Youtube":
      return { _type: "youtubeBlock", _key: key(), id: props.id || "" }
    case "Googlemap":
      return { _type: "googlemapBlock", _key: key(), src: props.src || "" }
    default:
      return { _type: "block", _key: key(), style: "normal", markDefs: [], children: [] }
  }
}

async function markdownSegmentToBlocks(markdown: string): Promise<PortableBlock[]> {
  const text = markdown.replace(/\r\n/g, "\n").trim()
  if (!text) return []

  const lines = text.split("\n")
  const blocks: PortableBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i += 1
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      blocks.push(textBlock(`h${heading[1].length}`, heading[2]))
      i += 1
      continue
    }

    const imageOnly = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imageOnly) {
      const image = await imageField(imageOnly[2])
      if (image) {
        blocks.push({ ...image, _key: key(), alt: imageOnly[1] })
      }
      i += 1
      continue
    }

    if (line.trim().startsWith("> ")) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""))
        i += 1
      }
      blocks.push(textBlock("blockquote", quoteLines.join(" ")))
      continue
    }

    if (/^[-*]\s+/.test(line.trim())) {
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        blocks.push(textBlock("normal", lines[i].trim().replace(/^[-*]\s+/, ""), "bullet"))
        i += 1
      }
      continue
    }

    if (/^\d+\.\s+/.test(line.trim())) {
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        blocks.push(
          textBlock("normal", lines[i].trim().replace(/^\d+\.\s+/, ""), "number")
        )
        i += 1
      }
      continue
    }

    const para: string[] = [line]
    i += 1
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].match(/^(#{1,6})\s+/) &&
      !lines[i].trim().startsWith("> ") &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      para.push(lines[i])
      i += 1
    }
    blocks.push(textBlock("normal", para.join(" ").replace(/\s+/g, " ").trim()))
  }

  return blocks
}

function textBlock(
  style: string,
  text: string,
  listItem?: "bullet" | "number"
): PortableBlock {
  const { children, markDefs } = parseInline(unescapeMarkdown(text))
  return {
    _type: "block",
    _key: key(),
    style,
    listItem,
    level: listItem ? 1 : undefined,
    markDefs,
    children,
  }
}

function parseInline(text: string) {
  const markDefs: PortableBlock[] = []
  const children: PortableBlock[] = []
  const re =
    /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*(?!\s)([^*]+)\*|`([^`]+)`/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      children.push(span(text.slice(last, match.index)))
    }
    if (match[1] !== undefined) {
      const markKey = key()
      markDefs.push({ _type: "link", _key: markKey, href: match[2] })
      children.push(span(match[1], [markKey]))
    } else if (match[3] !== undefined) {
      children.push(span(match[3], ["strong"]))
    } else if (match[4] !== undefined) {
      children.push(span(match[4], ["em"]))
    } else if (match[5] !== undefined) {
      children.push(span(match[5], ["code"]))
    }
    last = match.index + match[0].length
  }

  if (last < text.length) children.push(span(text.slice(last)))
  if (children.length === 0) children.push(span(""))
  return { children, markDefs }
}

function span(text: string, marks: string[] = []): PortableBlock {
  return { _type: "span", _key: key(), text, marks }
}

function unescapeMarkdown(text: string) {
  return text.replace(/\\([\\`*_[\]()#+\-.!])/g, "$1")
}

function parseAttributes(attrString: string) {
  const props: Record<string, string> = {}
  const attrPattern = /(\w+)="([^"]*)"/g
  let match: RegExpExecArray | null
  while ((match = attrPattern.exec(attrString)) !== null) {
    props[match[1]] = match[2]
  }
  return props
}

function key() {
  return Math.random().toString(36).slice(2, 12)
}

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return
  const text = readFileSync(filePath, "utf-8")
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue
    const eq = line.indexOf("=")
    if (eq === -1) continue
    const name = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[name]) process.env[name] = value
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
