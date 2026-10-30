import { defineArrayMember, defineField, defineType } from "sanity"

export const pageType = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) =>
        Rule.required().custom((slug) => {
          const reserved = [
            "studio",
            "api",
            "blog",
            "resources",
            "admin",
            "apply",
            "contract",
            "respond",
            "gallery",
          ]
          const value = slug?.current
          if (!value) return "Slug is required"
          if (reserved.includes(value)) return `"${value}" is a reserved path`
          return true
        }),
    }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({ name: "coverImage", type: "image", options: { hotspot: true } }),
    defineField({ name: "coverHeadline", type: "string" }),
    defineField({ name: "coverContent", title: "Cover subtitle (markdown)", type: "text" }),
    defineField({
      name: "published",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "bodyTextAlign",
      type: "string",
      initialValue: "left",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Center", value: "center" },
          { title: "Right", value: "right" },
        ],
      },
    }),
    defineField({
      name: "body",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({ type: "image", options: { hotspot: true } }),
        defineArrayMember({ type: "buttonBlock" }),
        defineArrayMember({ type: "alertBlock" }),
        defineArrayMember({ type: "youtubeBlock" }),
        defineArrayMember({ type: "googlemapBlock" }),
      ],
    }),
    defineField({
      name: "cardsTitle",
      type: "string",
    }),
    defineField({
      name: "cards",
      type: "array",
      of: [{ type: "pageCard" }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current", media: "coverImage" },
  },
})
