import type { Metadata } from "next"
import { readResource } from "@/lib/content/resources"
import { readNav } from "@/lib/content/nav"
import { readHeader } from "@/lib/content/header"
import { readFooter } from "@/lib/content/footer"

import { ResourceComponent } from "@/components/app/resource-page"

export const dynamic = "force-static"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const resource = await readResource(slug)
    return {
      title: `${resource.title} | IANA Financial`,
      description: resource.description.substring(0, 160),
    }
  } catch (error) {
    return {
      title: "Resource Not Found",
    }
  }
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [resource, nav, header, footer] = await Promise.all([
    readResource(slug),
    readNav(),
    readHeader(),
    readFooter(),
  ])

  return (
    <ResourceComponent
      resource={resource}
      nav={nav as any}
      header={header as any}
      footer={footer as any}
    />
  )
}
