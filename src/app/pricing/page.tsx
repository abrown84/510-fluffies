import type { Metadata } from 'next'
import { Check, Crown, Handshake, Star, Heart, Shield, Certificate, ArrowRight } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { PricingOption } from '@/types/database'

export const metadata: Metadata = {
  title: 'Pricing & Ownership Options',
  description:
    'Explore our flexible ownership options for Fluffy French Bulldog puppies. Full ownership, co-ownership programs, and breeding rights available.',
}

export const revalidate = 3600 // Revalidate every hour

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, any> = {
  Heart,
  Crown,
  Handshake,
  Star,
  Shield,
  Certificate,
}

async function getPricingOptions(): Promise<PricingOption[]> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('pricing_options')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  return (data as PricingOption[]) || []
}

export default async function PricingPage() {
  const options = await getPricingOptions()
  const ownershipOptions = options.filter((o) => o.option_type === 'ownership')
  const serviceOptions = options.filter((o) => o.option_type === 'service')

  return (
    <div className="pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-none border border-[#c9a227]/30 bg-[#c9a227]/5 px-4 py-2 mb-6">
            <Crown weight="duotone" className="h-4 w-4 text-[#c9a227]" />
            <span className="font-body text-xs font-medium uppercase tracking-wider text-[#c9a227]">
              Investment Options
            </span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-[#1a1612] sm:text-5xl lg:text-6xl">
            Ownership <span className="text-gold-gradient">Options</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-neutral-600 leading-relaxed">
            We offer flexible ownership arrangements to match your lifestyle and goals.
            Each option includes our commitment to health, quality, and lifetime support.
          </p>
        </div>

        {/* Pricing Cards */}
        {ownershipOptions.length > 0 && (
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {ownershipOptions.map((option) => {
              const Icon = iconMap[option.icon] || Heart
              return (
                <div
                  key={option.id}
                  className={`relative rounded-sm overflow-hidden ${
                    option.featured
                      ? 'ring-2 ring-[#c9a227] shadow-xl shadow-[#c9a227]/10'
                      : 'border border-[#c9a227]/20'
                  }`}
                >
                  {/* Featured Badge */}
                  {option.featured && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#c9a227] to-[#e8d48a] py-2 text-center">
                      <span className="font-body text-xs font-semibold uppercase tracking-wider text-[#1a1612]">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className={`p-8 ${option.featured ? 'pt-14' : ''} bg-gradient-to-b from-white to-[#faf6f0]`}>
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-sm ${
                      option.featured
                        ? 'bg-[#c9a227] text-white'
                        : 'bg-[#c9a227]/10 text-[#c9a227]'
                    }`}>
                      <Icon weight="duotone" className="h-7 w-7" />
                    </div>

                    {/* Title */}
                    <h3 className="mt-6 font-display text-2xl font-semibold text-[#1a1612]">
                      {option.name}
                    </h3>
                    <p className="font-body text-sm font-medium text-[#c9a227] uppercase tracking-wider">
                      {option.subtitle}
                    </p>

                    {/* Price */}
                    <div className="mt-6">
                      <span className="font-display text-4xl font-bold text-[#1a1612]">
                        {option.price}
                      </span>
                      {option.price_note && (
                        <span className="ml-2 font-body text-sm text-neutral-500">
                          {option.price_note}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {option.description && (
                      <p className="mt-4 font-body text-sm text-neutral-600 leading-relaxed">
                        {option.description}
                      </p>
                    )}

                    {/* Features */}
                    {option.features.length > 0 && (
                      <ul className="mt-8 space-y-3">
                        {option.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <Check weight="bold" className="h-5 w-5 flex-shrink-0 text-[#c9a227]" />
                            <span className="font-body text-sm text-neutral-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* CTA */}
                    <Link href="/apply" className="block mt-8">
                      <button className={`w-full py-4 px-6 font-body text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${
                        option.featured
                          ? 'luxury-button'
                          : 'border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227] hover:text-white'
                      }`}>
                        <span className="flex items-center justify-center gap-2">
                          Apply Now
                          <ArrowRight weight="bold" className="h-4 w-4" />
                        </span>
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Additional Services */}
        {serviceOptions.length > 0 && (
          <div className="mt-24">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-semibold text-[#1a1612] sm:text-4xl">
                Additional Services
              </h2>
              <p className="mt-4 font-body text-neutral-600">
                Complementary services for breeders and puppy families
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {serviceOptions.map((service) => {
                const Icon = iconMap[service.icon] || Star
                return (
                  <div
                    key={service.id}
                    className="luxury-card group relative p-6 rounded-sm"
                  >
                    <div className="corner-ornament corner-ornament-tl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                    <div className="corner-ornament corner-ornament-br opacity-0 group-hover:opacity-40 transition-opacity duration-500" />

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#c9a227]/10 rounded-sm">
                        <Icon weight="duotone" className="h-6 w-6 text-[#c9a227]" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-[#1a1612]">
                          {service.name}
                        </h3>
                        <p className="mt-1 font-display text-xl font-bold text-[#c9a227]">
                          {service.price}
                        </p>
                        {service.description && (
                          <p className="mt-2 font-body text-sm text-neutral-600">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* FAQ/Notes Section */}
        <div className="mt-24 rounded-sm bg-gradient-to-br from-[#1a1612] to-[#2d2926] p-8 sm:p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#c9a227]/20" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#c9a227]/20" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <Crown weight="duotone" className="h-10 w-10 text-[#c9a227] mx-auto mb-6" />
            <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Important Information
            </h2>
            <div className="mt-6 space-y-4 font-body text-sm text-white/70 text-left">
              <p>
                <strong className="text-[#e8d48a]">Pricing Varies:</strong> Final pricing depends on
                color, gender, conformation, and pedigree. Rare colors and show-quality puppies
                may be priced higher.
              </p>
              <p>
                <strong className="text-[#e8d48a]">Deposits:</strong> A $1,000 non-refundable deposit
                is required to reserve a puppy. Deposits are applied to the final purchase price.
              </p>
              <p>
                <strong className="text-[#e8d48a]">Co-Ownership Terms:</strong> Co-ownership
                arrangements require a detailed contract and approval process. Terms typically
                include 1-2 litters for females or stud services for males.
              </p>
              <p>
                <strong className="text-[#e8d48a]">Health Guarantee:</strong> All puppies come with
                a comprehensive 2-year health guarantee covering genetic conditions.
              </p>
            </div>

            <Link href="/contact" className="inline-block mt-8">
              <button className="luxury-button px-8 py-4 text-sm">
                <span className="flex items-center gap-2">
                  Contact Us With Questions
                  <ArrowRight weight="bold" className="h-4 w-4" />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
