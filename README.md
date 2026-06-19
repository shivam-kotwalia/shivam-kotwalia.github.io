# Shivam Kotwalia — Personal Website

Personal website and blog for Shivam Kotwalia, built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com), deployed to GitHub Pages.

## Jobs this site does

1. **Source of truth** — central place for Shivam's profile, links, and skills.
2. **Career** — a professional experience timeline.
3. **Blog** — occasional writing on AI, data, and engineering.

## Tech stack

- **Astro 5** — content-first static site generator
- **Tailwind CSS 4** — styling (via `@tailwindcss/vite`)
- **Content Collections** — type-safe content (`src/content/`)
- **@astrojs/sitemap** + **@astrojs/rss** — SEO sitemap and RSS feed
- **GitHub Actions** — automatic deploy to GitHub Pages

## Project structure

```text
src/
  config.ts              # SINGLE SOURCE OF TRUTH: name, role, bio, socials, skills
  content.config.ts      # content collection schemas
  content/
    experience.json      # career timeline entries
    blog/*.md            # blog posts
  components/            # Header, Footer, Icon, ThemeToggle, etc.
  layouts/BaseLayout.astro
  pages/                # index, about, experience, blog, 404, rss.xml
  styles/global.css     # Tailwind + theme tokens
public/                 # favicon, avatar, og image, robots.txt
.github/workflows/      # deploy.yml (GitHub Pages)
```

## Editing content

Most content is data-driven — you rarely need to touch markup:

- **Profile, role, bio, socials, skills** → edit `src/config.ts`
- **Experience timeline** → edit `src/content/experience.json`
- **Blog posts** → add a Markdown file in `src/content/blog/`
- **Avatar photo** → replace `public/avatar.svg` (a square `avatar.jpg` works too; update the path in `src/config.ts`)

> Items marked `TODO:` in `src/config.ts` and `experience.json` are placeholders to replace with real details.

## Local development

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:4321
npm run build    # build to ./dist
npm run preview  # preview the production build
```

## Deployment

Pushing to the `master` branch triggers the GitHub Actions workflow
(`.github/workflows/deploy.yml`), which builds the site and deploys it to
GitHub Pages.

One-time setup in the GitHub repo: **Settings → Pages → Build and deployment →
Source = GitHub Actions**.

## License

[MIT](LICENSE)
