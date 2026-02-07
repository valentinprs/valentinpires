# AGENTS.md

## Purpose
This repository contains the personal website of Valentin Pires built with Next.js App Router. It includes a homepage, a blog (MDX), portfolio pages, and work detail pages.

## Fast Start
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Start prod build: `npm run start`
- Lint: `npm run lint`
- Type check (recommended): `npx tsc --noEmit`

## Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS v4
- Animation: `motion`
- Icons: `lucide-react`
- Content: MDX + TypeScript data files in `lib/data`

## Source Of Truth
Keep content in `lib/data` and keep `app/**/page.tsx` focused on rendering.

- Work experience and work case-study content: `lib/data/work-experience.ts`
- Blog list: `lib/data/blog-posts.ts`
- Social links: `lib/data/social-links.ts`
- Email: `lib/data/email.ts`
- Portfolio/projects: `lib/data/portfolio.ts`, `lib/data/projects.ts`

## Key Paths
- App routes: `app/`
- Reusable site components: `components/site/`
- Generic UI components: `components/ui/`
- Utilities: `lib/utils.ts`

## Working Rules
- Prefer server components; use `'use client'` only for hooks/interaction.
- Reuse existing UI primitives (for consistency in motion and styling).
- Do not add a database layer unless explicitly requested.
- Keep styling in Tailwind utility classes.
- Keep data structures typed and exported from `lib/data`.

## Work Pages Pattern
For `/work/[slug]` pages:
1. Add or update an entry in `lib/data/work-experience.ts`.
2. Set `slug` and `workPage` to make an item routable.
3. Do not duplicate role or achievement content inside `page.tsx`.

## Quality Checklist
Before finalizing changes:
1. Run `npx tsc --noEmit`.
2. Run `npm run lint` when available in this environment.
3. Confirm no unrelated files were modified.

## Git Workflow
- Create feature branches from `staging`.
- Open PRs into `staging` unless instructed otherwise.
- After merge, sync local `staging` with `origin/staging` and remove merged local branch.
