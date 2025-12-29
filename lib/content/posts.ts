import { readFile, readdir } from "fs/promises"
import { join } from "path"
import matter from "gray-matter"
import { readAuthorByPath } from "./authors"

const contentDir = join(process.cwd(), "content", "posts")

export interface Post {
  title: string
  author?: {
    name?: string
    image?: string
  }
  image?: string
  description?: string
  body: string
  slug: string
}

/**
 * Reads and parses a post file
 * @param slug - The post slug (filename without extension)
 * @returns The parsed post data
 */
export async function readPost(slug: string): Promise<Post> {
  try {
    const filePath = join(contentDir, `${slug}.md`)
    const fileContent = await readFile(filePath, "utf-8")
    const { data, content } = matter(fileContent)
    
    // Handle author reference
    let author = undefined
    if (data.author && typeof data.author === "string") {
      const authorData = await readAuthorByPath(data.author)
      if (authorData) {
        author = {
          name: authorData.name,
          image: authorData.image,
        }
      }
    }
    
    return {
      title: data.title || "",
      author,
      image: data.image,
      description: data.description,
      body: content,
      slug,
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    throw error
  }
}

/**
 * Lists all available post slugs
 * @returns Array of post slugs
 */
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const files = await readdir(contentDir)
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ""))
  } catch (error) {
    console.error("Error reading posts directory:", error)
    return []
  }
}

/**
 * Reads all posts
 * @returns Array of all posts
 */
export async function getAllPosts(): Promise<Post[]> {
  try {
    const slugs = await getAllPostSlugs()
    const posts = await Promise.all(
      slugs.map((slug) => readPost(slug))
    )
    return posts
  } catch (error) {
    console.error("Error reading all posts:", error)
    return []
  }
}

