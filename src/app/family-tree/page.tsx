import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { FamilyTree } from '@/components/family-tree/family-tree'
import type { Dog, Litter, Puppy } from '@/types/database'

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

export default async function FamilyTreePage() {
  const [dogs, litters] = await Promise.all([
    getDogs(),
    getLittersWithPuppies(),
  ])

  return (
    <div className="min-h-screen bg-[#fffbf5] pt-28 pb-12 sm:pt-32 sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Family Tree
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
            Explore the lineage and family connections of our Fluffy French Bulldogs.
            Every puppy comes from carefully selected, health-tested parents.
          </p>
        </div>

        {/* Legend */}
        <div className="mt-8 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full ring-2 ring-blue-400" />
            <span className="text-sm text-neutral-600">Male</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full ring-2 ring-pink-400" />
            <span className="text-sm text-neutral-600">Female</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-amber-300" />
            <span className="text-sm text-neutral-600">Parent Connection</span>
          </div>
        </div>

        {/* Family Tree */}
        <div className="mt-12 rounded-2xl bg-white p-8 shadow-sm">
          <FamilyTree dogs={dogs} litters={litters} />
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
