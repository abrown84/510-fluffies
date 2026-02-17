import Link from 'next/link'
import { ShieldCheck, Crown, Heart, InstagramLogo, ArrowRight, Sparkle, PawPrint, Certificate } from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui/button'
import { DogCard } from '@/components/dogs/dog-card'
import { LitterCard } from '@/components/litters/litter-card'
import { HeroPhotoGrid } from '@/components/home/hero-photo-grid'
import { createClient } from '@/lib/supabase/server'
import type { Dog, LitterWithParents } from '@/types/database'

export const revalidate = 3600

async function getFeaturedDogs(): Promise<Dog[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dogs')
    .select('*')
    .in('status', ['available', 'breeding'])
    .order('created_at', { ascending: false })
    .limit(3)
  return (data as Dog[]) || []
}

async function getAvailableLitters(): Promise<LitterWithParents[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('litters')
    .select(`
      *,
      sire:dogs!litters_sire_id_fkey(*),
      dam:dogs!litters_dam_id_fkey(*)
    `)
    .in('status', ['available', 'expected', 'born'])
    .order('expected_date', { ascending: true })
    .limit(2)
  return (data as LitterWithParents[]) || []
}

async function getHeroImages(): Promise<string[]> {
  const supabase = await createClient()

  type ImageRow = { image_url: string | null }

  // Get all dog images
  const { data: dogImages } = await supabase
    .from('dogs')
    .select('image_url')
    .not('image_url', 'is', null)

  // Get all images from dog_images gallery table
  const { data: galleryImages } = await supabase
    .from('dog_images')
    .select('image_url')
    .not('image_url', 'is', null)

  // Get all litter images
  const { data: litterImages } = await supabase
    .from('litter_images')
    .select('image_url')
    .not('image_url', 'is', null)

  // Combine all images
  const allImages: string[] = []

  if (dogImages) {
    allImages.push(...(dogImages as ImageRow[]).map(d => d.image_url).filter((url): url is string => !!url))
  }
  if (galleryImages) {
    allImages.push(...(galleryImages as ImageRow[]).map(d => d.image_url).filter((url): url is string => !!url))
  }
  if (litterImages) {
    allImages.push(...(litterImages as ImageRow[]).map(d => d.image_url).filter((url): url is string => !!url))
  }

  // Remove duplicates
  return [...new Set(allImages)]
}

export default async function HomePage() {
  const [dogs, litters, heroImages] = await Promise.all([
    getFeaturedDogs(),
    getAvailableLitters(),
    getHeroImages(),
  ])

  return (
    <>
      {/* Hero Section - Bay Area */}
      <section className="relative min-h-[90vh] overflow-hidden">
        {/* Bay Area Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/photos/bay-bridge-skyline.jpg)' }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1612]/70 via-[#1a1612]/60 to-[#1a1612]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,162,39,0.1)_0%,_transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:grid lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-36">
          {/* Text Content */}
          <div className="flex flex-col justify-center">
            {/* Luxury badge */}
            <div className="mb-8 inline-flex">
              <span className="luxury-badge inline-flex items-center gap-2 rounded-full">
                <Sparkle weight="fill" className="h-3 w-3" />
                Bay Area Premium Breeder
              </span>
            </div>

            <h1 className="font-display text-5xl font-medium tracking-tight text-white sm:text-6xl lg:text-7xl hero-text-shadow">
              <span className="block">Exquisite</span>
              <span className="block text-gold-gradient">Fluffy Frenchies</span>
            </h1>

            {/* Elegant divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent" />
              <PawPrint weight="fill" className="h-5 w-5 text-[#c9a227]/60" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent" />
            </div>

            <p className="font-body text-lg font-light leading-relaxed text-neutral-300/90 sm:text-xl">
              An intimate breeding program dedicated to producing
              <span className="text-[#e8d48a]"> extraordinary companions</span> with
              impeccable health, refined temperament, and breathtaking beauty.
            </p>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-6">
              <Link href="/apply">
                <button className="luxury-button group relative rounded-none px-8 py-4">
                  <span className="flex items-center gap-3">
                    Begin Your Journey
                    <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </Link>
              <Link href="/dogs">
                <button className="group relative border border-[#c9a227]/30 bg-transparent px-8 py-4 font-body text-sm font-medium uppercase tracking-widest text-[#e8d48a] transition-all hover:border-[#c9a227]/60 hover:bg-[#c9a227]/5">
                  <span className="flex items-center gap-3">
                    View Our Dogs
                    <ArrowRight weight="bold" className="h-4 w-4 opacity-50 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                  </span>
                </button>
              </Link>
            </div>
          </div>

          {/* Photo Grid */}
          {heroImages.length > 0 && (
            <HeroPhotoGrid images={heroImages} />
          )}
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fffbf5] to-transparent" />
      </section>

      {/* Features Section - Refined */}
      <section className="premium-section relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]">
              Our Promise
            </span>
            <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-[#1a1612] sm:text-5xl">
              The 510 Fluffies Difference
            </h2>
            <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-[#c9a227] to-transparent" />
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3 stagger-children">
            {/* Health Card */}
            <div className="luxury-card group relative rounded-sm p-8 text-center">
              <div className="corner-ornament corner-ornament-tl" />
              <div className="corner-ornament corner-ornament-br" />

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#c9a227]/10 to-[#c9a227]/5 ring-1 ring-[#c9a227]/20">
                <ShieldCheck weight="duotone" className="h-8 w-8 text-[#8b6914]" />
              </div>

              <h3 className="mt-6 font-display text-xl font-medium text-[#1a1612]">
                Health Excellence
              </h3>

              <p className="mt-4 font-body text-sm leading-relaxed text-neutral-600">
                Comprehensive genetic testing, OFA certifications, and cardiac evaluations
                ensure every puppy inherits the foundation for a long, healthy life.
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-[#c9a227]">
                <Certificate weight="fill" className="h-4 w-4" />
                <span>Certified Health</span>
              </div>
            </div>

            {/* Bloodlines Card */}
            <div className="luxury-card group relative rounded-sm p-8 text-center">
              <div className="corner-ornament corner-ornament-tl" />
              <div className="corner-ornament corner-ornament-br" />

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#2d2926]/10 to-[#2d2926]/5 ring-1 ring-[#2d2926]/20">
                <Crown weight="duotone" className="h-8 w-8 text-[#2d2926]" />
              </div>

              <h3 className="mt-6 font-display text-xl font-medium text-[#1a1612]">
                Distinguished Lineage
              </h3>

              <p className="mt-4 font-body text-sm leading-relaxed text-neutral-600">
                Champion bloodlines selected for exceptional structure,
                luxurious coat quality, and impeccable breed standard conformation.
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-[#2d2926]">
                <Sparkle weight="fill" className="h-4 w-4" />
                <span>Elite Heritage</span>
              </div>
            </div>

            {/* Care Card */}
            <div className="luxury-card group relative rounded-sm p-8 text-center">
              <div className="corner-ornament corner-ornament-tl" />
              <div className="corner-ornament corner-ornament-br" />

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#c9a227]/10 to-[#c9a227]/5 ring-1 ring-[#c9a227]/20">
                <Heart weight="duotone" className="h-8 w-8 text-[#8b6914]" />
              </div>

              <h3 className="mt-6 font-display text-xl font-medium text-[#1a1612]">
                Nurtured with Devotion
              </h3>

              <p className="mt-4 font-body text-sm leading-relaxed text-neutral-600">
                Each puppy is raised in our home with early neurological stimulation,
                thoughtful socialization, and an abundance of love and attention.
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-[#c9a227]">
                <Heart weight="fill" className="h-4 w-4" />
                <span>Home Raised</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dogs Section */}
      {dogs.length > 0 && (
        <section className="relative bg-[#faf6f0] py-24 sm:py-32">
          {/* Subtle top border */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/20 to-transparent" />

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]">
                  Our Family
                </span>
                <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-[#1a1612]">
                  Meet Our Dogs
                </h2>
                <p className="mt-3 font-body text-neutral-600">
                  The distinguished foundation of our breeding program
                </p>
              </div>
              <Link href="/dogs" className="hidden sm:block">
                <button className="group flex items-center gap-2 border-b border-[#c9a227]/40 pb-1 font-body text-sm font-medium uppercase tracking-wider text-[#8b6914] transition-colors hover:border-[#c9a227]">
                  View All
                  <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {dogs.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Litters Section */}
      {litters.length > 0 && (
        <section className="premium-section relative py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]">
                  New Arrivals
                </span>
                <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-[#1a1612]">
                  Available Litters
                </h2>
                <p className="mt-3 font-body text-neutral-600">
                  Current and upcoming litters from our finest pairings
                </p>
              </div>
              <Link href="/litters" className="hidden sm:block">
                <button className="group flex items-center gap-2 border-b border-[#c9a227]/40 pb-1 font-body text-sm font-medium uppercase tracking-wider text-[#8b6914] transition-colors hover:border-[#c9a227]">
                  View All
                  <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {litters.map((litter) => (
                <LitterCard key={litter.id} litter={litter} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instagram Section - Elegant Dark with Bay Area backdrop */}
      <section className="relative overflow-hidden bg-[#1a1612] py-24 sm:py-32">
        {/* Bay Area Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: 'url(/photos/bay-bridge-tower.jpg)' }}
        />
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,162,39,0.08)_0%,_transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 ring-1 ring-[#c9a227]/30">
              <InstagramLogo weight="fill" className="h-10 w-10 text-[#e8d48a]" />
            </div>

            <h2 className="font-display text-4xl font-medium tracking-tight text-white">
              Follow Our Journey
            </h2>

            <p className="mt-4 font-body text-lg text-neutral-400">
              Join our community for daily glimpses into life with our fluffy family
            </p>

            <div className="mt-10">
              <a
                href="https://www.instagram.com/510.fluffies/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="luxury-button group rounded-none px-10 py-4">
                  <span className="flex items-center gap-3">
                    <InstagramLogo weight="bold" className="h-5 w-5" />
                    @510.fluffies
                    <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Premium with Bay Area backdrop */}
      <section className="premium-section relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-sm bg-gradient-to-br from-[#2d2926] via-[#1a1612] to-[#2d2926] px-8 py-20 sm:px-16 sm:py-28">
            {/* Bay Area Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
              style={{ backgroundImage: 'url(/photos/yerba-buena-aerial.jpg)' }}
            />
            {/* Decorative corners */}
            <div className="absolute top-6 left-6 h-16 w-16 border-l-2 border-t-2 border-[#c9a227]/40" />
            <div className="absolute top-6 right-6 h-16 w-16 border-r-2 border-t-2 border-[#c9a227]/40" />
            <div className="absolute bottom-6 left-6 h-16 w-16 border-l-2 border-b-2 border-[#c9a227]/40" />
            <div className="absolute bottom-6 right-6 h-16 w-16 border-r-2 border-b-2 border-[#c9a227]/40" />

            {/* Gold accent glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,162,39,0.1)_0%,_transparent_60%)]" />

            <div className="relative mx-auto max-w-2xl text-center">
              <PawPrint weight="fill" className="mx-auto h-10 w-10 text-[#c9a227]/60" />

              <h2 className="mt-8 font-display text-4xl font-medium tracking-tight text-white sm:text-5xl">
                Begin Your Journey
              </h2>

              <p className="mt-6 font-body text-lg leading-relaxed text-neutral-300">
                We thoughtfully review each application to ensure our puppies
                find their perfect forever homes. Start your application today.
              </p>

              <div className="mt-10">
                <Link href="/apply">
                  <button className="luxury-button group rounded-none px-12 py-5">
                    <span className="flex items-center gap-3">
                      Apply Now
                      <ArrowRight weight="bold" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </button>
                </Link>
              </div>

              <p className="mt-8 font-body text-sm text-neutral-500">
                Limited availability &middot; Waitlist may apply
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
