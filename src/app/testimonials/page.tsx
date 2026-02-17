import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { TestimonialCard } from '@/components/testimonials/testimonial-card'
import type { Testimonial } from '@/types/database'

export const metadata: Metadata = {
  title: 'Testimonials',
  description:
    'Read what our puppy families have to say about their 510 Fluffies experience. Real stories from real families.',
}

export const revalidate = 3600

async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .order('featured', { ascending: false })
    .order('display_order', { ascending: true })
  return (data as Testimonial[]) || []
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials()
  const featured = testimonials.filter(t => t.featured)
  const regular = testimonials.filter(t => !t.featured)

  return (
    <div className="min-h-screen bg-[#fffbf5]">
      {/* Hero with Bay Area Background */}
      <div className="relative pt-28 pb-16 sm:pt-32 sm:pb-20">
        {/* Background Image - Painted Ladies */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/photos/painted-ladies.jpg)' }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1612]/80 via-[#1a1612]/70 to-[#fffbf5]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]">
              Our Families
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Happy Families
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-200">
              Don&apos;t just take our word for it. Hear from families who have
              welcomed a 510 Fluffies puppy into their homes.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">

        {/* Featured Testimonials */}
        {featured.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-neutral-900 text-center mb-8">
              Featured Stories
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {featured.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  featured
                />
              ))}
            </div>
          </section>
        )}

        {/* All Testimonials */}
        {regular.length > 0 && (
          <section className="mt-16">
            {featured.length > 0 && (
              <h2 className="text-2xl font-semibold text-neutral-900 text-center mb-8">
                More Love Letters
              </h2>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regular.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {testimonials.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg text-neutral-500">
              No testimonials yet. Check back soon!
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-neutral-600 mb-4">
            Ready to start your own 510 Fluffies story?
          </p>
          <Link href="/apply">
            <Button variant="primary" size="lg">
              Apply for a Puppy
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
