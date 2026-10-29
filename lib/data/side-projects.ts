export type SideProject = {
  name: string
  description: string
  year: string
  link: string
  id: string
}

export const SIDE_PROJECTS: SideProject[] = [
  {
    name: 'Steam Achievements MCP',
    description:
      'MCP server that lets an AI assistant read your Steam achievements and guide you to 100%.',
    year: '2026',
    link: '/steam',
    id: 'steam-achievements-mcp',
  },
]
