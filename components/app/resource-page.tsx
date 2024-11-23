"use client"

import { useState } from "react"
import Link from "next/link"
import { ResourcesAndNavQuery } from "@/tina/__generated__/types"
import { tinaField, useTina } from "tinacms/dist/react"
import { TinaMarkdown } from "tinacms/dist/rich-text"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Footer } from "@/components/footer"
import { components } from "@/components/page/components"
import { SiteHeader } from "@/components/site-header"

export function ResourceComponent(props: {
  data: ResourcesAndNavQuery
  variables: {
    relativePath: string
  }
  query: string
}) {
  const { data } = useTina(props)

  const categories = Array.from(
    new Set(data.resources.resources?.map((item) => item?.category))
  ).sort()
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0] as string
  )

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }
  return (
    <>
      <SiteHeader nav={data.nav} header={data.header} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        <div className="grow">
          <section className="w-full px-4">
            <div className="container mx-auto">
              <div className="prose">
                <h1
                  className="text-primary py-4"
                  data-tina-field={tinaField(data.resources, "title")}
                >
                  {data.resources.title || ""}
                </h1>
              </div>
              <div
                className={`prose max-w-none`}
                data-tina-field={tinaField(data.resources, "description")}
              >
                <TinaMarkdown
                  content={data.resources.description}
                  components={components}
                />
              </div>
              {Array.isArray(data.resources.resources) &&
                data.resources.resources?.length > 0 && (
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
                          <SelectItem key={category} value={category as string}>
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
                        {data.resources.resources
                          ?.filter(
                            (item) => item?.category === selectedCategory
                          )
                          .map((item) => (
                            <TableRow key={item?.resourcename}>
                              <TableCell
                                className="font-medium"
                                data-tina-field={tinaField(
                                  item,
                                  "resourcename"
                                )}
                              >
                                {item?.resourcename}
                              </TableCell>
                              <TableCell>
                                <Link
                                  href={item?.link || ""}
                                  className="underline hover:no-underline"
                                  target="_blank"
                                  data-tina-field={tinaField(item, "link")}
                                >
                                  {item?.link}
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
        <Footer footer={data.footer} />
      </div>
    </>
  )
}
