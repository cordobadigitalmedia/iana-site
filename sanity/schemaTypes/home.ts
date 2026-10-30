import { defineField, defineType } from "sanity"

export const homeType = defineType({
  name: "home",
  title: "Home",
  type: "document",
  fields: [
    defineField({ name: "seoTitle", type: "string" }),
    defineField({ name: "seoDescription", type: "text", rows: 3 }),
    defineField({ name: "heroTitle", type: "string" }),
    defineField({ name: "heroMessage", title: "Hero message (markdown)", type: "text", rows: 6 }),
    defineField({ name: "heroBackgroundImage", type: "image", options: { hotspot: true } }),
    defineField({ name: "heroBackgroundColor", type: "string" }),
    defineField({
      name: "heroLinks",
      type: "array",
      of: [{ type: "heroLink" }],
    }),
    defineField({
      name: "cards",
      type: "array",
      of: [{ type: "pageCard" }],
    }),
  ],
})
