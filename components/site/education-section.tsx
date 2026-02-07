'use client'

import { motion } from 'motion/react'
import {
  SECTION_TRANSITION,
  SECTION_VARIANTS,
} from '@/components/site/section-motion'

const EDUCATION = [
  {
    degree: 'Master of science',
    school: 'Université de Limoges',
    years: '2014 - 16',
  },
]

export function EducationSection() {
  return (
    <motion.section
      variants={SECTION_VARIANTS}
      transition={SECTION_TRANSITION}
      className="space-y-4"
    >
      <h3 className="text-[18px] font-medium text-secondary">Education</h3>

      <div className="border-t border-zinc-800">
        {EDUCATION.map((entry) => (
          <article
            key={`${entry.degree}-${entry.school}`}
            className="grid gap-2 border-b border-zinc-800 py-4 last:border-b-0 md:grid-cols-[160px_1fr_92px_20px] md:items-start md:gap-4"
          >
            <p className="flex items-baseline gap-3 text-secondary md:col-span-2">
              <span className="font-medium text-zinc-100">{entry.degree}</span>
              <span>{entry.school}</span>
            </p>
            <p className="justify-self-start tabular-nums text-secondary text-[14px] md:col-start-3">
              {entry.years}
            </p>
          </article>
        ))}
      </div>
    </motion.section>
  )
}
