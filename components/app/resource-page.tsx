"use client"

import { useState } from "react"
import Link from "next/link"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Footer } from "@/components/footer"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { SiteHeader } from "@/components/site-header"
import type { Resource } from "@/lib/content/resources"
import type { Nav } from "@/components/site-header"
import type { Header } from "@/components/site-header"
import type { FooterData } from "@/components/footer"

interface ResourceComponentProps {
  resource: Resource
  nav: Nav
  header: Header
  footer: FooterData
}

export function ResourceComponent({
  resource,
  nav,
  header,
  footer,
}: ResourceComponentProps) {
  const categories = Array.from(
    new Set(resource.resources?.map((item) => item.category))
  ).sort()
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0] || ""
  )

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }

  return (
    <>
      <SiteHeader nav={nav} header={header} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        <div className="grow">
          <section className="w-full px-4">
            <div className="container mx-auto">
              <div className="prose">
                <h1 className="text-primary py-4">{resource.title || ""}</h1>
              </div>
              <div className="prose max-w-none">
                <MarkdownRenderer content={resource.description} />
              </div>
              {Array.isArray(resource.resources) &&
                resource.resources.length > 0 && (
                  <>
                    <div className="prose my-2">
                      <h2>Resources:</h2>
                    </div>
                    <Select
                      onValueChange={handleCategoryChange}
                      value={selectedCategory}
                    >
                      <SelectTrigger className="w-min">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Resource Name</TableHead>
                          <TableHead>Link</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resource.resources
                          .filter((item) => item.category === selectedCategory)
                          .map((item, index) => (
                            <TableRow key={item.resourcename || index}>
                              <TableCell className="font-medium">
                                {item.resourcename}
                              </TableCell>
                              <TableCell>
                                <Link
                                  href={item.link}
                                  className="underline hover:no-underline"
                                  target="_blank"
                                >
                                  {item.link}
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </>
                )}
            </div>
          </section>
        </div>
        <Footer footer={footer} />
      </div>
    </>
  )
}
