import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { PuppyForm } from '../puppy-form'
import type { Puppy, Litter } from '@/types/database'

interface EditPuppyPageProps {
  params: Promise<{ id: string; puppyId: string }>
}

async function getPuppy(puppyId: string): Promise<Puppy | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('puppies')
    .select('*')
    .eq('id', puppyId)
    .single()
  return data as Puppy | null
}

async function getLitter(litterId: string): Promise<Litter | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('litters')
    .select('*')
    .eq('id', litterId)
    .single()
  return data as Litter | null
}

export default async function EditPuppyPage({ params }: EditPuppyPageProps) {
  const { id, puppyId } = await params
  const [puppy, litter] = await Promise.all([
    getPuppy(puppyId),
    getLitter(id),
  ])

  if (!puppy || !litter) {
    notFound()
  }

  return (
    <div>
      <Link
        href={`/admin/litters/${id}/puppies`}
        className="mb-4 inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to {litter.name} Puppies
      </Link>

      <h1 className="text-2xl font-bold text-neutral-900">
        Edit Puppy: {puppy.name || `${puppy.collar_color || 'No'} Collar`}
      </h1>
      <p className="mt-1 text-neutral-600">
        Update puppy information
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Puppy Information</CardTitle>
        </CardHeader>
        <CardContent>
          <PuppyForm litterId={id} puppy={puppy} />
        </CardContent>
      </Card>
    </div>
  )
}
