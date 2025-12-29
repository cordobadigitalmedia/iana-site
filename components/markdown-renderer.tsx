"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { GoogleMap } from "@/components/ui/iframe-googlemap"
import { VideoPlayer } from "@/components/ui/iframe-video"

interface MarkdownRendererProps {
  content: string
  className?: string
}

/**
 * Custom component to render markdown with support for custom component tags
 * Handles: Button, Alert, Youtube, Googlemap
 */
export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  // Process content to extract and render component tags
  const processedContent = processComponentTags(content)

  return (
    <div className={className}>
      {processedContent.map((item, index) => {
        if (item.type === "component") {
          return <React.Fragment key={index}>{item.component}</React.Fragment>
        }
        return (
          <ReactMarkdown
            key={index}
            components={{
              a: ({ href, children, ...props }: any) => {
                if (!href) return <>{children}</>
                if (href.startsWith("https") || href.startsWith("mailto:")) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  )
                }
                return (
                  <Link href={href} {...props}>
                    {children}
                  </Link>
                )
              },
              img: ({ src, alt, ...props }: any) => {
                // eslint-disable-next-line @next/next/no-img-element
                return <img src={src} alt={alt || ""} {...props} />
              },
            }}
          >
            {item.content || ""}
          </ReactMarkdown>
        )
      })}
    </div>
  )
}

interface ProcessedItem {
  type: "markdown" | "component"
  content?: string
  component?: React.ReactNode
}

/**
 * Processes markdown content to extract component tags and split into segments
 */
function processComponentTags(content: string): ProcessedItem[] {
  const items: ProcessedItem[] = []
  const componentPattern =
    /<(Button|Alert|Youtube|Googlemap)([^>]*?)\/>/g

  let lastIndex = 0
  let match

  while ((match = componentPattern.exec(content)) !== null) {
    // Add markdown before the component
    if (match.index > lastIndex) {
      const markdownContent = content.substring(lastIndex, match.index).trim()
      if (markdownContent) {
        items.push({ type: "markdown", content: markdownContent })
      }
    }

    // Extract and render the component
    const [fullMatch, type, attributes] = match
    const props = parseAttributes(attributes)
    const component = renderComponent(type as string, props)

    items.push({ type: "component", component })

    lastIndex = match.index + fullMatch.length
  }

  // Add remaining markdown after last component
  if (lastIndex < content.length) {
    const markdownContent = content.substring(lastIndex).trim()
    if (markdownContent) {
      items.push({ type: "markdown", content: markdownContent })
    }
  }

  // If no components found, return the whole content as markdown
  if (items.length === 0) {
    items.push({ type: "markdown", content })
  }

  return items
}

/**
 * Parses HTML attributes string into an object
 */
function parseAttributes(attrString: string): Record<string, string> {
  const props: Record<string, string> = {}
  const attrPattern = /(\w+)="([^"]*)"/g
  let match

  while ((match = attrPattern.exec(attrString)) !== null) {
    const [, key, value] = match
    props[key] = value
  }

  return props
}

/**
 * Renders a component based on its type and props
 */
function renderComponent(
  type: string,
  props: Record<string, string>
): React.ReactNode {
  switch (type) {
    case "Button":
      return (
        <Button asChild>
          <Link href={props.link || ""}>{props.title || ""}</Link>
        </Button>
      )
    case "Alert":
      return (
        <Alert variant={props.type === "info" ? "default" : "destructive"}>
          {props.title && <AlertTitle>{props.title}</AlertTitle>}
          {props.description && (
            <AlertDescription>{props.description}</AlertDescription>
          )}
        </Alert>
      )
    case "Youtube":
      return <VideoPlayer url={`https://www.youtube.com/embed/${props.id}`} />
    case "Googlemap":
      return <GoogleMap url={props.src} />
    default:
      return null
  }
}

