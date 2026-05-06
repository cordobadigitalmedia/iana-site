'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export type SectionSpec = { value: string; title: string };

type Props = {
  sections: SectionSpec[];
  defaultOpen?: string[];
  children: React.ReactNode;
};

export function ApplicationDetailAccordion({
  sections,
  defaultOpen = ['overview'],
  children,
}: Props) {
  const childArray = React.Children.toArray(children);
  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpen}
      className="w-full"
    >
      {sections.map((section, i) => (
        <AccordionItem key={section.value} value={section.value}>
          <AccordionTrigger className="text-base font-semibold">
            {section.title}
          </AccordionTrigger>
          <AccordionContent>
            {childArray[i] ?? null}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
