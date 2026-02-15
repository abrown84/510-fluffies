import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { DogForm } from '../../dog-form'
import type { Dog } from '@/types/database'

interface EditDogPageProps {
  params: Promise<{ id: string }>
}

async function getDog(id: string): Promise<Dog | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('dogs').select('*').eq('id', id).single()
  return data as Dog | null
}

export default async function EditDogPage({ params }: EditDogPageProps) {
  const { id } = await params
  const dog = await getDog(id)

  if (!dog) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Edit {dog.name}</h1>
      <p className="mt-1 text-neutral-600">
        Update dog information
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Dog Information</CardTitle>
        </CardHeader>
        <CardContent>
          <DogForm dog={dog} />
        </CardContent>
      </Card>
    </div>
  )
}
