import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { LitterForm } from '../../litter-form'
import type { Litter } from '@/types/database'

interface EditLitterPageProps {
  params: Promise<{ id: string }>
}

interface DogOption {
  id: string
  name: string
  gender: 'male' | 'female'
}

async function getLitter(id: string): Promise<Litter | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('litters').select('*').eq('id', id).single()
  return data as Litter | null
}

async function getDogs(): Promise<DogOption[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dogs')
    .select('id, name, gender')
    .in('status', ['available', 'breeding'])
    .order('name')
  return (data as DogOption[]) || []
}

export default async function EditLitterPage({ params }: EditLitterPageProps) {
  const { id } = await params
  const [litter, dogs] = await Promise.all([getLitter(id), getDogs()])

  if (!litter) {
    notFound()
  }

  const males = dogs.filter((d) => d.gender === 'male')
  const females = dogs.filter((d) => d.gender === 'female')

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Edit Litter</h1>
      <p className="mt-1 text-neutral-600">
        Update litter information
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Litter Information</CardTitle>
        </CardHeader>
        <CardContent>
          <LitterForm litter={litter} males={males} females={females} />
        </CardContent>
      </Card>
    </div>
  )
}
