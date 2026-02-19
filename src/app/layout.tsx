import type { Metadata } from 'next'
import { Cormorant_Garamond, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThreeBackground } from '@/components/layout/three-background'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { createClient } from '@/lib/supabase/server'

// Site settings type
export interface SiteSettings {
  site_info: {
    name: string
    tagline: string
    description: string
    email: string
    phone: string
    location: string
  }
  social_links: {
    instagram: string
    facebook: string
    tiktok: string
    youtube: string
  }
}

const defaultSettings: SiteSettings = {
  site_info: {
    name: 'C.D. Certified Frenchies',
    tagline: 'Premium Fluffy French Bulldogs',
    description: "Bay Area's premier breeder of exceptional Fluffy French Bulldogs.",
    email: 'hello@cdcertifiedfrenchies.com',
    phone: '',
    location: 'Bay Area, California',
  },
  social_links: {
    instagram: '@cd.certifiedfrenchies',
    facebook: '',
    tiktok: '',
    youtube: '',
  },
}

async function getSettings(): Promise<SiteSettings> {
  const supabase = await createClient()
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('site_settings')
      .select('key, value')

    if (error || !data || data.length === 0) {
      return defaultSettings
    }

    const settings = { ...defaultSettings }
    for (const row of data) {
      if (row.key === 'site_info' || row.key === 'social_links') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (settings as any)[row.key] = row.value
      }
    }
    return settings
  } catch {
    return defaultSettings
  }
}

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()

  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${outfit.variable} font-body antialiased`}>
        <ThreeBackground />
        <div className="relative flex min-h-screen flex-col">
          <LayoutWrapper settings={settings}>{children}</LayoutWrapper>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
