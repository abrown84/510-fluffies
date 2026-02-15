import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check, Calendar, Scale } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateAge, formatDate } from '@/lib/utils'
import type { Dog, DogImage, HealthTest } from '@/types/database'

export const revalidate = 3600

interface DogPageProps {
  params: Promise<{ slug: string }>
}

interface DogWithRelations extends Dog {
  dog_images: DogImage[]
  health_tests: HealthTest[]
}

async function getDog(slug: string): Promise<DogWithRelations | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dogs')
    .select(`
      *,
      dog_images(*),
      health_tests(*)
    `)
    .eq('slug', slug)
    .in('status', ['available', 'breeding'])
    .single()
  return data as DogWithRelations | null
}

export async function generateMetadata({ params }: DogPageProps): Promise<Metadata> {
  const { slug } = await params
  const dog = await getDog(slug)

  if (!dog) {
    return {
      title: 'Dog Not Found',
    }
  }

  return {
    title: dog.name,
    description: dog.bio || `Meet ${dog.name}, our ${dog.color} Fluffy French Bulldog.`,
    openGraph: {
      title: `${dog.name} | 510 Fluffies`,
      description: dog.bio || `Meet ${dog.name}, our ${dog.color} Fluffy French Bulldog.`,
      images: dog.image_url ? [dog.image_url] : [],
    },
  }
}

// generateStaticParams removed - page will be dynamically rendered
// This is required because Supabase SSR client uses cookies which aren't available during build

export default async function DogPage({ params }: DogPageProps) {
  const { slug } = await params
  const dog = await getDog(slug)

  if (!dog) {
    notFound()
  }

  const images = dog.dog_images?.sort((a, b) => a.display_order - b.display_order) || []
  const healthTests = dog.health_tests || []

  return (
    <div className="min-h-screen bg-[#fffbf5] pt-28 pb-12 sm:pt-32 sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/dogs"
          className="inline-flex items-center text-sm font-medium text-neutral-600 hover:text-amber-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Our Dogs
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
              {dog.image_url ? (
                <Image
                  src={dog.image_url}
                  alt={dog.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-8xl">🐕</span>
                </div>
              )}
            </div>

            {/* Gallery */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100"
                  >
                    <Image
                      src={image.image_url}
                      alt={image.alt_text || dog.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
                  {dog.name}
                </h1>
                <p className="mt-2 text-lg text-neutral-600">{dog.color}</p>
              </div>
              <Badge
                variant={dog.gender === 'male' ? 'info' : 'primary'}
                className="text-sm"
              >
                {dog.gender === 'male' ? '♂ Male' : '♀ Female'}
              </Badge>
            </div>

            {/* Quick Info */}
            <div className="mt-6 flex flex-wrap gap-6">
              {dog.date_of_birth && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Calendar className="h-5 w-5" />
                  <span>{calculateAge(dog.date_of_birth)} old</span>
                </div>
              )}
              {dog.is_fluffy && (
                <Badge variant="purple">Fluffy Coat</Badge>
              )}
            </div>

            {/* Bio */}
            {dog.bio && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-neutral-900">About</h2>
                <p className="mt-2 text-neutral-600 leading-relaxed">{dog.bio}</p>
              </div>
            )}

            {/* Health Testing Notes */}
            {dog.health_testing && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-neutral-900">Health Testing</h2>
                <p className="mt-2 text-neutral-600 leading-relaxed">{dog.health_testing}</p>
              </div>
            )}

            {/* Health Testing */}
            {healthTests.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Health Testing</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {healthTests.map((test) => (
                      <li key={test.id} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {test.test_type}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {test.result}
                            {test.test_date && (
                              <span className="text-neutral-400">
                                {' '}
                                · {formatDate(test.test_date)}
                              </span>
                            )}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <div className="mt-8">
              <Link href="/apply">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Apply for a Puppy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
