import createMDX from '@next/mdx'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const mdxLoaders = [
  {
    loader: require.resolve('@mdx-js/loader'),
    options: {
      providerImportSource: 'next-mdx-import-source-file',
    },
  },
]

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

  // Enable Turbopack explicitly even though MDX plugin injects webpack config
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': [
        'private-next-root-dir/src/mdx-components',
        'private-next-root-dir/mdx-components',
        '@mdx-js/react',
      ],
    },
    rules: {
      '*.md': [
        {
          loaders: mdxLoaders,
        },
      ],
      '*.mdx': [
        {
          loaders: mdxLoaders,
        },
      ],
    },
  },
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
})

export default withMDX(nextConfig)
