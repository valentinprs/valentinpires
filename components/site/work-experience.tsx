'use client'

import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { motion } from 'motion/react'
import { WORK_EXPERIENCE } from '@/lib/data/work-experience'
import {
  SECTION_TRANSITION,
  SECTION_VARIANTS,
} from '@/components/site/section-motion'

export function WorkExperience() {
  return (
    <motion.section
      variants={SECTION_VARIANTS}
      transition={SECTION_TRANSITION}
    >
      <h3 className="mb-8 font-medium text-zinc-100">
        Work Experience
      </h3>
      <div className="space-y-12">
        {WORK_EXPERIENCE.map((job) => (
          <div
            className="grid gap-4 md:grid-cols-[112px_1fr]"
            key={job.id}
          >
            {/* Job dates */}
            <p className="text-secondary">
              <span>{job.start}</span>
              <span className="px-2 text-secondary">&mdash;</span>
              <span>{job.end}</span>
            </p>
            {job.roles?.length ? (
              <div className="space-y-8">
                {job.roles.map((role) => (
                  <div
                    className="space-y-4"
                    key={`${job.id}-${role.title}`}
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium text-zinc-100">
                        {role.title}{' '}
                        <span className="text-secondary">at </span>
                        <a
                          className="inline-flex items-center gap-1 text-zinc-100 underline-offset-4 transition-colors hover:text-zinc-50 hover:underline"
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {job.company}
                          {job.showArrow ? (
                            <ArrowUpRight
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          ) : null}
                        </a>
                      </h4>

                      <p className="text-secondary">
                        {role.location}
                      </p>
                    </div>

                    <ul className="space-y-2 list-disc text-secondary">
                      {role.bullets.map((bullet) => (
                        <li key={bullet}>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-medium text-zinc-100">
                    {job.title}{' '}
                    <span className="text-secondary">at </span>
                    <a
                      className="inline-flex items-center gap-1 text-zinc-100 underline-offset-4 transition-colors hover:text-zinc-50 hover:underline"
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {job.company}
                      {job.showArrow ? (
                        <ExternalLink
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      ) : null}
                    </a>
                  </h4>

                  <p className="text-secondary">
                    {job.location}
                  </p>
                </div>

                <ul className="space-y-2 list-disc text-secondary">
                  {job.bullets?.map((bullet) => (
                    <li key={bullet}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.section>
  )
}
