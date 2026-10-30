import { defineField, defineType } from "sanity"

export const heroLink = defineType({
  name: "heroLink",
  title: "Hero link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "link", type: "string", validation: (Rule) => Rule.required() }),
  ],
})
