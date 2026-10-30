import { defineCliConfig } from "sanity/cli"

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_API_PROJECT_ID
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_API_DATASET

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
})
