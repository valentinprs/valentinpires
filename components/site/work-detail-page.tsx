'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import type { WorkExperience } from '@/lib/data/work-experience'
import {
  SECTION_TRANSITION,
} from '@/components/site/section-motion'

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const WORK_SECTION_VARIANTS = {
  hidden: { opacity: 0, filter: 'blur(8px)' },
  visible: { opacity: 1, filter: 'blur(0px)' },
}

type WorkDetailPageProps = {
  experience: WorkExperience
  introBullets: string[]
}

function formatRoleYears(years: string | undefined, fallback: string) {
  return years ?? fallback
}

export function WorkDetailPage({ experience, introBullets }: WorkDetailPageProps) {
  return (
    <>
      <Link
        href="/"
        className="fixed left-4 top-4 z-20 inline-flex items-center rounded-md border border-zinc-700 bg-zinc-950/80 px-3 py-1.5 text-[14px] text-zinc-200 transition-colors hover:bg-zinc-900 2xl:left-16 2xl:top-16"
      >
        Home
      </Link>

      <motion.main
        className="mx-auto w-full max-w-3xl space-y-14 pt-16 pb-8 text-[14px]"
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
      >

      <motion.header className="space-y-12" variants={WORK_SECTION_VARIANTS} transition={SECTION_TRANSITION}>
        <h1 className="text-center text-[32px] font-medium text-zinc-100">{experience.company}</h1>

        <section>
          {experience.roles?.map((role) => (
            <article
              key={`${experience.id}-${role.title}`}
              className="grid grid-cols-[1fr_92px] gap-4 border-b border-zinc-800 py-4 last:border-b-0"
            >
              <h2 className="text-[14px] font-medium text-zinc-100">{role.title}</h2>
              <p className="justify-self-start tabular-nums text-[14px] text-secondary">
                {formatRoleYears(role.years, `${experience.start} - ${experience.end}`)}
              </p>
            </article>
          ))}
        </section>
      </motion.header>

      <motion.section variants={WORK_SECTION_VARIANTS} transition={SECTION_TRANSITION}>
        <ul className="list-disc space-y-4 pl-6 text-[16px] font-medium text-zinc-100">
          {introBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </motion.section>

      {experience.workPage?.productBullets?.length ? (
        <motion.section className="space-y-6" variants={WORK_SECTION_VARIANTS} transition={SECTION_TRANSITION}>
          <h3 className="text-[20px] font-medium text-secondary">Product</h3>
          <ul className="list-disc space-y-4 pl-6 text-[16px] font-medium text-zinc-100">
            {experience.workPage.productBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </motion.section>
      ) : null}

      {experience.workPage?.mediaPlaceholders?.length ? (
        <motion.section className="space-y-8" variants={WORK_SECTION_VARIANTS} transition={SECTION_TRANSITION}>
          {experience.workPage.mediaPlaceholders.map((caption) => (
            <figure key={caption} className="space-y-3">
              <div className="aspect-video w-full rounded-xl border border-zinc-700 bg-zinc-800/80" />
              <figcaption className="text-center text-secondary">{caption}</figcaption>
            </figure>
          ))}
        </motion.section>
      ) : null}
      </motion.main>
    </>
  )
}
