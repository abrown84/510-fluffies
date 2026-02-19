import { createClient } from '@/lib/supabase/server'
import { PedigreeCanvas } from '@/components/pedigree'
import type { Dog, DogWithLineage, Litter, Puppy } from '@/types/database'

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

export default async function AdminFamilyTreePage() {
  const [dogs, dogsWithLineage, litters] = await Promise.all([
    getDogs(),
    getDogsWithLineage(),
    getLittersWithPuppies(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Family Tree</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage the visual layout of your dog family tree
        </p>
      </div>

      {/* Pedigree Canvas */}
      <div className="rounded-lg border border-neutral-200 bg-white">
        <PedigreeCanvas
          dogs={dogs}
          litters={litters}
          dogsWithLineage={dogsWithLineage}
          viewId="default"
          isEditable={true}
        />
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-neutral-500">
        <p>Drag nodes to rearrange • Positions are saved automatically • Use search to find specific dogs</p>
      </div>
    </div>
  )
}
