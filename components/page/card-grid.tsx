/* eslint-disable tailwindcss/classnames-order */
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { isAbsoluteLink } from "@/components/utils/parsers"
import { MarkdownRenderer } from "@/components/markdown-renderer"

type ObjectFitValue = "fill" | "contain" | "cover" | "none" | "scale-down"

interface CardLink {
  link: string
  label: string
  style?: "button" | "simple"
}

interface CardItem {
  headline: string
  coverimage?: string
  imageFit?: ObjectFitValue
  content: string
  links?: CardLink[]
}

interface CardGridProps {
  cardblock?: CardItem[]
}

export function CardGrid({ cardblock }: CardGridProps): JSX.Element {
  if (!cardblock || cardblock.length === 0) {
    return <></>
  }

  return (
    <>
      {cardblock.map((item, i) => (
        <div
          className="overflow-hidden rounded-lg bg-white shadow-md"
          key={item.headline || i}
        >
          {item.coverimage && (
            <Image
              alt={item.headline}
              className="h-[150px] w-full object-cover sm:h-[200px]"
              height={300}
              src={item.coverimage}
              style={{
                aspectRatio: "400/300",
                objectFit: item.imageFit || "contain",
              }}
              width={400}
            />
          )}

          <div className="p-4">
            <h3 className="mb-2 text-xl font-bold">{item.headline}</h3>
            {item.content && (
              <div className="prose mb-4 text-gray-600">
                <MarkdownRenderer content={item.content} />
              </div>
            )}
            {item.links && item.links.length > 0 && (
              <div className="flex items-center justify-end gap-2">
                {item.links.map((linkItem, linkIndex) => (
                  <Link
                    href={linkItem.link || ""}
                    key={linkItem.link || linkIndex}
                    target={
                      isAbsoluteLink(linkItem.link) ? "_blank" : "_self"
                    }
                  >
                    {linkItem.style === "button" ? (
                      <Button variant="secondary">{linkItem.label}</Button>
                    ) : (
                      <div>{linkItem.label}</div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  )
}
