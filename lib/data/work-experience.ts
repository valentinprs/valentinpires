export type WorkExperienceRole = {
  title: string
  location: string
  bullets: string[]
  years?: string
}

export type WorkExperiencePage = {
  description: string
  mediaPlaceholders: string[]
  productBullets?: string[]
}

export type WorkExperience = {
  company: string
  start: string
  end: string
  status: 'published' | 'draft'
  title?: string
  location?: string
  bullets?: string[]
  roles?: WorkExperienceRole[]
  link: string
  showArrow?: boolean
  id: string
  slug: string
  workPage?: WorkExperiencePage
}

export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    company: 'TotalEnergies',
    start: '2022',
    end: 'Now',
    status: 'draft',
    roles: [
      {
        title: 'Design Systems Lead',
        location: 'Paris, France',
        years: '2024 -',
        bullets: [
          'Rebuilt the Design System with Angular components to improve consistency, scalability, and delivery speed.',
          'Implemented design tokens to align design and code across teams and products.',
          'Partnered with design and engineering teams to define governance and drive adoption.',
          'Tracked adoption with Figma Library Analytics and a GitHub linting workflow.',
        ],
      },
      {
        title: 'Senior Product Designer',
        location: 'Paris, France',
        years: '2022 - 24',
        bullets: [
          'Developing accessible, responsive interfaces following WCAG standards',
          'Building and maintaining design systems',
          'Creating and documenting reusable UI components using TypeScript, React, Svelte, Figma, and Storybook',
          'Consulting on interface design for usability',
        ],
      },
    ],
    link: 'https://totalenergies.com/',
    showArrow: true,
    id: 'work1',
    slug: 'totalenergies',
    workPage: {
      description: 'Fictional case study page for TotalEnergies work experience.',
      mediaPlaceholders: [
        'Design system foundations and component architecture',
        'Cross-team adoption dashboard and governance workflow',
      ],
      productBullets: [
        'Work on products for different branches of TotalEnergies.',
        'Work on a mobile app for Be:Mo internal use.',
      ],
    },
  },
  {
    company: 'SeLoger',
    start: '2020',
    end: '2022',
    status: 'draft',
    roles: [
      {
        title: 'Product Designer',
        location: 'Paris, France',
        years: '2020 - 22',
        bullets: [
          'Partnered with both B2B and B2C teams across SeLoger.',
          'Guided the SeLoger Group migration from Sketch to Figma.',
        ],
      },
    ],
    link: 'https://www.seloger.com/',
    showArrow: true,
    id: 'work2',
    slug: 'seloger',
    workPage: {
      description: 'Fictional case study page for SeLoger work experience.',
      mediaPlaceholders: [
        'B2B and B2C product experience overview',
        'Design tooling migration and collaboration model',
      ],
    },
  },
  {
    company: 'Airbus',
    start: '2017',
    end: '2020',
    status: 'published',
    roles: [
      {
        title: 'UX Designer',
        location: 'Toulouse, France',
        bullets: [
          'Researched user needs and workflows for the cockpit of the future (DisCo project).',
          'Defined functional and UX specifications.',
          'Created wireframes and interactive prototypes.',
          'Ran user testing sessions with pilots and synthesized feedback.',
        ],
      },
    ],
    link: 'https://www.airbus.com/',
    showArrow: true,
    id: 'work3',
    slug: 'airbus',
  },
  {
    company: 'Dassault Systèmes',
    start: '2016',
    end: '2016',
    status: 'published',
    roles: [
      {
        title: 'UX Designer',
        location: 'Vélizy-Villacoublay, France',
        bullets: [
          'Product Designer for the 3DEXPERIENCE platform.',
          'Led user needs analysis and requirements discovery.',
          'Produced wireframes and high-fidelity UI designs across platform applications.',
          'Planned and ran user testing to validate workflows.',
        ],
      },
    ],
    link: 'https://www.3ds.com/',
    showArrow: true,
    id: 'work5',
    slug: 'dassault-systemes',
  },
]

export const WORK_EXPERIENCE_PUBLIC = WORK_EXPERIENCE.filter(
  (experience) => experience.status === 'published',
)

export const WORK_EXPERIENCE_WITH_WORK_PAGE = WORK_EXPERIENCE.filter(
  (experience) => experience.workPage,
)

export function getWorkExperienceBySlug(slug: string) {
  return WORK_EXPERIENCE.find((experience) => experience.slug === slug)
}

export function getWorkExperienceIntroBullets(experience: WorkExperience) {
  const roleBullets = experience.roles?.flatMap((role) => role.bullets ?? []) ?? []
  return Array.from(new Set(roleBullets))
}
