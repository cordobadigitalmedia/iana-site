import { readFile, readdir } from "fs/promises"
import { join } from "path"
import matter from "gray-matter"

const contentDir = join(process.cwd(), "content", "authors")

export interface Author {
  name: string
  image?: string
  slug: string
}

/**
 * Reads and parses an author file
 * @param slug - The author slug (filename without extension)
 * @returns The parsed author data
 */
export async function readAuthor(slug: string): Promise<Author> {
  try {
    const filePath = join(contentDir, `${slug}.md`)
    const fileContent = await readFile(filePath, "utf-8")
    const { data } = matter(fileContent)
    return {
      name: data.name || "",
      image: data.image,
      slug,
    }
  } catch (error) {
    console.error(`Error reading author ${slug}:`, error)
    throw error
  }
}

/**
 * Reads author by reference path (e.g., "content/authors/amy.md")
 */
export async function readAuthorByPath(path: string): Promise<Author | null> {
  try {
    // Extract slug from path like "content/authors/amy.md"
    const match = path.match(/authors\/([^/]+)\.md$/)
    if (!match) return null
    const slug = match[1]
    return await readAuthor(slug)
  } catch (error) {
    console.error(`Error reading author by path ${path}:`, error)
    return null
  }
}

