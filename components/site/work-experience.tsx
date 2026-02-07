'use client'

import { motion } from 'motion/react'
import { WORK_EXPERIENCE } from '@/lib/data/work-experience'
import {
  SECTION_TRANSITION,
  SECTION_VARIANTS,
} from '@/components/site/section-motion'

function formatEndDate(end: string) {
  if (end.toLowerCase() === 'now') {
    return ''
  }

  return /^\d{4}$/.test(end) ? end.slice(-2) : end
}

export function WorkExperience() {
  return (
    <motion.section
      variants={SECTION_VARIANTS}
      transition={SECTION_TRANSITION}
      className="space-y-4"
    >
      <h3 className="text-[18px] font-medium text-zinc-100">
        Work Experiences
      </h3>

      <div className="border-t border-zinc-800">
        {WORK_EXPERIENCE.map((job) => (
          <article
            className="grid gap-2 border-b border-zinc-800 py-4 last:border-b-0 md:grid-cols-[160px_1fr_92px] md:items-start md:gap-4"
            key={job.id}
          >
            <p className="font-medium text-zinc-100">
              {job.company}
            </p>

            {job.roles?.length ? (
              <div className="space-y-2">
                {job.roles.map((role) => (
                  <div key={`${job.id}-${role.title}`} className="space-y-0.5">
                    <h4 className="font-medium text-zinc-100">{role.title}</h4>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {job.title ? (
                  <h4 className="font-medium text-zinc-100">{job.title}</h4>
                ) : null}
              </div>
            )}

            <p className="justify-self-start tabular-nums text-secondary text-[14px] md:text-left">
              <span>{job.start}</span>
              <span className="px-1 text-secondary">-</span>
              <span>{formatEndDate(job.end)}</span>
            </p>
          </article>
        ))}
      </div>
    </motion.section>
  )
}
