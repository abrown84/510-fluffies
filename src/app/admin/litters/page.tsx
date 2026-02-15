import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Dog, Images } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { DeleteLitterButton } from './delete-button'
import type { Litter } from '@/types/database'

interface LitterWithParents extends Litter {
  sire: { name: string; slug: string } | null
  dam: { name: string; slug: string } | null
}

async function getLitters(): Promise<LitterWithParents[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('litters')
    .select(`
      *,
      sire:dogs!litters_sire_id_fkey(name, slug),
      dam:dogs!litters_dam_id_fkey(name, slug)
    `)
    .order('created_at', { ascending: false })
  return (data as LitterWithParents[]) || []
}

const statusVariants = {
  expected: 'info',
  born: 'warning',
  available: 'success',
  sold: 'default',
} as const

export default async function AdminLittersPage() {
  const litters = await getLitters()

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Litters</h1>
          <p className="mt-1 text-neutral-600">
            Manage your litters and puppies
          </p>
        </div>
        <Link href="/admin/litters/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Litter
          </Button>
        </Link>
      </div>

      {litters.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {litters.map((litter) => (
            <Card key={litter.id} className="overflow-hidden">
              <div className="relative aspect-video bg-neutral-100">
                {litter.image_url ? (
                  <Image
                    src={litter.image_url}
                    alt={litter.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-4xl">🐾</span>
                  </div>
                )}
                <div className="absolute right-2 top-2">
                  <Badge variant={statusVariants[litter.status as keyof typeof statusVariants] || 'default'}>
                    {litter.status}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-neutral-900">{litter.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-neutral-600">
                  <span>
                    {litter.sire?.name || 'TBD'}
                  </span>
                  <span className="text-neutral-400">×</span>
                  <span>
                    {litter.dam?.name || 'TBD'}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-sm text-neutral-600">
                  {litter.expected_date && (
                    <p>Expected: {formatDate(litter.expected_date)}</p>
                  )}
                  {litter.date_of_birth && (
                    <p>Born: {formatDate(litter.date_of_birth)}</p>
                  )}
                  {litter.available_count !== null && litter.available_count > 0 && (
                    <p>{litter.available_count} available</p>
                  )}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <Link href={`/admin/litters/${litter.id}/puppies`}>
                    <Button variant="primary" size="sm" className="w-full">
                      <Dog className="mr-2 h-4 w-4" />
                      Manage Puppies
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Link href={`/admin/litters/${litter.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/admin/litters/${litter.id}/gallery`}>
                      <Button variant="outline" size="sm">
                        <Images className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteLitterButton litterId={litter.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-neutral-500">No litters added yet</p>
            <Link href="/admin/litters/new" className="mt-4">
              <Button variant="primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Litter
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
