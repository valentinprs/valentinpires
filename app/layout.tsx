import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/site/header'
import { Footer } from '@/components/site/footer'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://your-domain.com/'),
  alternates: {
    canonical: '/'
  },
  title: {
    default: 'Valentin Pires - Personal website',
    template: '%s | Valentin Pires',
  },
  description:
    'Personal website built with Next.js 15, React 19 and Motion-Primitives.',
};

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${inter.variable} bg-zinc-950 text-sm text-zinc-100 tracking-tight antialiased`}
      >
        <div className="flex min-h-screen w-full flex-col">
          <div className="relative mx-auto w-full max-w-screen-sm flex-1 px-4 pt-20">
            <Header />
            {children}
            <Footer />
          </div>
        </div>
      </body>
    </html>
  )
}
