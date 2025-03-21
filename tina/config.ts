import { defineConfig } from "tinacms"

import { RichTextTemplates } from "./rich-text-templates"

const backgroundColorOptions = ["none", "primary", "secondary", "muted"]

export default defineConfig({
  branch: process.env.VERCEL_GIT_COMMIT_REF || "main",
  clientId: process.env.TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: {
    publicFolder: "public",
    outputFolder: "admin",
  },
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "images",
    },
    accept: ["image"],
  },
  schema: {
    collections: [
      {
        name: "page",
        label: "Pages",
        path: "content/pages",
        format: "mdx",
        ui: {
          router: (props) => {
            return `/${props.document._sys.filename}`
          },
        },
        fields: [
          {
            name: "title",
            label: "Page title",
            description: "For SEO purposes",
            type: "string",
          },
          {
            type: "object",
            name: "seo",
            label: "SEO Metadata",
            fields: [
              {
                type: "string",
                name: "title",
                label: "SEO Title",
                description: "Overrides the default page title for SEO",
              },
              {
                type: "string",
                name: "description",
                label: "Description",
                description: "Page description for search engines",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "image",
                name: "ogImage",
                label: "Social Share Image",
                description: "Image displayed when shared on social media",
              },
              {
                type: "string",
                name: "keywords",
                label: "Keywords",
                description: "Comma-separated keywords for search engines",
              },
            ],
          },
          {
            name: "blocks",
            label: "Content Blocks",
            description:
              "You can re-order them as needed and have different blocks on each page",
            type: "object",
            list: true,
            templates: [
              {
                name: "pageContent",
                label: "Main Content",
                fields: [
                  {
                    name: "content",
                    type: "rich-text",
                    label: "Content",
                    description: "Rich content for page",
                    templates: RichTextTemplates,
                  },
                  {
                    type: "string",
                    name: "backgroundColor",
                    label: "Background color type",
                    options: backgroundColorOptions,
                  },
                  {
                    type: "string",
                    name: "textAlign",
                    label: "Text Alignment",
                    options: ["left", "center", "right"],
                  },
                ],
              },
              {
                name: "welcomeHero",
                label: "Hero Section",
                fields: [
                  {
                    name: "title",
                    type: "string",
                    label: "Hero Title",
                  },
                  {
                    name: "message",
                    type: "rich-text",
                    label: "Hero Message",
                  },
                  {
                    name: "links",
                    label: "Hero links",
                    type: "object",
                    list: true,
                    ui: {
                      itemProps: (item) => {
                        // Field values are accessed by item?.<Field name>
                        return { label: item?.label }
                      },
                    },
                    fields: [
                      {
                        type: "string",
                        name: "link",
                        label: "Relative or absolute link",
                      },
                      {
                        type: "string",
                        name: "label",
                        label: "Link/Button Text",
                      },
                      {
                        type: "string",
                        name: "style",
                        label: "Link type",
                        options: ["simple", "button"],
                      },
                    ],
                  },
                  {
                    type: "string",
                    name: "backgroundType",
                    label: "Background Type",
                    description: "Only the type specified will be used",
                    options: [
                      { label: "Image", value: "image" },
                      { label: "Color", value: "color" },
                    ],
                  },
                  {
                    name: "backgroundImage",
                    label: "Hero Background Image",
                    type: "image",
                  },
                  {
                    name: "backgroundColor",
                    label: "Hero Background Color",
                    type: "string",
                    ui: {
                      component: "color",
                    },
                  },
                ],
              },
              {
                name: "coverSection",
                label: "Cover Section",
                fields: [
                  {
                    name: "headline",
                    type: "string",
                    label: "Cover Headline",
                  },
                  {
                    name: "content",
                    label: "Cover Content",
                    type: "rich-text",
                  },
                  {
                    name: "backgroundImage",
                    label: "Cover Background Image",
                    type: "image",
                  },
                  {
                    name: "backgroundColor",
                    label: "Background Color",
                    type: "string",
                    ui: {
                      component: "color",
                    },
                  },
                ],
              },
              {
                name: "featuredPosts",
                label: "Featured Posts",
                fields: [
                  {
                    name: "Posts",
                    label: "Featured Posts",
                    list: true,
                    type: "object",
                    ui: {
                      itemProps: (item) => {
                        return { label: item.label }
                      },
                    },
                    fields: [
                      {
                        name: "label",
                        label: "Label",
                        type: "string",
                      },
                      {
                        name: "featuredPost",
                        label: "Featured Post",
                        type: "reference",
                        collections: ["post"],
                      },
                    ],
                  },
                ],
              },
              {
                name: "cardgrid",
                label: "Card Grid with 3 Columns",
                ui: {
                  itemProps: (item) => {
                    return { label: item.gridTitle }
                  },
                },
                fields: [
                  {
                    name: "cardblock",
                    label: "Card Block",
                    type: "object",
                    list: true,
                    ui: {
                      itemProps: (item) => {
                        return { label: item.headline }
                      },
                    },
                    fields: [
                      {
                        name: "headline",
                        label: "Headline",
                        type: "string",
                      },
                      {
                        name: "coverimage",
                        label: "Cover Image",
                        type: "image",
                      },
                      {
                        name: "imageFit",
                        label: "Cover Image Fit",
                        type: "string",
                        options: [
                          { label: "Cover area with image", value: "cover" },
                          { label: "Fit image in area", value: "contain" },
                        ],
                      },
                      {
                        name: "content",
                        label: "Content",
                        type: "rich-text",
                      },
                      {
                        name: "links",
                        label: "Links",
                        type: "object",
                        list: true,
                        ui: {
                          itemProps: (item) => {
                            return { label: item.label }
                          },
                        },
                        fields: [
                          {
                            type: "string",
                            name: "link",
                            label: "Relative or absolute link",
                          },
                          {
                            type: "string",
                            name: "label",
                            label: "Button/Link Text",
                          },
                          {
                            type: "string",
                            name: "style",
                            label: "Link Type",
                            options: [
                              { label: "Simple link", value: "simple" },
                              { label: "Clickable Button", value: "button" },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    name: "gridTitle",
                    label: "Card Grid Title",
                    type: "string",
                  },
                ],
              },
              {
                name: "cardgrid2Col",
                label: "Card Grid with 2 Columns",
                ui: {
                  itemProps: (item) => {
                    return { label: item.gridTitle }
                  },
                },
                fields: [
                  {
                    name: "cardblock",
                    label: "Card Block",
                    type: "object",
                    list: true,
                    ui: {
                      itemProps: (item) => {
                        return { label: item.headline }
                      },
                    },
                    fields: [
                      {
                        name: "headline",
                        label: "Headline",
                        type: "string",
                      },
                      {
                        name: "coverimage",
                        label: "Cover Image",
                        type: "image",
                      },
                      {
                        name: "imageFit",
                        label: "Cover Image Fit",
                        type: "string",
                        options: [
                          { label: "Cover area with image", value: "cover" },
                          { label: "Fit image in area", value: "contain" },
                        ],
                      },
                      {
                        name: "content",
                        label: "Content",
                        type: "rich-text",
                      },
                      {
                        name: "links",
                        label: "Links",
                        type: "object",
                        list: true,
                        ui: {
                          itemProps: (item) => {
                            return { label: item.label }
                          },
                        },
                        fields: [
                          {
                            type: "string",
                            name: "link",
                            label: "Relative or absolute link",
                          },
                          {
                            type: "string",
                            name: "label",
                            label: "Button/Link Text",
                          },
                          {
                            type: "string",
                            name: "style",
                            label: "Link Type",
                            options: [
                              { label: "Simple link", value: "simple" },
                              { label: "Clickable Button", value: "button" },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    name: "gridTitle",
                    label: "Card Grid Title",
                    type: "string",
                  },
                ],
              },
              {
                name: "gallery",
                label: "Image Gallery",
                ui: {
                  itemProps: (item) => {
                    return { label: item.galleryTitle }
                  },
                },
                fields: [
                  {
                    name: "galleryImages",
                    label: "Gallery Images",
                    type: "object",
                    list: true,
                    ui: {
                      itemProps: (item) => {
                        return { label: item.caption }
                      },
                    },
                    fields: [
                      {
                        name: "caption",
                        label: "Caption",
                        type: "string",
                      },
                      {
                        name: "galleryImage",
                        label: "Gallery Image",
                        type: "image",
                      },
                    ],
                  },
                  {
                    name: "galleryTitle",
                    label: "Image Gallery Title",
                    type: "string",
                  },
                ],
              },
              {
                name: "collapsibleSection",
                label: "Collapsible Blocks",
                ui: {
                  itemProps: (item) => {
                    return { label: item.collapsibleTitle }
                  },
                },
                fields: [
                  {
                    name: "accordionBlock",
                    label: "Collapsible Block",
                    type: "object",
                    list: true,
                    ui: {
                      itemProps: (item) => {
                        return { label: item.headline }
                      },
                    },
                    fields: [
                      {
                        name: "headline",
                        label: "Headline",
                        type: "string",
                      },
                      {
                        name: "content",
                        label: "Content",
                        type: "rich-text",
                        description: "content for the collapsible block",
                        templates: RichTextTemplates,
                      },
                    ],
                  },
                  {
                    name: "collapsibleTitle",
                    label: "Collapsible Elements Title",
                    type: "string",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "resources",
        label: "Resources",
        path: "content/resources",
        format: "mdx",
        ui: {
          router: (props) => {
            return `/resources/${props.document._sys.filename}`
          },
        },
        fields: [
          {
            name: "title",
            label: "Resource title",
            description: "For SEO purposes",
            type: "string",
          },
          {
            name: "description",
            label: "Resource Description",
            type: "rich-text",
            templates: RichTextTemplates,
          },
          {
            name: "resources",
            label: "Resource Links",
            type: "object",
            list: true,
            ui: {
              itemProps: (item) => {
                // Field values are accessed by item?.<Field name>
                return { label: `${item?.category}: ${item?.resourcename}` }
              },
            },
            fields: [
              {
                type: "string",
                name: "link",
                label: "Absolute URL",
              },
              {
                type: "string",
                name: "resourcename",
                label: "Resource Name",
              },
              {
                type: "string",
                name: "category",
                label: "Region category",
                options: [
                  "Canada",
                  "United States",
                  "International",
                  "Local & Provincial",
                ],
              },
            ],
          },
        ],
      },
      {
        name: "post",
        label: "Posts",
        path: "content/posts",
        format: "md",
        fields: [
          {
            name: "title",
            label: "Title",
            type: "string",
          },
          {
            name: "author",
            label: "Author",
            type: "reference",
            collections: ["author"],
          },
          {
            name: "image",
            label: "Image",
            type: "image",
          },
          {
            name: "description",
            label: "Description",
            type: "string",
            ui: {
              component: "textarea",
            },
          },
          {
            name: "body",
            label: "Body",
            type: "rich-text",
            isBody: true,
          },
        ],
      },
      {
        name: "author",
        label: "Post Authors",
        path: "content/authors",
        format: "md",
        fields: [
          {
            name: "name",
            label: "Name",
            type: "string",
          },
          {
            name: "image",
            label: "Image",
            type: "image",
          },
        ],
      },
      {
        name: "nav",
        label: "Nav (Sitewide)",
        path: "content/nav",
        format: "md",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
          global: true,
        },
        fields: [
          {
            name: "links",
            label: "Links",
            type: "object",
            list: true,
            ui: {
              itemProps: (item) => {
                return { label: item.label }
              },
            },
            fields: [
              { type: "string", name: "label", label: "Label" },
              {
                type: "string",
                name: "link",
                label: "Relative or External Link",
              },
              {
                name: "linkedPage",
                label: "Linked Page",
                type: "reference",
                collections: ["page"],
              },
              {
                type: "string",
                name: "linkType",
                label: "Link type",
                options: ["relative", "page", "external"],
              },
              {
                type: "string",
                name: "buttonStyle",
                label: "Button type",
                options: ["ghost", "default", "secondary"],
              },
            ],
          },
        ],
      },
      {
        name: "header",
        label: "Header (Sitewide)",
        path: "content/header",
        format: "json",
        ui: {
          global: true,
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        defaultItem: () => {
          return {
            logoWidth: 50,
            logoHeight: 50,
            headerHeight: 64,
          }
        },
        fields: [
          {
            name: "logo",
            label: "Logo",
            type: "image",
          },
          {
            name: "logoTitle",
            label: "Logo Title",
            description: "Show a title next to the logo",
            type: "string",
          },
          {
            name: "logoWidth",
            label: "Logo Width",
            description: "Minimum Logo Width",
            type: "number",
          },
          {
            name: "logoHeight",
            label: "Logo Height",
            description: "Minimum Logo Height",
            type: "number",
          },
          {
            name: "headerHeight",
            label: "Header Height",
            description: "Minimum Header Height",
            type: "number",
          },
          {
            name: "siteTitle",
            label: "Site Title",
            type: "string",
            description: "used for SEO title",
          },
          {
            name: "siteDescription",
            label: "Site Description",
            type: "string",
            description: "used for SEO description",
          },
          {
            name: "navAlignment",
            label: "Right align navigation",
            description: "Left align when off, Right align when on",
            type: "boolean",
          },
          {
            type: "string",
            name: "backgroundColor",
            label: "Background color type",
            options: backgroundColorOptions,
          },
          {
            type: "object",
            name: "ctaButton",
            label: "Call to action button",
            fields: [
              { name: "title", type: "string" },
              { name: "link", type: "string" },
              {
                name: "type",
                type: "string",
                options: ["relative", "absolute"],
              },
            ],
          },
          {
            name: "darkmode",
            label: "Show Dark/Light Mode Switcher",
            description: "Placed on the top right. Light/Dark mode switcher",
            type: "boolean",
          },
          {
            name: "userlogin",
            label: "Show Log in/Sign Up/Avatar",
            description:
              "Placed on the top right. Uses Kinde.com to manage the user authentication system",
            type: "boolean",
          },
        ],
      },
      {
        name: "footer",
        label: "Footer (Sitewide)",
        path: "content/footer",
        format: "json",
        ui: {
          global: true,
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "object",
            label: "Social Links",
            description:
              "Direct link to your social media account - leave empty if N/A",
            name: "social",
            fields: [
              {
                type: "string",
                label: "Facebook",
                name: "facebook",
              },
              {
                type: "string",
                label: "Twitter",
                name: "twitter",
              },
              {
                type: "string",
                label: "Instagram",
                name: "instagram",
              },
              {
                type: "string",
                label: "Github",
                name: "github",
              },
              {
                type: "string",
                label: "YouTube",
                name: "youtube",
              },
              {
                type: "string",
                label: "Email",
                name: "email",
              },
            ],
          },
          {
            name: "copyright",
            label: "Copyright notice",
            type: "string",
          },
          {
            type: "string",
            name: "backgroundColor",
            label: "Background color type",
            options: backgroundColorOptions,
          },
        ],
      },
    ],
  },
})
