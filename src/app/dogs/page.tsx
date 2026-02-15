import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { DogCard } from '@/components/dogs/dog-card'
import type { Dog } from '@/types/database'

export const metadata: Metadata = {
  title: 'Our Dogs',
  description:
    'Meet our beautiful Fluffy French Bulldogs. Health-tested, champion bloodlines, and exceptional temperaments.',
}

export const revalidate = 3600

async function getDogs(): Promise<Dog[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dogs')
    .select('*')
    .in('status', ['available', 'breeding'])
    .order('name', { ascending: true })
  return (data as Dog[]) || []
}

export default async function DogsPage() {
  const dogs = await getDogs()
  const males = dogs.filter((dog) => dog.gender === 'male')
  const females = dogs.filter((dog) => dog.gender === 'female')

  return (
    <div className="pt-28 pb-12 sm:pt-32 sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Our Dogs
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
            Meet the foundation of our breeding program. Each dog is carefully selected
            for health, temperament, and adherence to breed standards.
          </p>
        </div>

        {/* Males Section */}
        {males.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Our Studs
            </h2>
            <p className="mt-2 text-neutral-600">
              Champion bloodlines with exceptional structure
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {males.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          </section>
        )}

        {/* Females Section */}
        {females.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Our Dams
            </h2>
            <p className="mt-2 text-neutral-600">
              Beautiful mothers producing exceptional puppies
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {females.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {dogs.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg text-neutral-500">
              No dogs to display at this time. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
