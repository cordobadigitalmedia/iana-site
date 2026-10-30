import { revalidatePath, revalidateTag } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  const expected = process.env.SANITY_REVALIDATE_SECRET

  if (!expected) {
    return NextResponse.json(
      { message: "SANITY_REVALIDATE_SECRET is not configured" },
      { status: 500 }
    )
  }

  if (secret !== expected) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>))
  const type = typeof body._type === "string" ? body._type : undefined
  const slugValue = body.slug
  const slug =
    typeof slugValue === "string"
      ? slugValue
      : slugValue &&
          typeof slugValue === "object" &&
          "current" in slugValue &&
          typeof (slugValue as { current: unknown }).current === "string"
        ? (slugValue as { current: string }).current
        : undefined

  revalidateTag("sanity")
  revalidatePath("/")
  revalidatePath("/gallery")
  revalidatePath("/sitemap.xml")

  if (type === "page" && slug) {
    revalidatePath(`/${slug}`)
  }

  return NextResponse.json({ revalidated: true, type, slug })
}
