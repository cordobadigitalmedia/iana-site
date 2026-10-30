import { defineField, defineType } from "sanity"

export const galleryType = defineType({
  name: "gallery",
  title: "Gallery",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "seoDescription", type: "text" }),
    defineField({
      name: "images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "caption", type: "string" }],
        },
      ],
    }),
  ],
})
