'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { List, X, InstagramLogo, ArrowRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dogs', label: 'Our Dogs' },
  { href: '/litters', label: 'Litters' },
  { href: '/family-tree', label: 'Family Tree' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check if we're on the homepage (dark hero)
  const isHomepage = pathname === '/'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-[#fffbf5]/95 backdrop-blur-md border-b border-[#c9a227]/10 shadow-sm'
          : isHomepage
            ? 'bg-transparent'
            : 'bg-[#fffbf5]/95 backdrop-blur-md'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className={cn(
            'font-display text-2xl font-medium tracking-tight transition-colors',
            scrolled || !isHomepage ? 'text-[#1a1612]' : 'text-white'
          )}>
            510
            <span className="text-[#c9a227]">.</span>
            Fluffies
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'elegant-link font-body text-sm font-medium uppercase tracking-wider transition-colors',
                pathname === link.href
                  ? 'text-[#c9a227]'
                  : scrolled || !isHomepage
                    ? 'text-[#1a1612]/70 hover:text-[#c9a227]'
                    : 'text-white/80 hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-6 lg:flex">
          <a
            href="https://www.instagram.com/510.fluffies/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'transition-colors',
              scrolled || !isHomepage
                ? 'text-[#1a1612]/60 hover:text-[#c9a227]'
                : 'text-white/70 hover:text-[#c9a227]'
            )}
          >
            <InstagramLogo weight="fill" className="h-5 w-5" />
          </a>
          <Link href="/apply">
            <button className="luxury-button group rounded-none px-6 py-3 text-xs">
              <span className="flex items-center gap-2">
                Apply Now
                <ArrowRight weight="bold" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={cn(
            'lg:hidden transition-colors',
            scrolled || !isHomepage ? 'text-[#1a1612]' : 'text-white'
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X weight="bold" className="h-6 w-6" />
          ) : (
            <List weight="bold" className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={cn(
        'lg:hidden overflow-hidden transition-all duration-300',
        mobileMenuOpen ? 'max-h-screen' : 'max-h-0'
      )}>
        <div className="border-t border-[#c9a227]/10 bg-[#fffbf5] px-6 py-6">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block py-3 font-body text-sm font-medium uppercase tracking-wider transition-colors',
                  pathname === link.href
                    ? 'text-[#c9a227]'
                    : 'text-[#1a1612]/70 hover:text-[#c9a227]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 border-t border-[#c9a227]/10 pt-6">
            <Link
              href="/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="block"
            >
              <button className="luxury-button w-full rounded-none px-6 py-4 text-xs">
                <span className="flex items-center justify-center gap-2">
                  Apply Now
                  <ArrowRight weight="bold" className="h-3.5 w-3.5" />
                </span>
              </button>
            </Link>

            <a
              href="https://www.instagram.com/510.fluffies/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 py-3 font-body text-sm text-[#1a1612]/60 hover:text-[#c9a227] transition-colors"
            >
              <InstagramLogo weight="fill" className="h-5 w-5" />
              @510.fluffies
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
