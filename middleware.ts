import { NextResponse, type NextRequest } from "next/server"

// Define your redirects here
const redirects = [
  {
    source: "/faq",
    destination: "/faqs",
    permanent: true,
  },
  {
    source: "/award-philosophy/apply",
    destination: "/award-philosophy",
    permanent: true,
  },
  {
    source: "/relief-organizations",
    destination: "/resources/relief-orgs",
    permanent: true,
  },
  {
    source: "/relief-organizations/:path",
    destination: "/resources/relief-orgs",
    permanent: true,
  },
  {
    source: "/applications",
    destination: "/start-applying",
    permanent: true,
  },
  // Add more redirects as needed
]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check for exact matches first
  for (const redirect of redirects) {
    // Simple exact match
    if (redirect.source === path) {
      const url = request.nextUrl.clone()
      url.pathname = redirect.destination
      return NextResponse.redirect(url, {
        status: redirect.permanent ? 308 : 307,
      })
    }

    // Handle parameterized redirects
    if (redirect.source.includes(":slug")) {
      const sourcePattern = redirect.source.replace(":slug", "([^/]+)")
      const regex = new RegExp(`^${sourcePattern}$`)
      const match = path.match(regex)

      if (match) {
        const slug = match[1]
        const destination = redirect.destination.replace(":slug", slug)
        const url = request.nextUrl.clone()
        url.pathname = destination
        return NextResponse.redirect(url, {
          status: redirect.permanent ? 308 : 307,
        })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip API routes, static files, and _next
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
