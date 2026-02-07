'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { AnimatedBackground } from '@/components/ui/animated-background'
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
      <h3 className="text-[18px] font-medium text-secondary">
        Work Experiences
      </h3>

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
          {WORK_EXPERIENCE.map((job) => {
            const isClickable = Boolean(job.workPage)
            const rowContent = (
              <div className="grid w-full gap-2 border-b border-zinc-800 py-4 md:grid-cols-[160px_1fr_92px_20px] md:items-start md:gap-4">
                <p className="font-medium text-zinc-100">{job.company}</p>

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

                {job.roles?.length ? (
                  <div className="justify-self-start space-y-2 tabular-nums text-secondary text-[14px] md:text-left">
                    {job.roles.map((role) => (
                      <p key={`${job.id}-${role.title}-years`}>
                        {role.years ?? `${job.start} - ${formatEndDate(job.end)}`}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="justify-self-start tabular-nums text-secondary text-[14px] md:text-left">
                    <span>{job.start}</span>
                    <span className="px-1 text-secondary">-</span>
                    <span>{formatEndDate(job.end)}</span>
                  </p>
                )}

                <div className="flex items-start justify-end pt-0.5">
                  {isClickable ? (
                    <ArrowRight className="h-4 w-4 text-secondary" aria-hidden="true" />
                  ) : null}
                </div>
              </div>
            )

            if (!isClickable) {
              return (
                <div key={job.id} className="w-full">
                  {rowContent}
                </div>
              )
            }

            return (
              <Link
                key={job.id}
                href={`/work/${job.slug}`}
                data-id={job.id}
                className="-mx-3 w-[calc(100%+1.5rem)] rounded-xl px-3"
              >
                {rowContent}
              </Link>
            )
          })}
        </AnimatedBackground>
      </div>
    </motion.section>
  )
}
