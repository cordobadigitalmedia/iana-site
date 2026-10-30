# IANA Financial

A Next.js 15 site. **Pages, home, and gallery** are edited in Sanity Studio at `/studio`. Blog posts and resources still live in markdown.

## Technologies

- [Next.js 15](https://nextjs.org/docs)
- [Sanity](https://www.sanity.io/) for pages (Vercel Marketplace)
- [Shadcn UI](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)

## Structure

- **Pages**: Sanity `page` documents, rendered by `app/[slug]/page.tsx`
- **Home / Gallery**: Sanity singletons
- **Studio**: `/studio` (Sanity login — Google or GitHub, not the git repo)
- **Posts**: `content/posts/*.md`
- **Resources**: `content/resources/*.md` and `*.json`
- **Header / footer / nav**: `content/header`, `content/footer`, `content/nav`

Reserved slugs: `studio`, `api`, `blog`, `resources`, `gallery`, `admin`, `apply`, `contract`, `respond`.

## Editing content

1. Open `/studio` and sign in with a Sanity account (Google or GitHub).
2. Invite IANA staff in [sanity.io/manage](https://www.sanity.io/manage) as Editors.
3. Publish a page. The site revalidates about every 60 seconds, or immediately via the Sanity webhook to `/api/revalidate`.

## Develop locally

```bash
pnpm install
vercel env pull --yes
pnpm run dev
```

Open [http://localhost:3000/studio](http://localhost:3000/studio). If Studio cannot reach the dataset from localhost, add `http://localhost:3000` as a CORS origin in the Sanity project settings.

One-time content import (idempotent):

```bash
pnpm run import:sanity
```

## Build for production

```bash
pnpm run build
pnpm start
```
