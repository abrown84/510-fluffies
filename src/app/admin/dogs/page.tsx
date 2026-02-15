import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Images } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { calculateAge } from '@/lib/utils'
import { DeleteDogButton } from './delete-button'
import type { Dog } from '@/types/database'

async function getDogs(): Promise<Dog[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dogs')
    .select('*')
    .order('name', { ascending: true })
  return (data as Dog[]) || []
}

export default async function AdminDogsPage() {
  const dogs = await getDogs()

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dogs</h1>
          <p className="mt-1 text-neutral-600">
            Manage your breeding dogs
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
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dogs.map((dog) => (
            <Card key={dog.id} className="overflow-hidden">
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
                    <Badge variant="default">{dog.status}</Badge>
                  </div>
                ) : null}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{dog.name}</h3>
                    <p className="text-sm text-neutral-600">
                      {dog.color} • {dog.gender}
                      {dog.date_of_birth && ` • ${calculateAge(dog.date_of_birth)}`}
                    </p>
                  </div>
                  <Badge variant={dog.gender === 'male' ? 'info' : 'primary'}>
                    {dog.status}
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
          ))}
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
