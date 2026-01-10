# AI Context & Documentation

This file acts as a guide for AI agents to understand the project structure, technology stack, coding conventions, and available commands.

## Project Overview
This is a personal portfolio and blog website for **Valentin Pires**. It is a single-page application for the portfolio section with a dedicated blog area using MDX.

## Tech Stack (Strict)
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (using CSS variables for themes)
- **Animation:** `motion` (formerly framer-motion) & custom hooks in `components/ui`
- **Icons:** `lucide-react`
- **Content:** MDX for blog posts, Static TypeScript objects for portfolio data.
- **Package Manager:** npm

## Available Commands
- `npm run dev`: Starts the development server with Hot Module Replacement.
- `npm run build`: Compiles the application for production. Note: it uses the `--webpack` flag as per `package.json`.
- `npm run start`: Starts the production server after a build.
- `npm run lint`: Runs ESLint to check for code quality and style issues.

## Project Structure & Architecture

### Key Directories
- `/app`: Contains the App Router pages.
  - `page.tsx`: The main landing page.
  - `/blog`: Blog listing and posts (MDX).
  - `/portfolio`: Portfolio specific routes.
- `/components`:
  - `/ui`: Reusable, generic UI components (often animated, e.g., `text-effect.tsx`, `spotlight.tsx`).
  - `/site`: Project-specific business logic components (e.g., `work-experience.tsx`, `header.tsx`, `footer.tsx`).
- `/lib`: Utilities and Data.
  - `/data`: **Source of Truth for Content.**
    - `projects.ts`, `work-experience.ts`, `blog-posts.ts`, `social-links.ts`.
  - `utils.ts`: Helper functions (clsx/tailwind-merge).

## Data Schemas

### Projects (`lib/data/projects.ts`)
```typescript
type Project = {
  name: string;
  description: string;
  link: string;
  video: string;
  id: string;
}
```

### Work Experience (`lib/data/work-experience.ts`)
```typescript
type WorkExperience = {
  company: string;
  start: string;
  end: string;
  title?: string;
  location?: string;
  bullets?: string[];
  roles?: {
    title: string;
    location: string;
    bullets: string[];
  }[];
  link: string;
  showArrow?: boolean;
  id: string;
}
```

### Blog Posts (`lib/data/blog-posts.ts`)
```typescript
type BlogPost = {
  title: string;
  description: string;
  link: string;
  uid: string;
}
```

## Coding Conventions

1.  **Styling:** Use Tailwind utility classes. Use `cn()` utility for conditional class merging.
2.  **Components:** React Server Components (RSC) by default. Use `'use client'` only when interaction or hooks are needed.
3.  **Data Management:**
    - **DO NOT** create a database connection unless explicitly requested.
    - To add a project or job experience, modify the files in `/lib/data/`.
4.  **Animations:** Use the existing components in `/components/ui` whenever possible to maintain design consistency.

## Common Tasks

### Adding a Portfolio Project
- Update `lib/data/projects.ts`.

### Adding a Blog Post
- Create a new directory in `app/blog/[slug]/` with a `page.mdx` file.
