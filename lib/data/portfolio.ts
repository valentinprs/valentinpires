export type PortfolioSlide = {
  id: string
  title: string
  subtitle?: string
  description: string
  highlights?: string[]
  year?: string
  section?: string
}

export const HOME_SLIDE: PortfolioSlide = {
  id: 'home',
  title: 'Portfolio',
  subtitle: 'Interactive prototype',
  description:
    'A slide-like walkthrough of selected work and career milestones. Use the arrows or the buttons below to navigate.',
  highlights: ['Keyboard navigation', 'Expandable structure', 'WIP content'],
}

export const PORTFOLIO_SECTIONS = [
  {
    id: 'product-design',
    title: 'Product Design',
    slides: [
      {
        title: 'Discovery sprints',
        subtitle: 'From ambiguity to aligned teams',
        description:
          'Led rapid discovery cycles to align stakeholders on the right problem and opportunities.',
        highlights: ['Facilitated 12+ workshops', 'Defined 3 new product bets'],
        year: '2022',
      },
      {
        title: 'Design systems',
        subtitle: 'Scaling quality across teams',
        description:
          'Established a modular design system to speed up delivery and keep UI consistent.',
        highlights: ['60+ reusable components', 'Reduced UI debt'],
        year: '2023',
      },
      {
        title: 'Launch strategy',
        subtitle: 'From prototype to market',
        description:
          'Crafted launch narratives, onboarding, and growth experiments for new features.',
        highlights: ['Improved activation by 18%', 'Shipped in 6 weeks'],
        year: '2024',
      },
    ],
  },
  {
    id: 'creative-engineering',
    title: 'Creative Engineering',
    slides: [
      {
        title: 'Interactive storytelling',
        subtitle: 'Motion-led product tours',
        description:
          'Built immersive product tours with motion and micro-interactions.',
        highlights: ['3D interactions', 'Framer + React stack'],
        year: '2021',
      },
      {
        title: 'Performance narratives',
        subtitle: 'Speed with visual polish',
        description:
          'Optimized rendering pipelines for high-fidelity experiences.',
        highlights: ['40% faster loads', 'GPU-friendly animations'],
        year: '2022',
      },
      {
        title: 'AI-assisted workflows',
        subtitle: 'Design tooling experiments',
        description:
          'Prototyped AI tools to accelerate ideation and concept validation.',
        highlights: ['Prompt libraries', 'Rapid iteration loops'],
        year: '2024',
      },
    ],
  },
]
