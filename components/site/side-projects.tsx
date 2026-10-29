'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { SIDE_PROJECTS } from '@/lib/data/side-projects'
import {
  SECTION_TRANSITION,
  SECTION_VARIANTS,
} from '@/components/site/section-motion'

export function SideProjects() {
  return (
    <motion.section
      variants={SECTION_VARIANTS}
      transition={SECTION_TRANSITION}
      className="space-y-4"
    >
      <h3 className="text-[18px] font-medium text-secondary">Side Projects</h3>

      <div className="border-t border-zinc-800">
        <AnimatedBackground
          enableHover
          className="h-full w-full rounded-lg bg-zinc-900/80"
          transition={{
            type: 'spring',
            bounce: 0,
            duration: 0.2,
          }}
        >
          {SIDE_PROJECTS.map((project, index) => {
            const isLast = index === SIDE_PROJECTS.length - 1
            return (
              <Link
                key={project.id}
                href={project.link}
                data-id={project.id}
                className="-mx-3 w-[calc(100%+1.5rem)] rounded-xl px-3"
              >
                <div
                  className={`grid w-full gap-2 py-4 md:grid-cols-[160px_1fr_92px_20px] md:items-start md:gap-4 ${
                    isLast ? '' : 'border-b border-zinc-800'
                  }`}
                >
                  <p className="font-medium text-zinc-100">{project.name}</p>
                  <p className="text-secondary">{project.description}</p>
                  <p className="justify-self-start tabular-nums text-secondary text-[14px] md:text-left">
                    {project.year}
                  </p>
                  <div className="flex items-start justify-end pt-0.5">
                    <ArrowRight className="h-4 w-4 text-secondary" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            )
          })}
        </AnimatedBackground>
      </div>
    </motion.section>
  )
}
