import { defineField, defineType } from "sanity"

export const pageCard = defineType({
  name: "pageCard",
  title: "Card",
  type: "object",
  fields: [
    defineField({ name: "headline", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "coverImage", type: "image", options: { hotspot: true } }),
    defineField({
      name: "imageFit",
      type: "string",
      initialValue: "cover",
      options: {
        list: [
          { title: "Cover", value: "cover" },
          { title: "Contain", value: "contain" },
        ],
      },
    }),
    defineField({ name: "content", title: "Body (markdown)", type: "text", rows: 8 }),
    defineField({
      name: "linkLabel",
      type: "string",
    }),
    defineField({
      name: "linkHref",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "headline", media: "coverImage" },
  },
})
