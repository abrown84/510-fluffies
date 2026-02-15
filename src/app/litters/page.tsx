import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { LitterCard } from '@/components/litters/litter-card'
import type { LitterWithParents } from '@/types/database'

export const metadata: Metadata = {
  title: 'Litters',
  description:
    'View our current and upcoming Fluffy French Bulldog litters. Premium puppies from health-tested parents.',
}

export const revalidate = 3600

async function getLitters(): Promise<LitterWithParents[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('litters')
    .select(`
      *,
      sire:dogs!litters_sire_id_fkey(*),
      dam:dogs!litters_dam_id_fkey(*)
    `)
    .order('status', { ascending: true })
    .order('expected_date', { ascending: true })
  return (data as LitterWithParents[]) || []
}

export default async function LittersPage() {
  const litters = await getLitters()

  const available = litters.filter((l) => l.status === 'available')
  const born = litters.filter((l) => l.status === 'born')
  const expected = litters.filter((l) => l.status === 'expected')
  const sold = litters.filter((l) => l.status === 'sold')

  return (
    <div className="pt-28 pb-12 sm:pt-32 sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Our Litters
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
            Current, upcoming, and past litters from our breeding program.
            Each puppy comes with health guarantees and lifetime breeder support.
          </p>
        </div>

        {/* Available Section */}
        {available.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Available Now
            </h2>
            <p className="mt-2 text-neutral-600">
              Puppies ready for their forever homes
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {available.map((litter) => (
                <LitterCard key={litter.id} litter={litter} />
              ))}
            </div>
          </section>
        )}

        {/* Born Section */}
        {born.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Recently Born
            </h2>
            <p className="mt-2 text-neutral-600">
              New arrivals - puppies growing strong
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {born.map((litter) => (
                <LitterCard key={litter.id} litter={litter} />
              ))}
            </div>
          </section>
        )}

        {/* Expected Section */}
        {expected.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Expecting
            </h2>
            <p className="mt-2 text-neutral-600">
              Litters on the way - accepting applications
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {expected.map((litter) => (
                <LitterCard key={litter.id} litter={litter} />
              ))}
            </div>
          </section>
        )}

        {/* Past Litters */}
        {sold.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Past Litters
            </h2>
            <p className="mt-2 text-neutral-600">
              Our alumni - all placed in loving homes
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {sold.map((litter) => (
                <LitterCard key={litter.id} litter={litter} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {litters.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg text-neutral-500">
              No litters to display at this time. Check back soon or follow us on
              Instagram for updates!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
