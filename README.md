# IANA Financial - Static Site

A static website built with Next.js 15, serving content directly from markdown files.

## Technologies

- [Next.js 15](https://nextjs.org/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [react-markdown](https://github.com/remarkjs/react-markdown) for markdown rendering
- [gray-matter](https://github.com/jonschlinkert/gray-matter) for frontmatter parsing

## Structure

- **Pages**: Static routes in `app/` directory, content in `content/pages/*.md`
- **Posts**: Blog posts in `content/posts/*.md` with author references
- **Resources**: Resource pages in `content/resources/*.md` and `*.json`
- **Sitewide content**: 
  - Header configuration: `content/header/header.json`
  - Footer configuration: `content/footer/footer.json`
  - Navigation: `content/nav/nav.md`

## Content Format

Pages use markdown with support for custom component tags:
- `<Button title="..." link="..." />` - Renders a button component
- `<Alert title="..." description="..." type="info" />` - Renders an alert component
- `<Youtube id="..." />` - Embeds a YouTube video
- `<Googlemap src="..." />` - Embeds a Google Map

## Develop locally

```bash
pnpm install
pnpm run dev
```

## Build for production

```bash
pnpm run build
pnpm start
```

## Deploy

The site can be deployed to any static hosting service:
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- Any static hosting provider

No CMS or database required - all content is in markdown files.
