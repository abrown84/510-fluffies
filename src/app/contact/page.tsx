import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MapPin, Instagram, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ContactForm } from './contact-form'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with C.D. Certified Frenchies. Questions about our Fluffy French Bulldogs or the application process? We would love to hear from you.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fffbf5]">
      {/* Hero with Bay Area Background */}
      <div className="relative pt-28 pb-16 sm:pt-32 sm:pb-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/photos/alcatraz-sf-skyline.jpg)' }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1612]/80 via-[#1a1612]/70 to-[#fffbf5]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]">
              Bay Area, California
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-200">
              Have questions about our program or puppies? We would love to hear from you.
              The best way to stay connected is through Instagram!
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
                    <Instagram className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">Instagram</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Best way to reach us and see daily updates
                    </p>
                    <a
                      href="https://www.instagram.com/cd.certifiedfrenchies/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-amber-600 hover:text-amber-700"
                    >
                      @cd.certifiedfrenchies
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
                    <Mail className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">Email</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      For detailed inquiries
                    </p>
                    <a
                      href="mailto:hello@cdcertifiedfrenchies.com"
                      className="mt-2 inline-flex items-center text-amber-600 hover:text-amber-700"
                    >
                      hello@cdcertifiedfrenchies.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
                    <MapPin className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">Location</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Bay Area, California
                    </p>
                    <p className="mt-2 text-sm text-neutral-500">
                      Visits by appointment only after application approval
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ready to Apply CTA */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-amber-600">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      Ready for a Puppy?
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Start your journey by submitting a puppy application
                    </p>
                    <Link href="/apply" className="mt-3 inline-block">
                      <Button variant="primary">Submit Application</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-neutral-900">
                  Send a Message
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Have a general question? Fill out the form below and we will get back
                  to you as soon as possible.
                </p>
                <div className="mt-6">
                  <ContactForm />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16 relative overflow-hidden rounded-2xl p-8 sm:p-12">
          {/* Bay Area Background */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/photos/golden-gate-fog.jpg)' }}
          />
          <div className="absolute inset-0 bg-[#fffbf5]/92" />
          <div className="relative">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Frequently Asked Questions
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold text-neutral-900">
                  How do I apply for a puppy?
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Visit our Apply page to submit a puppy application. We review all
                  applications carefully and will reach out to discuss next steps.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">
                  What are your prices?
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Our puppies range from $5,000 to $10,000+ depending on color,
                  structure, and pedigree. Current pricing is listed on each litter.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">
                  Do you ship puppies?
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  We prefer in-person pickup but can arrange flight nanny service
                  for approved families who cannot travel to California.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">
                  Can I visit before applying?
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  We schedule visits after your application has been reviewed and
                  approved. This helps us focus time on serious inquiries.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
