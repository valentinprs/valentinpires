import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],

  // OAuth discovery for the Steam achievements MCP server (app/steam). MCP
  // clients look these up at the site root, so map them to app/steam.
  async rewrites() {
    return [
      {
        source: '/.well-known/oauth-protected-resource/:path*',
        destination: '/steam/well-known/oauth-protected-resource',
      },
      {
        source: '/.well-known/oauth-authorization-server/:path*',
        destination: '/steam/well-known/oauth-authorization-server',
      },
    ]
  },
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
})

export default withMDX(nextConfig)
