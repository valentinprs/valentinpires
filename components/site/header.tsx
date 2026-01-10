'use client'
import { motion } from 'motion/react'
import {
  SECTION_TRANSITION,
  SECTION_VARIANTS,
} from '@/components/site/section-motion'
import { TextEffect } from '@/components/ui/text-effect'
import Link from 'next/link'

export function Header() {
  return (
    <header className="mb-12 space-y-3 text-lg">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800" />
        <div>
          <Link href="/" className="font-medium text-zinc-100">
            Valentin Pires
          </Link>
          <TextEffect
            as="p"
            preset="fade"
            per="char"
            className="text-secondary"
            delay={0.1}
          >
            Design System Lead
          </TextEffect>
        </div>
      </div>
      <motion.section
        variants={SECTION_VARIANTS}
        transition={SECTION_TRANSITION}
        initial="hidden"
        animate="visible"
      >
        <p className="text-secondary text-sm ">
          Focused on creating intuitive and performant web experiences.
          Bridging the gap between design and development.
        </p>
      </motion.section>
    </header>
  )
}
