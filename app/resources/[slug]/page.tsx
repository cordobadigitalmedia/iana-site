import React from "react"
import client from "@/tina/__generated__/client"

import { ResourceComponent } from "@/components/app/resource-page"

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const result = await client.queries.ResourcesAndNav({
    relativePath: `${(await params).slug}.mdx`,
  })
  return <ResourceComponent {...result} />
}
