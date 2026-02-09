import { NextResponse, type NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const redirects = [
  { source: '/faq', destination: '/faqs', permanent: true },
  { source: '/award-philosophy/apply', destination: '/award-philosophy', permanent: true },
  { source: '/relief-organizations', destination: '/resources/relief-orgs', permanent: true },
  { source: '/relief-organizations/:path', destination: '/resources/relief-orgs', permanent: true },
  { source: '/applications', destination: '/start-applying', permanent: true },
];

function applyRedirects(request: NextRequest): NextResponse | null {
  const path = request.nextUrl.pathname;
  for (const redirect of redirects) {
    if (redirect.source === path) {
      const url = request.nextUrl.clone();
      url.pathname = redirect.destination;
      return NextResponse.redirect(url, { status: redirect.permanent ? 308 : 307 });
    }
    if (redirect.source.includes(':path')) {
      const sourcePattern = redirect.source.replace(':path', '([^/]+)');
      const regex = new RegExp(`^${sourcePattern}$`);
      if (regex.test(path)) {
        const url = request.nextUrl.clone();
        url.pathname = redirect.destination;
        return NextResponse.redirect(url, { status: redirect.permanent ? 308 : 307 });
      }
    }
  }
  return null;
}

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const redirectResponse = applyRedirects(request);
  if (redirectResponse) return redirectResponse;

  if (isAdminRoute(request)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
