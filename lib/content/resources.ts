import { readFile } from "fs/promises"
import { join } from "path"
import matter from "gray-matter"

const contentDir = join(process.cwd(), "content", "resources")

export interface ResourceItem {
  link: string
  resourcename: string
  category: string
}

export interface Resource {
  title: string
  description: string
  resources: ResourceItem[]
}

/**
 * Reads and parses a resource file
 * @param slug - The resource slug (filename without extension)
 * @returns The parsed resource data
 */
export async function readResource(slug: string): Promise<Resource> {
  try {
    // Read markdown content
    const mdPath = join(contentDir, `${slug}.md`)
    const mdContent = await readFile(mdPath, "utf-8")
    const { data: mdData } = matter(mdContent)
    
    // Read JSON resources data
    const jsonPath = join(contentDir, `${slug}.json`)
    let resources: ResourceItem[] = []
    try {
      const jsonContent = await readFile(jsonPath, "utf-8")
      const jsonData = JSON.parse(jsonContent)
      resources = jsonData.resources || []
    } catch (error) {
      // If JSON doesn't exist, try to get resources from MDX frontmatter
      console.warn(`No JSON file found for ${slug}, trying MDX`)
    }
    
    return {
      title: mdData.title || "",
      description: mdData.description || mdContent,
      resources,
    }
  } catch (error) {
    console.error(`Error reading resource ${slug}:`, error)
    throw error
  }
}

