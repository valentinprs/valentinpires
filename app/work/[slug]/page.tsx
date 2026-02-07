import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { WorkDetailPage } from '@/components/site/work-detail-page'
import {
  getWorkExperienceBySlug,
  getWorkExperienceIntroBullets,
  WORK_EXPERIENCE,
} from '@/lib/data/work-experience'

type WorkPageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return WORK_EXPERIENCE.map((experience) => ({
    slug: experience.slug,
  }))
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { slug } = await params
  const experience = getWorkExperienceBySlug(slug)

  if (!experience) {
    return {
      title: 'Work',
    }
  }

  const introBullets = getWorkExperienceIntroBullets(experience)

  return {
    title: experience.company,
    description: experience.workPage?.description ?? introBullets[0] ?? `${experience.company} work experience`,
  }
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params
  const experience = getWorkExperienceBySlug(slug)

  if (!experience) {
    notFound()
  }

  if (experience.status === 'draft') {
    redirect('/')
  }

  const introBullets = getWorkExperienceIntroBullets(experience)

  return <WorkDetailPage experience={experience} introBullets={introBullets} />
}
