import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getWorkExperienceBySlug,
  WORK_EXPERIENCE_WITH_WORK_PAGE,
} from '@/lib/data/work-experience'

type WorkPageProps = {
  params: Promise<{
    slug: string
  }>
}

function formatRoleYears(years: string | undefined, fallback: string) {
  return years ?? fallback
}

export function generateStaticParams() {
  return WORK_EXPERIENCE_WITH_WORK_PAGE.map((experience) => ({
    slug: experience.slug,
  }))
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { slug } = await params
  const experience = getWorkExperienceBySlug(slug)

  if (!experience || !experience.workPage) {
    return {
      title: 'Work',
    }
  }

  return {
    title: experience.company,
    description: experience.workPage.description,
  }
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params
  const experience = getWorkExperienceBySlug(slug)

  if (!experience || !experience.workPage) {
    notFound()
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-14 pt-16 pb-8 text-[14px]">
      <Link
        href="/"
        className="fixed left-4 top-4 z-20 inline-flex items-center rounded-md border border-zinc-700 bg-zinc-950/80 px-3 py-1.5 text-[14px] text-zinc-200 transition-colors hover:bg-zinc-900 2xl:left-16 2xl:top-16"
      >
        Home
      </Link>

      <header className="space-y-12">
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
      </header>

      <section className="space-y-6">
        <h3 className="text-[20px] font-medium text-zinc-100">Achievements</h3>
        <ul className="list-disc space-y-4 pl-6 text-[16px] font-medium text-zinc-100">
          {experience.workPage.achievements.map((achievement) => (
            <li key={achievement}>{achievement}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-8">
        {experience.workPage.mediaPlaceholders.map((caption) => (
          <figure key={caption} className="space-y-3">
            <div className="aspect-video w-full rounded-xl border border-zinc-700 bg-zinc-800/80" />
            <figcaption className="text-center text-secondary">{caption}</figcaption>
          </figure>
        ))}
      </section>
    </main>
  )
}
