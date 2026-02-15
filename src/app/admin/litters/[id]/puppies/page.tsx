import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Plus, Edit, Trash2, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { PuppyForm } from './puppy-form'
import { DeletePuppyButton } from './delete-button'
import type { Litter, Puppy } from '@/types/database'

interface PuppiesPageProps {
  params: Promise<{ id: string }>
}

interface LitterWithParents extends Litter {
  sire: { name: string } | null
  dam: { name: string } | null
}

async function getLitter(id: string): Promise<LitterWithParents | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('litters')
    .select(`
      *,
      sire:dogs!litters_sire_id_fkey(name),
      dam:dogs!litters_dam_id_fkey(name)
    `)
    .eq('id', id)
    .single()
  return data as LitterWithParents | null
}

async function getPuppies(litterId: string): Promise<Puppy[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('puppies')
    .select('*')
    .eq('litter_id', litterId)
    .order('created_at', { ascending: true })
  return (data as Puppy[]) || []
}

const statusVariants = {
  available: 'success',
  reserved: 'warning',
  deposit: 'info',
  sold: 'default',
} as const

const statusLabels = {
  available: 'Available',
  reserved: 'Reserved',
  deposit: 'Deposit Paid',
  sold: 'Sold',
}

export default async function PuppiesPage({ params }: PuppiesPageProps) {
  const { id } = await params
  const [litter, puppies] = await Promise.all([
    getLitter(id),
    getPuppies(id),
  ])

  if (!litter) {
    notFound()
  }

  const availableCount = puppies.filter(p => p.status === 'available').length
  const reservedCount = puppies.filter(p => ['reserved', 'deposit'].includes(p.status)).length
  const soldCount = puppies.filter(p => p.status === 'sold').length

  return (
    <div>
      <Link
        href="/admin/litters"
        className="mb-4 inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Litters
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {litter.name} - Puppies
          </h1>
          <p className="mt-1 text-neutral-600">
            {litter.sire?.name || 'TBD'} × {litter.dam?.name || 'TBD'}
            {litter.date_of_birth && (
              <span className="ml-2">• Born {formatDate(litter.date_of_birth)}</span>
            )}
          </p>
        </div>
        <Link href={`/admin/litters/${id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Litter
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{availableCount}</p>
            <p className="text-sm text-neutral-600">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{reservedCount}</p>
            <p className="text-sm text-neutral-600">Reserved/Deposit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-neutral-600">{soldCount}</p>
            <p className="text-sm text-neutral-600">Sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Add New Puppy Form */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Add New Puppy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PuppyForm litterId={id} />
        </CardContent>
      </Card>

      {/* Puppies List */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          All Puppies ({puppies.length})
        </h2>

        {puppies.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {puppies.map((puppy) => (
              <Card key={puppy.id} className="overflow-hidden">
                <div className="relative aspect-square bg-neutral-100">
                  {puppy.image_url ? (
                    <Image
                      src={puppy.image_url}
                      alt={puppy.name || `${puppy.collar_color} collar puppy`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                      <span className="text-5xl">🐕</span>
                      {puppy.collar_color && (
                        <span
                          className="mt-2 inline-block h-3 w-12 rounded"
                          style={{ backgroundColor: puppy.collar_color.toLowerCase() }}
                        />
                      )}
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <Badge variant={statusVariants[puppy.status] || 'default'}>
                      {statusLabels[puppy.status]}
                    </Badge>
                  </div>
                  {puppy.gender && (
                    <div className="absolute left-2 top-2">
                      <Badge variant={puppy.gender === 'male' ? 'info' : 'default'}>
                        {puppy.gender === 'male' ? '♂ Male' : '♀ Female'}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {puppy.name || `${puppy.collar_color || 'No'} Collar`}
                      </h3>
                      {puppy.color && (
                        <p className="text-sm text-neutral-600">{puppy.color}</p>
                      )}
                    </div>
                    {puppy.price && (
                      <p className="font-semibold text-neutral-900">
                        ${puppy.price.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {puppy.current_weight_oz && (
                    <div className="mt-2 flex items-center text-sm text-neutral-600">
                      <Scale className="mr-1 h-4 w-4" />
                      {(puppy.current_weight_oz / 16).toFixed(1)} lbs
                      ({puppy.current_weight_oz} oz)
                    </div>
                  )}

                  {puppy.buyer_name && (
                    <div className="mt-2 rounded bg-neutral-50 p-2 text-sm">
                      <p className="font-medium text-neutral-900">
                        {puppy.buyer_name}
                      </p>
                      {puppy.buyer_email && (
                        <p className="text-neutral-600">{puppy.buyer_email}</p>
                      )}
                      {puppy.deposit_amount && puppy.deposit_paid_at && (
                        <p className="mt-1 text-green-600">
                          Deposit: ${puppy.deposit_amount} paid {formatDate(puppy.deposit_paid_at)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Link href={`/admin/litters/${id}/puppies/${puppy.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/admin/litters/${id}/puppies/${puppy.id}/weights`}>
                      <Button variant="outline" size="sm">
                        <Scale className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeletePuppyButton puppyId={puppy.id} litterId={id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-neutral-500">No puppies added yet</p>
              <p className="mt-1 text-sm text-neutral-400">
                Use the form above to add puppies to this litter
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
