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
