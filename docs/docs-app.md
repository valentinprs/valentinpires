# Main Page Structure (`app/page.tsx`)

The site's main page is structured in a modular way using Next.js and React components. Here is an overview of its organization.

## Global Layout (`app/layout.tsx`)

All pages, including the main page, are wrapped in the `RootLayout`. This defines the common framework:

- **Font:** Inter.
- **Theme:** Dark (`bg-zinc-950`).
- **Container:** Centered with a maximum width (`max-w-screen-sm`).
- **Persistent Components:**
    - `<Header />`: Navigation bar and identity at the top of the page.
    - `<Footer />`: Footer at the bottom.

## Page Content (`app/page.tsx`)

The home page entry point displays the `<PersonalPage />` component.

### `PersonalPage` Component (`components/site/personal-page.tsx`)

This component organizes the main content into several distinct sections, with smooth transition animations (via `motion/react`).

The displayed sections are:

1.  **WorkExperience** (`components/site/work-experience.tsx`): 
    - Displays the professional background.
    - Likely uses data from `lib/data/work-experience.ts`.

2.  **BlogSection** (`components/site/blog-section.tsx`):
    - Presents the latest blog posts.
    - Uses `lib/data/blog-posts.ts`.

3.  **ConnectSection** (`components/site/connect-section.tsx`):
    - Section for social links and contact.
    - Uses `lib/data/social-links.ts` and `lib/data/email.ts`.

## Data Architecture

Content is separated from presentation logic. Most of the information displayed on the main page is managed in the `lib/data/` folder.