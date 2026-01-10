'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { BLOG_POSTS } from '@/lib/data/blog-posts'
import {
  SECTION_TRANSITION,
  SECTION_VARIANTS,
} from '@/components/site/section-motion'

export function BlogSection() {
  return (
    <motion.section
      variants={SECTION_VARIANTS}
      transition={SECTION_TRANSITION}
    >
      <h3 className="mb-3 text-lg font-medium">Blog</h3>
      <div className="flex flex-col space-y-0">
        <AnimatedBackground
          enableHover
          className="h-full w-full rounded-lg bg-zinc-900/80"
          transition={{
            type: 'spring',
            bounce: 0,
            duration: 0.2,
          }}
        >
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.uid}
              className="-mx-3 rounded-xl px-3 py-3"
              href={post.link}
              data-id={post.uid}
            >
              <div className="flex flex-col space-y-1">
                <h4 className="font-normal text-zinc-100">
                  {post.title}
                </h4>
                <p className="text-secondary">
                  {post.description}
                </p>
              </div>
            </Link>
          ))}
        </AnimatedBackground>
      </div>
    </motion.section>
  )
}
