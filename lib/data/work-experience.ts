type WorkExperience = {
  company: string
  start: string
  end: string
  title?: string
  location?: string
  bullets?: string[]
  roles?: {
    title: string
    location: string
    bullets: string[]
  }[]
  link: string
  showArrow?: boolean
  id: string
}

export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    company: 'TotalEnergies',
    start: '2022',
    end: 'Now',
    roles: [
      {
        title: 'Design Systems Lead',
        location: 'Paris, France',
        bullets: [
          'Rebuilt the Design System with Angular components to improve consistency, scalability, and delivery speed.',
          'Implemented design tokens to align design and code across teams and products.',
          'Partnered with design and engineering teams to define governance and drive adoption.',
          'Tracked adoption with Figma Library Analytics and a GitHub linting workflow.',
        ],
      },
      {
        title: 'Product Designer',
        location: 'Paris, France',
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
  },
  {
    company: 'SeLoger',
    start: '2020',
    end: '2022',
    roles: [
      {
        title: 'Product Designer',
        location: 'Paris, France',
        bullets: [
          'Partnered with both B2B and B2C teams across SeLoger.',
          'Guided the SeLoger Group’s migration from Sketch to Figma.',
        ],
      },
    ],
    link: 'https://www.seloger.com/',
    showArrow: true,
    id: 'work2',
  },
  {
    company: 'Airbus',
    start: '2018',
    end: '2020',
    roles: [
      {
        title: 'Product Designer',
        location: 'Toulouse, France',
        bullets: [
          'Researched user needs and workflows for the “cockpit of the future” (DisCo project).',
          'Defined functional and UX specifications.',
          'Created wireframes and interactive prototypes.',
          'Ran user testing sessions with pilots and synthesized feedback.',
        ],
      },
    ],
    link: 'https://www.airbus.com/',
    showArrow: true,
    id: 'work3',
  },
  {
    company: 'Alten',
    start: '2018',
    end: '2023',
    roles: [
      {
        title: 'Product Designer',
        location: 'Toulouse, France',
        bullets: [
          'Designed VR and AR experiences to showcase Alten solutions to clients.',
          'Presented Alten offerings at the Paris Air Show (Le Bourget).',
        ],
      },
    ],
    link: 'https://www.alten.fr/',
    showArrow: true,
    id: 'work4',
  },
  {
    company: 'Dassault Systèmes',
    start: '2018',
    end: '2023',
    roles: [
      {
        title: 'Product Designer',
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
  },
]
