/* eslint-disable tailwindcss/classnames-order */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { MarkdownRenderer } from "@/components/markdown-renderer"

interface AccordionItem {
  headline: string
  content: string
}

interface CollapsibleSectionProps {
  accordionBlock?: AccordionItem[]
}

export function CollapsibleSection({
  accordionBlock,
}: CollapsibleSectionProps): JSX.Element {
  if (!accordionBlock || accordionBlock.length === 0) {
    return <></>
  }

  return (
    <div className="container mx-auto">
      <Accordion type="single" collapsible className="w-full">
        {accordionBlock.map((item, i) => (
          <AccordionItem key={i} value={item.headline}>
            <AccordionTrigger className="text-lg text-primary">
              {item.headline}
            </AccordionTrigger>
            <AccordionContent>
              <div className="prose max-w-none">
                <MarkdownRenderer content={item.content} />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
