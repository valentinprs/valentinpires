'use client'

import { motion } from 'motion/react'
import {
  SECTION_TRANSITION,
  SECTION_VARIANTS,
} from '@/components/site/section-motion'

const CERTIFICATIONS = [
  {
    name: 'UX-PM 2',
    id: 'UX-PM2-2978-FR22-1011',
    year: '2022',
  },
  {
    name: 'UX-PM 1',
    id: 'UX-PM1-4308-FR21-1445',
    year: '2021',
  },
]

export function CertificationsSection() {
  return (
    <motion.section
      variants={SECTION_VARIANTS}
      transition={SECTION_TRANSITION}
      className="space-y-4"
    >
      <h3 className="text-[18px] font-medium text-zinc-100">Certifications</h3>

      <div className="border-t border-zinc-800">
        {CERTIFICATIONS.map((certification) => (
          <article
            key={certification.id}
            className="grid gap-2 border-b border-zinc-800 py-4 last:border-b-0 md:grid-cols-[160px_1fr_92px_20px] md:items-start md:gap-4"
          >
            <p className="flex items-baseline gap-3 text-secondary md:col-span-2">
              <span className="font-medium text-zinc-100">{certification.name}</span>
              <span>{certification.id}</span>
            </p>
            <p className="justify-self-start tabular-nums text-secondary text-[14px] md:col-start-3">
              {certification.year}
            </p>
          </article>
        ))}
      </div>
    </motion.section>
  )
}
