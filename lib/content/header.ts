import { readFile } from "fs/promises"
import { join } from "path"

const contentDir = join(process.cwd(), "content", "header")

export async function readHeader() {
  try {
    const filePath = join(contentDir, "header.json")
    const content = await readFile(filePath, "utf-8")
    return JSON.parse(content)
  } catch (error) {
    console.error("Error reading header:", error)
    throw error
  }
}

