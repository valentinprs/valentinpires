import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'TotalEnergies',
  description: 'Fictional case study page for TotalEnergies work experience.',
}

const ROLES = [
  {
    title: 'Design Systems Lead',
    years: '2022 -',
  },
  {
    title: 'Product Designer',
    years: '2022 - 24',
  },
]

const ACHIEVEMENTS = [
  'Built a scalable design system used across multiple internal products.',
  'Defined a token architecture that aligned design files and production UI.',
  'Reduced delivery time by standardizing core components and contribution guidelines.',
  'Set up adoption tracking with analytics and quality checks in the delivery workflow.',
]

const PLACEHOLDERS = [
  'Design system foundations and component architecture',
  'Cross-team adoption dashboard and governance workflow',
]

export default function TotalEnergiesWorkPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-14 pb-8 text-[14px]">
      <Link
        href="/"
        className="fixed left-4 top-4 z-20 inline-flex items-center rounded-md border border-zinc-700 bg-zinc-950/80 px-3 py-1.5 text-[14px] text-zinc-200 transition-colors hover:bg-zinc-900 2xl:left-16 2xl:top-16"
      >
        Home
      </Link>

      <header className="space-y-8">
        <h1 className="text-center text-[32px] font-medium text-zinc-100">TotalEnergies</h1>

        <section className="border-t border-zinc-800">
          {ROLES.map((role) => (
            <article
              key={role.title}
              className="grid grid-cols-[1fr_92px] gap-4 border-b border-zinc-800 py-4"
            >
              <h2 className="text-[14px] font-medium text-zinc-100">{role.title}</h2>
              <p className="justify-self-start tabular-nums text-[14px] text-secondary">
                {role.years}
              </p>
            </article>
          ))}
        </section>
      </header>

      <section className="space-y-6">
        <h3 className="text-[18px] font-medium text-zinc-100">Achievements</h3>
        <ul className="list-disc space-y-4 pl-6 text-[14px] text-zinc-100">
          {ACHIEVEMENTS.map((achievement) => (
            <li key={achievement}>{achievement}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-8">
        {PLACEHOLDERS.map((caption) => (
          <figure key={caption} className="space-y-3">
            <div className="aspect-video w-full rounded-xl border border-zinc-700 bg-zinc-800/80" />
            <figcaption className="text-center text-secondary">{caption}</figcaption>
          </figure>
        ))}
      </section>
    </main>
  )
}
