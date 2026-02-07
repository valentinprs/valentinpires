'use client'

import { motion } from 'motion/react'
import { WorkExperience } from '@/components/site/work-experience'
import { CertificationsSection } from '@/components/site/certifications-section'
import { ConnectSection } from '@/components/site/connect-section'

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

export function PersonalPage() {
  return (
    <motion.main
      className="space-y-24"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      <WorkExperience />
      <CertificationsSection />
      <ConnectSection />
    </motion.main>
  )
}
