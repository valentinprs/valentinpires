'use client'
import { motion } from 'motion/react'
import {
  SECTION_TRANSITION,
  SECTION_VARIANTS,
} from '@/components/site/section-motion'
import { TextEffect } from '@/components/ui/text-effect'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export function Header() {
  const pathname = usePathname()

  if (pathname.startsWith('/work')) {
    return null
  }

  return (
    <header className="mb-12 space-y-3 text-lg">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-12 w-12 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
          <Image
            src="/profile-picture.jpeg"
            alt="Valentin Pires"
            width={48}
            height={48}
            className="h-full w-full object-cover"
            priority
          />
        </div>
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
          Focused on creating intuitive and fluid web experiences.
          Bridging the gap between design and development.
        </p>
      </motion.section>
    </header>
  )
}
