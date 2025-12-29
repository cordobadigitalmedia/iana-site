import { readFile } from "fs/promises"
import { join } from "path"

const contentDir = join(process.cwd(), "content", "footer")

export async function readFooter() {
  try {
    const filePath = join(contentDir, "footer.json")
    const content = await readFile(filePath, "utf-8")
    return JSON.parse(content)
  } catch (error) {
    console.error("Error reading footer:", error)
    throw error
  }
}

