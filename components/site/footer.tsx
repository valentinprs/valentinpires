'use client'
import { TextLoop } from '@/components/ui/text-loop'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-800 px-0 py-4">
      <div className="flex items-center justify-between">
        <TextLoop className="text-xs text-secondary">
          <span>© 2026 Valentin Pires.</span>
          <span>Built with Motion-Primitives.</span>
        </TextLoop>
      </div>
    </footer>
  )
}
