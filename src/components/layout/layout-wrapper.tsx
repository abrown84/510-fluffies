'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from './navigation'
import { Footer } from './footer'

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

interface LayoutWrapperProps {
  children: React.ReactNode
  settings: SiteSettings
}

export function LayoutWrapper({ children, settings }: LayoutWrapperProps) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <>
      {!isAdmin && <Navigation settings={settings} />}
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer settings={settings} />}
    </>
  )
}
