import { PageBlocksPageContent } from "@/tina/__generated__/types"
import { tinaField } from "tinacms/dist/react"
import { TinaMarkdown } from "tinacms/dist/rich-text"

import { components } from "./components"

export function PageContent(props: PageBlocksPageContent) {
  let bgStyle = ""
  if (props.backgroundColor) {
    bgStyle = `bg-${props.backgroundColor}`
  }
  let textAlign = "text-left"
  if (props.textAlign) {
    textAlign = `text-${props.textAlign}`
  }
  const isCenter =
    props.textAlign && props.textAlign === "center" ? true : false
  return (
    <section className={`w-full px-4 ${bgStyle} ${textAlign}`}>
      <div className="container mx-auto">
        <div
          className={`prose max-w-none ${
            isCenter && `[&_img]:mx-auto [&_img]:block`
          }`}
          data-tina-field={tinaField(props, "content")}
        >
          <TinaMarkdown content={props.content} components={components} />
        </div>
      </div>
    </section>
  )
}
