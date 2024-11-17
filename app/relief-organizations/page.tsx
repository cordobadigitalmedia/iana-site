import React from "react"
import client from "@/tina/__generated__/client"

import { OrgComponent } from "@/components/app/relief-org"

export default async function IndexPage() {
  const result = await client.queries.orgsAndNav({ relativePath: "orgs.md" })
  return <OrgComponent {...result} />
}
