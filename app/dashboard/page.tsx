import React, { Suspense } from "react"
import client from "@/tina/__generated__/client"

import { Dashboard } from "./dashboard"

export default async function Page() {
  const result = await client.queries.pageAndNav({
    relativePath: `home.mdx`,
  })
  return (
    <Suspense>
      <Dashboard {...result} />
    </Suspense>
  )
}
