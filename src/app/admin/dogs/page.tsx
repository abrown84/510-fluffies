import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Images, Baby } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { calculateAge } from '@/lib/utils'
import { DeleteDogButton } from './delete-button'
import type { Dog, Litter } from '@/types/database'

interface LitterWithParents extends Litter {
  sire: Dog | null
  dam: Dog | null
  _count?: { puppies: number }
}

async function getDogs(): Promise<Dog[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dogs')
    .select('*')
    .order('name', { ascending: true })
  return (data as Dog[]) || []
}

async function getLitters(): Promise<LitterWithParents[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('litters')
    .select(`
      *,
      sire:dogs!litters_sire_id_fkey(*),
      dam:dogs!litters_dam_id_fkey(*)
    `)
    .order('date_of_birth', { ascending: false })
  return (data as LitterWithParents[]) || []
}

function DogCard({ dog, litterCount }: { dog: Dog; litterCount?: number }) {
  const isExternal = dog.ownership_type && dog.ownership_type !== 'owned'

  return (
    <Card className={`overflow-hidden ${isExternal ? 'border-dashed border-neutral-400' : ''}`}>
      <div className="relative aspect-square bg-neutral-100">
        {dog.image_url ? (
          <Image
            src={dog.image_url}
            alt={dog.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl">🐕</span>
          </div>
        )}
        {dog.status === 'sold' || dog.status === 'retired' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="default" className="text-white">{dog.status}</Badge>
          </div>
        ) : null}
        {isExternal && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge variant="default" className="text-xs">
              {dog.ownership_type === 'stud_service' ? 'Stud Service' :
               dog.ownership_type === 'co_owned' ? 'Co-owned' : 'External'}
            </Badge>
            {dog.owner_name && (
              <Badge variant="purple" className="text-xs">
                {dog.owner_name}
              </Badge>
            )}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-neutral-900">{dog.name}</h3>
            <p className="text-sm text-neutral-600">
              {dog.color}
              {dog.date_of_birth && ` • ${calculateAge(dog.date_of_birth)}`}
            </p>
            {litterCount !== undefined && litterCount > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                {litterCount} litter{litterCount > 1 ? 's' : ''}
              </p>
            )}
            {dog.bio && (
              <p className="text-xs text-neutral-500 mt-2 line-clamp-2">
                {dog.bio}
              </p>
            )}
          </div>
          <Badge variant={dog.gender === 'male' ? 'info' : 'primary'}>
            {dog.gender === 'male' ? '♂' : '♀'}
          </Badge>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href={`/admin/dogs/${dog.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/admin/dogs/${dog.id}/gallery`}>
            <Button variant="outline" size="sm">
              <Images className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteDogButton dogId={dog.id} dogName={dog.name} />
        </div>
      </CardContent>
    </Card>
  )
}

export default async function AdminDogsPage() {
  const [dogs, litters] = await Promise.all([getDogs(), getLitters()])

  // Count litters per dog
  const litterCountByDog = new Map<string, number>()
  litters.forEach(litter => {
    if (litter.sire_id) {
      litterCountByDog.set(litter.sire_id, (litterCountByDog.get(litter.sire_id) || 0) + 1)
    }
    if (litter.dam_id) {
      litterCountByDog.set(litter.dam_id, (litterCountByDog.get(litter.dam_id) || 0) + 1)
    }
  })

  // Separate dogs by role and ownership
  const ownedDogs = dogs.filter(d => !d.ownership_type || d.ownership_type === 'owned' || d.ownership_type === 'co_owned')
  const externalDogs = dogs.filter(d => d.ownership_type === 'external' || d.ownership_type === 'stud_service')

  const activeDogs = ownedDogs.filter(d => d.status === 'available' || d.status === 'breeding')
  const studs = activeDogs.filter(d => d.gender === 'male')
  const dams = activeDogs.filter(d => d.gender === 'female')
  const otherDogs = ownedDogs.filter(d => d.status === 'retired' || d.status === 'sold')

  // Group litters by dam for the family view
  const littersByDam = new Map<string, LitterWithParents[]>()
  litters.forEach(litter => {
    if (litter.dam_id) {
      if (!littersByDam.has(litter.dam_id)) {
        littersByDam.set(litter.dam_id, [])
      }
      littersByDam.get(litter.dam_id)!.push(litter)
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dogs</h1>
          <p className="mt-1 text-neutral-600">
            Manage your breeding dogs • {dogs.length} total
          </p>
        </div>
        <Link href="/admin/dogs/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Dog
          </Button>
        </Link>
      </div>

      {dogs.length > 0 ? (
        <div className="mt-8 space-y-12">
          {/* Studs Section */}
          {studs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <h2 className="text-lg font-semibold text-neutral-800">
                  Studs ({studs.length})
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {studs.map((dog) => (
                  <DogCard
                    key={dog.id}
                    dog={dog}
                    litterCount={litterCountByDog.get(dog.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Dams Section with Family Tree */}
          {dams.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-pink-400" />
                <h2 className="text-lg font-semibold text-neutral-800">
                  Dams ({dams.length})
                </h2>
              </div>
              <div className="space-y-8">
                {dams.map((dam) => {
                  const damLitters = littersByDam.get(dam.id) || []
                  return (
                    <div key={dam.id} className="rounded-lg border border-neutral-200 bg-white p-4">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Dam Card */}
                        <div className="w-full lg:w-64 flex-shrink-0">
                          <DogCard
                            dog={dam}
                            litterCount={litterCountByDog.get(dam.id)}
                          />
                        </div>

                        {/* Litters */}
                        {damLitters.length > 0 && (
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Baby className="h-4 w-4 text-amber-500" />
                              <h3 className="text-sm font-semibold text-neutral-700">
                                Litters ({damLitters.length})
                              </h3>
                            </div>
                            <div className="space-y-3">
                              {damLitters.map((litter) => (
                                <Link
                                  key={litter.id}
                                  href={`/admin/litters/${litter.id}/puppies`}
                                  className="block"
                                >
                                  <div className="flex items-center gap-4 p-3 rounded-lg bg-neutral-50 hover:bg-amber-50 transition-colors">
                                    <div className="flex-1">
                                      <p className="font-medium text-neutral-900">{litter.name}</p>
                                      <p className="text-xs text-neutral-500">
                                        {litter.sire && (
                                          <span>Sire: <span className="text-blue-600">{litter.sire.name}</span></span>
                                        )}
                                        {litter.date_of_birth && (
                                          <span className="ml-2">
                                            • Born {new Date(litter.date_of_birth).toLocaleDateString()}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                    <Badge
                                      variant={
                                        litter.status === 'available' ? 'success' :
                                        litter.status === 'expected' ? 'warning' :
                                        litter.status === 'sold' ? 'default' : 'info'
                                      }
                                    >
                                      {litter.status}
                                    </Badge>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {damLitters.length === 0 && (
                          <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
                            No litters yet
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Retired/Sold Section */}
          {otherDogs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-neutral-400" />
                <h2 className="text-lg font-semibold text-neutral-800">
                  Retired & Sold ({otherDogs.length})
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {otherDogs.map((dog) => (
                  <DogCard
                    key={dog.id}
                    dog={dog}
                    litterCount={litterCountByDog.get(dog.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* External Dogs Section */}
          {externalDogs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full border-2 border-dashed border-neutral-400" />
                <h2 className="text-lg font-semibold text-neutral-800">
                  External Dogs ({externalDogs.length})
                </h2>
                <span className="text-sm text-neutral-500">— For lineage only, not owned</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {externalDogs.map((dog) => (
                  <DogCard
                    key={dog.id}
                    dog={dog}
                    litterCount={litterCountByDog.get(dog.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-neutral-500">No dogs added yet</p>
            <Link href="/admin/dogs/new" className="mt-4">
              <Button variant="primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Dog
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
