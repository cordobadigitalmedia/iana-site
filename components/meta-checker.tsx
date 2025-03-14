"use client"

import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MetaChecker() {
  const [metaTags, setMetaTags] = useState<Record<string, string>>({})

  useEffect(() => {
    // Get all meta tags from the document head
    const metas = document.querySelectorAll("meta")
    const title = document.querySelector("title")?.textContent || ""

    const metaData: Record<string, string> = { title }

    metas.forEach((meta) => {
      const name =
        meta.getAttribute("name") ||
        meta.getAttribute("property") ||
        meta.getAttribute("itemprop")

      if (name) {
        metaData[name] = meta.getAttribute("content") || ""
      }
    })

    setMetaTags(metaData)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Meta Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(metaTags).map(([key, value]) => (
            <div key={key} className="rounded-md border p-2">
              <div className="text-sm font-medium">{key}</div>
              <div className="truncate text-xs">{value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
