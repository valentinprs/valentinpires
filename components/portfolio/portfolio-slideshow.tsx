'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  HOME_SLIDE,
  PORTFOLIO_SECTIONS,
  type PortfolioSlide,
} from '@/lib/data/portfolio'

function buildSlides(): PortfolioSlide[] {
  const slides: PortfolioSlide[] = [HOME_SLIDE]

  PORTFOLIO_SECTIONS.forEach((section) => {
    section.slides.forEach((slide, index) => {
      slides.push({
        id: `${section.id}-${index + 1}`,
        section: section.title,
        ...slide,
      })
    })
  })

  return slides
}

export function PortfolioSlideshow() {
  const slides = useMemo(() => buildSlides(), [])
  const [index, setIndex] = useState(0)
  const total = slides.length
  const current = slides[index]

  const handlePrev = useCallback(() => {
    setIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  const handleNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % total)
  }, [total])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handlePrev()
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev])

  return (
    <main className="relative py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-zinc-700/20 blur-3xl" />
        <div className="absolute -bottom-32 left-[-10%] h-80 w-80 rounded-full bg-zinc-500/10 blur-[120px]" />
      </div>

      <div className="relative space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
            Portfolio prototype
          </p>
          <h1 className="text-3xl font-semibold text-zinc-100">Portfolio</h1>
          <p className="text-secondary">
            A slide-like presentation you can expand as new achievements land.
          </p>
        </header>

        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden rounded-3xl bg-zinc-900/60 p-6 shadow-[0_0_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-zinc-500">
            <span>{current.section ? current.section : 'Overview'}</span>
            <span>
              {index + 1} / {total}
            </span>
          </div>

          <div className="min-h-[260px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="mt-8 space-y-4"
              >
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">{current.title}</h2>
                  {current.subtitle ? (
                    <p className="text-secondary">{current.subtitle}</p>
                  ) : null}
                </div>
                <p className="text-secondary">{current.description}</p>
                {current.highlights ? (
                  <div className="flex flex-wrap gap-2">
                    {current.highlights.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-zinc-950/60 px-3 py-1 text-xs text-zinc-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
                {current.year ? (
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                    {current.year}
                  </p>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-xs uppercase tracking-[0.25em] text-zinc-200 transition-colors hover:bg-zinc-900"
            >
              <span className="text-sm">&larr;</span>
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-xs uppercase tracking-[0.25em] text-zinc-200 transition-colors hover:bg-zinc-900"
            >
              Next
              <span className="text-sm">&rarr;</span>
            </button>
            <p className="text-xs text-secondary">
              Tip: Use the left and right arrow keys.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-secondary">
          {PORTFOLIO_SECTIONS.map((section) => (
            <span
              key={section.id}
              className="rounded-full bg-zinc-950/40 px-3 py-1"
            >
              {section.title} • {section.slides.length} slides
            </span>
          ))}
        </div>
      </div>
    </main>
  )
}
