import { defineField, defineType } from "sanity"

export const alertBlock = defineType({
  name: "alertBlock",
  title: "Alert",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "description", type: "text" }),
    defineField({
      name: "tone",
      type: "string",
      initialValue: "info",
      options: {
        list: [
          { title: "Info", value: "info" },
          { title: "Warning", value: "warning" },
        ],
      },
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
  },
})
