import { defineField, defineType } from "sanity"

export const youtubeBlock = defineType({
  name: "youtubeBlock",
  title: "YouTube",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "Video ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "id" },
    prepare: ({ title }) => ({ title: title ? `YouTube: ${title}` : "YouTube" }),
  },
})
