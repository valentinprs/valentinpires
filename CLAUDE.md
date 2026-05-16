# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (Turbopack)
- `npm run build --webpack` — production build (uses webpack for MDX compatibility)
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type-check without emitting

## Architecture

Personal website for Valentin Pires built with Next.js App Router, React 19, TypeScript, Tailwind CSS v4, and Motion (framer-motion successor).

### Routing

- `/` — homepage (`components/site/personal-page.tsx`)
- `/blog` — MDX blog (posts listed in `lib/data/blog-posts.ts`, MDX layout in `app/blog/layout.tsx`)
- `/portfolio` — portfolio slideshow (`components/portfolio/portfolio-slideshow.tsx`)
- `/work/[slug]` — dynamic work detail pages (`components/site/work-detail-page.tsx`)

### Data layer

All content lives as typed TypeScript objects in `lib/data/`. Pages render these; no database.

- `work-experience.ts` — work entries with optional `slug`/`workPage` fields that make items routable to `/work/[slug]`
- `portfolio.ts`, `projects.ts` — portfolio items
- `blog-posts.ts`, `social-links.ts`, `email.ts`

### Component organization

- `components/ui/` — generic animated primitives (text-effect, morphing-dialog, magnetic, spotlight, etc.)
- `components/site/` — page-level composition components
- `hooks/` — custom hooks (e.g., `useClickOutside`)

## Conventions

- Server components by default; add `'use client'` only when hooks or browser APIs are needed.
- Styling via Tailwind utility classes only — no CSS modules or styled-components.
- Reuse existing UI primitives in `components/ui/` before creating new ones.
- Content changes go in `lib/data/`, not in page files.

## Git workflow

- Feature branches from `staging`; PRs target `staging`.
- `main` is the production branch.

## Adding a new work page

1. Add/update entry in `lib/data/work-experience.ts` with `slug` and `workPage` fields.
2. The dynamic route at `app/work/[slug]/page.tsx` picks it up automatically.
