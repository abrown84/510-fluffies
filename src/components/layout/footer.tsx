import Link from 'next/link'
import { Instagram, Mail, MapPin } from 'lucide-react'
import type { SiteSettings } from './layout-wrapper'

interface FooterProps {
  settings: SiteSettings
}

export function Footer({ settings }: FooterProps) {
  const instagramHandle = settings.social_links.instagram?.replace('@', '') || 'cd.certifiedfrenchies'
  const instagramUrl = `https://www.instagram.com/${instagramHandle}/`
  const email = settings.site_info.email || 'hello@cdcertifiedfrenchies.com'
  const location = settings.site_info.location || 'Bay Area, California'
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold tracking-tight text-neutral-900">
                C.D.<span className="text-amber-600"> Certified</span> Frenchies
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-neutral-600">
              Premium Fluffy French Bulldogs bred with love in the Bay Area.
              We focus on health, temperament, and quality bloodlines to produce
              exceptional companions.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-amber-600"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/dogs"
                  className="text-sm text-neutral-600 hover:text-amber-600"
                >
                  Our Dogs
                </Link>
              </li>
              <li>
                <Link
                  href="/litters"
                  className="text-sm text-neutral-600 hover:text-amber-600"
                >
                  Available Litters
                </Link>
              </li>
              <li>
                <Link
                  href="/family-tree"
                  className="text-sm text-neutral-600 hover:text-amber-600"
                >
                  Family Tree
                </Link>
              </li>
              <li>
                <Link
                  href="/testimonials"
                  className="text-sm text-neutral-600 hover:text-amber-600"
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-neutral-600 hover:text-amber-600"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/apply"
                  className="text-sm text-neutral-600 hover:text-amber-600"
                >
                  Puppy Application
                </Link>
              </li>
              <li>
                <Link
                  href="/waitlist"
                  className="text-sm text-neutral-600 hover:text-amber-600"
                >
                  Join Waitlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm text-neutral-600">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{location}</span>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 text-sm text-neutral-600 hover:text-amber-600"
                >
                  <Mail className="h-4 w-4" />
                  <span>{email}</span>
                </a>
              </li>
              <li>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-neutral-600 hover:text-amber-600"
                >
                  <Instagram className="h-4 w-4" />
                  <span>@{instagramHandle}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} C.D. Certified Frenchies. All rights reserved.
            </p>
            <Link
              href="/login"
              className="text-sm text-neutral-400 hover:text-amber-600 transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
