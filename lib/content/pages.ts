import { readFile } from "fs/promises"
import { join } from "path"

const contentDir = join(process.cwd(), "content", "pages")

/**
 * Reads markdown content from a page file
 * @param slug - The page slug (filename without extension)
 * @returns The markdown content as a string
 */
export async function readPageContent(slug: string): Promise<string> {
  try {
    const filePath = join(contentDir, `${slug}.md`)
    const content = await readFile(filePath, "utf-8")
    return content
  } catch (error) {
    console.error(`Error reading page content for ${slug}:`, error)
    throw error
  }
}

/**
 * Lists all available page slugs
 * @returns Array of page slugs
 */
export async function getAllPageSlugs(): Promise<string[]> {
  try {
    const { readdir } = await import("fs/promises")
    const files = await readdir(contentDir)
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ""))
  } catch (error) {
    console.error("Error reading page directory:", error)
    return []
  }
}

