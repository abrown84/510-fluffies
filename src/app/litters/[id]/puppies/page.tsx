import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { PuppyCard } from '@/components/puppies/puppy-card'
import { formatDate } from '@/lib/utils'
import type { Litter, Puppy, PuppyImage, Dog } from '@/types/database'

export const revalidate = 3600

interface PuppiesPageProps {
  params: Promise<{ id: string }>
}

interface LitterWithParents extends Litter {
  sire: Dog | null
  dam: Dog | null
}

interface PuppyWithImages extends Puppy {
  puppy_images: PuppyImage[]
}

async function getLitter(id: string): Promise<LitterWithParents | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('litters')
    .select(`
      *,
      sire:dogs!litters_sire_id_fkey(*),
      dam:dogs!litters_dam_id_fkey(*)
    `)
    .eq('id', id)
    .single()
  return data as LitterWithParents | null
}

async function getPuppies(litterId: string): Promise<PuppyWithImages[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('puppies')
    .select(`
      *,
      puppy_images(*)
    `)
    .eq('litter_id', litterId)
    .order('created_at', { ascending: true })
  return (data as PuppyWithImages[]) || []
}

export async function generateMetadata({ params }: PuppiesPageProps): Promise<Metadata> {
  const { id } = await params
  const litter = await getLitter(id)

  if (!litter) {
    return { title: 'Puppies Not Found' }
  }

  return {
    title: `${litter.name} Puppies`,
    description: `Meet the puppies from our ${litter.name} litter. Premium Fluffy French Bulldog puppies with health guarantees.`,
    openGraph: {
      title: `${litter.name} Puppies | 510 Fluffies`,
      description: `View available puppies from our ${litter.name} litter.`,
      images: litter.image_url ? [litter.image_url] : [],
    },
  }
}

export default async function PublicPuppiesPage({ params }: PuppiesPageProps) {
  const { id } = await params
  const [litter, puppies] = await Promise.all([
    getLitter(id),
    getPuppies(id),
  ])

  if (!litter) {
    notFound()
  }

  const available = puppies.filter(p => p.status === 'available')
  const reserved = puppies.filter(p => ['reserved', 'deposit'].includes(p.status))
  const sold = puppies.filter(p => p.status === 'sold')

  return (
    <div className="min-h-screen bg-[#fffbf5] pt-28 pb-12 sm:pt-32 sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href={`/litters/${id}`}
          className="inline-flex items-center text-sm font-medium text-neutral-600 hover:text-amber-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {litter.name}
        </Link>

        {/* Header */}
        <div className="mt-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            {litter.name} Puppies
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
            {litter.sire?.name && litter.dam?.name ? (
              <>
                From{' '}
                <Link href={`/dogs/${litter.sire.slug}`} className="text-amber-600 hover:text-amber-700">
                  {litter.sire.name}
                </Link>
                {' × '}
                <Link href={`/dogs/${litter.dam.slug}`} className="text-amber-600 hover:text-amber-700">
                  {litter.dam.name}
                </Link>
              </>
            ) : (
              'Premium Fluffy French Bulldog puppies'
            )}
            {litter.date_of_birth && (
              <span className="block mt-1 text-neutral-500">
                Born {formatDate(litter.date_of_birth)}
              </span>
            )}
          </p>
        </div>

        {/* Available Puppies */}
        {available.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Available Now
            </h2>
            <p className="mt-2 text-neutral-600">
              {available.length} {available.length === 1 ? 'puppy' : 'puppies'} looking for their forever home
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {available.map((puppy) => (
                <PuppyCard key={puppy.id} puppy={puppy} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/apply">
                <Button variant="primary" size="lg">
                  Apply for a Puppy
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Reserved Puppies */}
        {reserved.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Reserved
            </h2>
            <p className="mt-2 text-neutral-600">
              {reserved.length} {reserved.length === 1 ? 'puppy has' : 'puppies have'} been reserved
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reserved.map((puppy) => (
                <PuppyCard key={puppy.id} puppy={puppy} />
              ))}
            </div>
          </section>
        )}

        {/* Sold/Placed Puppies */}
        {sold.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Placed in Loving Homes
            </h2>
            <p className="mt-2 text-neutral-600">
              {sold.length} {sold.length === 1 ? 'puppy has' : 'puppies have'} found their forever family
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sold.map((puppy) => (
                <PuppyCard key={puppy.id} puppy={puppy} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {puppies.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg text-neutral-500">
              No puppies to display yet. Check back soon!
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-neutral-600 mb-4">
            Interested in this litter? Apply now to be considered for a puppy.
          </p>
          <Link href="/apply">
            <Button variant="primary" size="lg">
              Start Your Application
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
