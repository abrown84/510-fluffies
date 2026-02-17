import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { LitterWithParents, Puppy, LitterImage } from '@/types/database'

export const revalidate = 3600

interface LitterPageProps {
  params: Promise<{ id: string }>
}

interface LitterWithDetails extends LitterWithParents {
  puppies: Puppy[]
  litter_images: LitterImage[]
}

const statusConfig = {
  expected: { label: 'Expecting', variant: 'info' as const },
  born: { label: 'Born', variant: 'warning' as const },
  available: { label: 'Available', variant: 'success' as const },
  sold: { label: 'All Placed', variant: 'default' as const },
}

async function getLitter(id: string): Promise<LitterWithDetails | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('litters')
    .select(`
      *,
      sire:dogs!litters_sire_id_fkey(*),
      dam:dogs!litters_dam_id_fkey(*),
      puppies(*),
      litter_images(*)
    `)
    .eq('id', id)
    .single()
  return data as LitterWithDetails | null
}

export async function generateMetadata({ params }: LitterPageProps): Promise<Metadata> {
  const { id } = await params
  const litter = await getLitter(id)

  if (!litter) {
    return { title: 'Litter Not Found' }
  }

  const parentNames = [litter.sire?.name, litter.dam?.name].filter(Boolean).join(' × ')

  return {
    title: litter.name,
    description: litter.description || `${litter.name} litter${parentNames ? ` from ${parentNames}` : ''}. Premium Fluffy French Bulldog puppies.`,
    openGraph: {
      title: `${litter.name} | C.D. Certified Frenchies`,
      description: litter.description || `View our ${litter.name} litter of Fluffy French Bulldogs.`,
      images: litter.image_url ? [litter.image_url] : [],
    },
  }
}

export default async function LitterPage({ params }: LitterPageProps) {
  const { id } = await params
  const litter = await getLitter(id)

  if (!litter) {
    notFound()
  }

  const status = statusConfig[litter.status as keyof typeof statusConfig] || statusConfig.expected
  const images = litter.litter_images?.sort((a, b) => a.display_order - b.display_order) || []
  const availablePuppies = litter.puppies?.filter(p => p.status === 'available') || []
  const totalPuppies = litter.puppies?.length || 0

  return (
    <div className="min-h-screen bg-[#fffbf5] pt-28 pb-12 sm:pt-32 sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/litters"
          className="inline-flex items-center text-sm font-medium text-neutral-600 hover:text-amber-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Litters
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-neutral-100">
              {litter.image_url ? (
                <Image
                  src={litter.image_url}
                  alt={litter.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-8xl">🐾</span>
                </div>
              )}
            </div>

            {/* Gallery */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100"
                  >
                    <Image
                      src={image.image_url}
                      alt={image.alt_text || litter.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
                  {litter.name}
                </h1>
                <div className="mt-2 flex items-center gap-3">
                  {litter.sire && (
                    <Link
                      href={`/dogs/${litter.sire.slug}`}
                      className="text-lg text-amber-600 hover:text-amber-700"
                    >
                      {litter.sire.name}
                    </Link>
                  )}
                  {litter.sire && litter.dam && (
                    <span className="text-neutral-400">×</span>
                  )}
                  {litter.dam && (
                    <Link
                      href={`/dogs/${litter.dam.slug}`}
                      className="text-lg text-amber-600 hover:text-amber-700"
                    >
                      {litter.dam.name}
                    </Link>
                  )}
                </div>
              </div>
              <Badge variant={status.variant} className="text-sm">
                {status.label}
              </Badge>
            </div>

            {/* Quick Info */}
            <div className="mt-6 flex flex-wrap gap-6">
              {litter.date_of_birth && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Calendar className="h-5 w-5" />
                  <span>Born {formatDate(litter.date_of_birth)}</span>
                </div>
              )}
              {litter.expected_date && !litter.date_of_birth && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Calendar className="h-5 w-5" />
                  <span>Expected {formatDate(litter.expected_date)}</span>
                </div>
              )}
              {totalPuppies > 0 && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Users className="h-5 w-5" />
                  <span>{totalPuppies} {totalPuppies === 1 ? 'puppy' : 'puppies'}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {litter.description && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-neutral-900">About This Litter</h2>
                <p className="mt-2 text-neutral-600 leading-relaxed">{litter.description}</p>
              </div>
            )}

            {/* Availability Summary */}
            {availablePuppies.length > 0 && (
              <div className="mt-8 rounded-lg bg-green-50 p-4">
                <p className="font-medium text-green-800">
                  {availablePuppies.length} {availablePuppies.length === 1 ? 'puppy' : 'puppies'} available!
                </p>
                <Link href={`/litters/${id}/puppies`}>
                  <Button variant="primary" size="sm" className="mt-3">
                    View Available Puppies
                  </Button>
                </Link>
              </div>
            )}

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-4">
              {totalPuppies > 0 && (
                <Link href={`/litters/${id}/puppies`}>
                  <Button variant="outline" size="lg">
                    Meet the Puppies
                  </Button>
                </Link>
              )}
              {litter.status !== 'sold' && (
                <Link href="/apply">
                  <Button variant="primary" size="lg">
                    Apply for a Puppy
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
