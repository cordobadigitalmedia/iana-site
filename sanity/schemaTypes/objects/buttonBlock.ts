import { defineField, defineType } from "sanity"

export const buttonBlock = defineType({
  name: "buttonBlock",
  title: "Button",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "link", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "alignment",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Center", value: "center" },
          { title: "Right", value: "right" },
        ],
      },
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "link" },
  },
})
