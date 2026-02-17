import type { Metadata } from 'next'
import { Cormorant_Garamond, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThreeBackground } from '@/components/layout/three-background'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'

// Luxury display font for headings
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

// Modern, refined sans-serif for body
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'C.D. Certified Frenchies | Premium Fluffy French Bulldogs',
    template: '%s | C.D. Certified Frenchies',
  },
  description:
    'Premium Fluffy French Bulldogs bred with love in the Bay Area. Quality bloodlines, health-tested parents, and exceptional temperaments.',
  keywords: [
    'Fluffy French Bulldog',
    'French Bulldog breeder',
    'Bay Area French Bulldog',
    'Fluffy Frenchie',
    'French Bulldog puppies',
    'California French Bulldog breeder',
    'C.D. Certified Frenchies',
  ],
  authors: [{ name: 'C.D. Certified Frenchies' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'C.D. Certified Frenchies',
    title: 'C.D. Certified Frenchies | Premium Fluffy French Bulldogs',
    description:
      'Premium Fluffy French Bulldogs bred with love in the Bay Area. Quality bloodlines, health-tested parents, and exceptional temperaments.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'C.D. Certified Frenchies - Premium Fluffy French Bulldogs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'C.D. Certified Frenchies | Premium Fluffy French Bulldogs',
    description:
      'Premium Fluffy French Bulldogs bred with love in the Bay Area.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${outfit.variable} font-body antialiased`}>
        <ThreeBackground />
        <div className="relative flex min-h-screen flex-col">
          <LayoutWrapper>{children}</LayoutWrapper>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
