import type { SchemaTypeDefinition } from "sanity"

import { alertBlock } from "./objects/alertBlock"
import { buttonBlock } from "./objects/buttonBlock"
import { googlemapBlock } from "./objects/googlemapBlock"
import { heroLink } from "./objects/heroLink"
import { pageCard } from "./objects/pageCard"
import { youtubeBlock } from "./objects/youtubeBlock"
import { galleryType } from "./gallery"
import { homeType } from "./home"
import { pageType } from "./page"

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    pageType,
    homeType,
    galleryType,
    pageCard,
    heroLink,
    buttonBlock,
    alertBlock,
    youtubeBlock,
    googlemapBlock,
  ],
}
