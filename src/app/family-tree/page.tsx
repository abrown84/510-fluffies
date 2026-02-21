import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { FamilyTreeView } from '@/components/pedigree'
import type { Dog, DogWithLineage, Litter, Puppy } from '@/types/database'

export const metadata: Metadata = {
  title: 'Family Tree',
  description:
    'Explore the lineage and family connections of our Fluffy French Bulldogs. See the bloodlines behind our puppies.',
}

export const revalidate = 3600

interface LitterWithRelations extends Litter {
  sire: Dog | null
  dam: Dog | null
  puppies: Puppy[]
}

async function getDogs(): Promise<Dog[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dogs')
    .select('*')
    .in('status', ['available', 'breeding', 'retired'])
    .order('name')
  return (data as Dog[]) || []
}

async function getDogsWithLineage(): Promise<DogWithLineage[]> {
  const supabase = await createClient()
  // Fetch all dogs for the pedigree view (including sold/retired as they may be parents)
  const { data, error } = await supabase
    .from('dogs')
    .select(`
      *,
      sire:sire_id(*),
      dam:dam_id(*)
    `)
    .order('name')

  if (error) {
    console.error('Error fetching dogs with lineage:', error)
    // Fallback: fetch dogs without lineage joins
    const { data: fallbackData } = await supabase
      .from('dogs')
      .select('*')
      .order('name')
    return (fallbackData as DogWithLineage[])?.map(d => ({ ...d, sire: null, dam: null })) || []
  }

  return (data as DogWithLineage[]) || []
}

async function getLittersWithPuppies(): Promise<LitterWithRelations[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('litters')
    .select(`
      *,
      sire:dogs!litters_sire_id_fkey(*),
      dam:dogs!litters_dam_id_fkey(*),
      puppies(*)
    `)
    .order('date_of_birth', { ascending: false })
  return (data as LitterWithRelations[]) || []
}

async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

export default async function FamilyTreePage() {
  const [dogs, dogsWithLineage, litters, isAdmin] = await Promise.all([
    getDogs(),
    getDogsWithLineage(),
    getLittersWithPuppies(),
    checkIsAdmin(),
  ])

  return (
    <div className="min-h-screen bg-[#fffbf5]">
      {/* Hero with Bay Area Background */}
      <div className="relative pt-28 pb-16 sm:pt-32 sm:pb-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/photos/yerba-buena-aerial.jpg)' }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1612]/80 via-[#1a1612]/70 to-[#fffbf5]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]">
              Our Lineage
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Family Tree
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-200">
              Explore the lineage and family connections of our Fluffy French Bulldogs.
              Every puppy comes from carefully selected, health-tested parents.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">

        {/* Family Tree with View Toggle */}
        <div className="mt-8">
          <FamilyTreeView
            dogs={dogs}
            litters={litters}
            dogsWithLineage={dogsWithLineage}
            viewId="default"
            isEditable={isAdmin}
          />
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-neutral-600 mb-4">
            Interested in joining our family?
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dogs">
              <Button variant="outline">
                Meet Our Dogs
              </Button>
            </Link>
            <Link href="/apply">
              <Button variant="primary">
                Apply for a Puppy
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
