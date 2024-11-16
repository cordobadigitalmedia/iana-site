import Image from "next/image"
import Link from "next/link"
import { PageBlocksCardgrid } from "@/tina/__generated__/types"
import { Card } from "flowbite-react"
import { tinaField } from "tinacms/dist/react"
import { TinaMarkdown } from "tinacms/dist/rich-text"

import { Button } from "@/components/ui/button"

export function CardGrid(props: PageBlocksCardgrid): JSX.Element {
  const { cardblock } = props
  return (
    <>
      {cardblock && cardblock?.length > 0 && (
        <div className="container m-4 mx-auto">
          <div className="grid w-full grid-cols-2 justify-center gap-5">
            {cardblock.map((item, i) => {
              const backgroundImage = item?.coverimage
                ? `${item?.coverimage}`
                : "none"
              const imagePos = item?.coverPosition
                ? `${item?.coverPosition}`
                : "top"
              return (
                <Card
                  data-tina-field={tinaField(item, "coverimage")}
                  imgSrc={backgroundImage}
                  horizontal={imagePos === "left"}
                  style={{ maxWidth: "none", width: "100%" }}
                >
                  <h3
                    className="mb-2 w-full text-xl font-bold"
                    data-tina-field={tinaField(item, "headline")}
                  >
                    {item?.headline as string}
                  </h3>
                  <div
                    className="prose mb-4 text-gray-600"
                    data-tina-field={tinaField(item, "content")}
                  >
                    <TinaMarkdown content={item?.content} />
                  </div>
                  {item?.links && item?.links.length > 0 && (
                    <div className="flex items-center justify-end gap-2">
                      {item?.links.map((linkItem) => (
                        <Link
                          href={linkItem?.link || ""}
                          data-tina-field={tinaField(linkItem, "link")}
                          key={linkItem?.link}
                        >
                          {linkItem?.style === "button" ? (
                            <Button
                              variant="secondary"
                              data-tina-field={tinaField(linkItem, "label")}
                            >
                              {linkItem?.label}
                            </Button>
                          ) : (
                            <div data-tina-field={tinaField(linkItem, "label")}>
                              {linkItem?.label}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
