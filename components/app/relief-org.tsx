"use client"

import { OrgsAndNavQuery } from "@/tina/__generated__/types"
import { tinaField, useTina } from "tinacms/dist/react"
import { TinaMarkdown } from "tinacms/dist/rich-text"

import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

export function OrgComponent(props: {
  data: OrgsAndNavQuery
  variables: {
    relativePath: string
  }
  query: string
}) {
  const { data } = useTina(props)
  return (
    <>
      <SiteHeader nav={data.nav} header={data.header} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        <div className="grow">
          <div className="container mx-auto">
            <div className="prose">
              <h1
                className="text-primary"
                data-tina-field={tinaField(props.data.orgs, "title")}
              >
                {props.data.orgs.title || ""}
              </h1>
            </div>

            <div
              className={`prose max-w-none`}
              data-tina-field={tinaField(props.data.orgs, "content")}
            >
              <TinaMarkdown content={props.data.orgs.content} />
            </div>
          </div>
        </div>
        <Footer footer={data.footer} />
      </div>
    </>
  )
}
