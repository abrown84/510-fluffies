'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from './navigation'
import { Footer } from './footer'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <>
      {!isAdmin && <Navigation />}
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer />}
    </>
  )
}
