import { MarkdownRenderer } from "@/components/markdown-renderer"

interface PageContentProps {
  children?: React.ReactNode
  content?: string
  backgroundColor?: string
  textAlign?: "left" | "center" | "right"
}

export function PageContent({
  children,
  content,
  backgroundColor,
  textAlign = "left",
}: PageContentProps) {
  const bgStyle = backgroundColor ? `bg-${backgroundColor}` : ""
  const textAlignClass = `text-${textAlign}`
  const isCenter = textAlign === "center"

  const markdownContent = content || (typeof children === "string" ? children : "")

  return (
    <section className={`w-full px-4 py-3 ${bgStyle} ${textAlignClass}`}>
      <div className="container mx-auto">
        <div
          className={`prose max-w-none ${
            isCenter && `[&_img]:mx-auto [&_img]:block`
          }`}
        >
          {markdownContent ? (
            <MarkdownRenderer content={markdownContent} />
          ) : (
            children
          )}
        </div>
      </div>
    </section>
  )
}
