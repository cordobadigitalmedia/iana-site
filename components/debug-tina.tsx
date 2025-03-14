"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DebugTinaProps {
  data: any
  title?: string
}

export function DebugTina({ data, title = "TinaCMS Debug" }: DebugTinaProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="my-4">
      <Button
        variant="outline"
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2"
      >
        {isVisible ? "Hide" : "Show"} {title}
      </Button>

      {isVisible && (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted max-h-[500px] overflow-auto rounded-md p-4 text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
