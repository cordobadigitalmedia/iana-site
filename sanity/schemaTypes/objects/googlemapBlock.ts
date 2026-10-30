import { defineField, defineType } from "sanity"

export const googlemapBlock = defineType({
  name: "googlemapBlock",
  title: "Google Map",
  type: "object",
  fields: [
    defineField({
      name: "src",
      title: "Embed URL",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
  ],
})
