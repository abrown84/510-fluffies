import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LitterForm } from '../litter-form'

interface DogOption {
  id: string
  name: string
  gender: 'male' | 'female'
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

export default async function NewLitterPage() {
  const dogs = await getDogs()
  const males = dogs.filter((d) => d.gender === 'male')
  const females = dogs.filter((d) => d.gender === 'female')

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Add New Litter</h1>
      <p className="mt-1 text-neutral-600">
        Create a new litter entry
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Litter Information</CardTitle>
        </CardHeader>
        <CardContent>
          <LitterForm males={males} females={females} />
        </CardContent>
      </Card>
    </div>
  )
}
