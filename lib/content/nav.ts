import { readFile } from "fs/promises"
import { join } from "path"
import matter from "gray-matter"

const contentDir = join(process.cwd(), "content", "nav")

export async function readNav() {
  try {
    const filePath = join(contentDir, "nav.md")
    const fileContent = await readFile(filePath, "utf-8")
    const { data } = matter(fileContent)
    return data
  } catch (error) {
    console.error("Error reading nav:", error)
    throw error
  }
}

