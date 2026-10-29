import type { Metadata } from 'next'
import Content from './content.mdx'

export const metadata: Metadata = {
  title: 'Exploring the Intersection of Design, AI, and Design Engineering',
  description:
    'Design and artificial intelligence (AI) are increasingly intertwined, driving innovation across industries. As technology evolves, the role of design engineering is more critical than ever, bridging creativity and functionality.',
  alternates: {
    canonical:
      '/blog/exploring-the-intersection-of-design-ai-and-design-engineering',
  },
}

export default function Page() {
  return <Content />
}
