"use client"

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
  console.log(data.resources)
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
                data-tina-field={tinaField(
                  data.resources.description,
                  "description"
                )}
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
                    <Select>
                      <SelectTrigger className="w-min">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="usa">United States</SelectItem>
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
                        {data.resources.resources?.map((item) => (
                          <TableRow key={item?.resourcename}>
                            <TableCell className="font-medium">
                              {item?.resourcename}
                            </TableCell>
                            <TableCell>
                              <Link
                                href={item?.link as string}
                                className="underline hover:no-underline"
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
