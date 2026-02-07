'use client'
import { TextLoop } from '@/components/ui/text-loop'
import { SOCIAL_LINKS } from '@/lib/data/social-links'

export function Footer() {
  const linkedIn = SOCIAL_LINKS.find(
    (link) => link.label.toLowerCase() === 'linkedin'
  )?.link

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/75 py-4 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-screen-sm items-center gap-4 border-t border-zinc-800/60 px-4 pt-4">
        <TextLoop className="text-xs text-secondary">
          <span>© 2026 Valentin Pires.</span>
          <span>Built with Motion-Primitives.</span>
        </TextLoop>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={linkedIn ?? '#'}
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center rounded-full border border-zinc-700/70 bg-zinc-900/70 px-3 py-1 text-xs text-zinc-100 transition-colors duration-200 hover:bg-zinc-800/80"
          >
            <span className="pointer-events-none absolute -top-2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-100 shadow-sm group-hover:block">
              Open LinkedIn
            </span>
            LinkedIn
          </a>
          <a
            href="/resume-valentin-pires.pdf"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center rounded-full border border-zinc-700/70 bg-zinc-900/70 px-3 py-1 text-xs text-zinc-100 transition-colors duration-200 hover:bg-zinc-800/80"
          >
            <span className="pointer-events-none absolute -top-2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-100 shadow-sm group-hover:block">
              Open CV
            </span>
            CV
          </a>
        </div>
      </div>
    </footer>
  )
}
