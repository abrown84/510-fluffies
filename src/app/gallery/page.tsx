import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { GalleryGrid } from './gallery-grid'
import type { Dog, DogImage, Litter, LitterImage, Puppy, PuppyImage } from '@/types/database'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Browse our gallery of Fluffy French Bulldogs, litters, and puppies.',
}

export const revalidate = 3600

interface DogWithImages extends Dog {
  dog_images: DogImage[]
}

interface LitterWithImages extends Litter {
  litter_images: LitterImage[]
  sire: Dog | null
  dam: Dog | null
}

interface PuppyWithImages extends Puppy {
  puppy_images: PuppyImage[]
  litter: { sire: Dog | null; dam: Dog | null } | null
}

export interface GalleryImage {
  id: string
  url: string
  alt: string
  category: 'dogs' | 'litters' | 'puppies'
  title: string
  subtitle?: string
}

async function getGalleryImages(): Promise<GalleryImage[]> {
  const supabase = await createClient()
  const images: GalleryImage[] = []

  // Get dogs with their images
  const { data: dogs } = await supabase
    .from('dogs')
    .select('*, dog_images(*)')
    .in('status', ['available', 'breeding'])
    .order('name')

  const typedDogs = (dogs as DogWithImages[]) || []

  for (const dog of typedDogs) {
    // Add cover image
    if (dog.image_url) {
      images.push({
        id: `dog-cover-${dog.id}`,
        url: dog.image_url,
        alt: dog.name,
        category: 'dogs',
        title: dog.name,
        subtitle: dog.color,
      })
    }
    // Add gallery images
    for (const img of dog.dog_images || []) {
      images.push({
        id: `dog-${img.id}`,
        url: img.image_url,
        alt: img.alt_text || dog.name,
        category: 'dogs',
        title: dog.name,
        subtitle: dog.color,
      })
    }
  }

  // Get litters with their images
  const { data: litters } = await supabase
    .from('litters')
    .select('*, litter_images(*), sire:dogs!litters_sire_id_fkey(*), dam:dogs!litters_dam_id_fkey(*)')
    .order('created_at', { ascending: false })

  const typedLitters = (litters as LitterWithImages[]) || []

  for (const litter of typedLitters) {
    const litterName = litter.sire && litter.dam
      ? `${litter.sire.name} × ${litter.dam.name}`
      : 'Litter'

    // Add cover image
    if (litter.image_url) {
      images.push({
        id: `litter-cover-${litter.id}`,
        url: litter.image_url,
        alt: litterName,
        category: 'litters',
        title: litterName,
        subtitle: litter.status,
      })
    }
    // Add gallery images
    for (const img of litter.litter_images || []) {
      images.push({
        id: `litter-${img.id}`,
        url: img.image_url,
        alt: img.alt_text || litterName,
        category: 'litters',
        title: litterName,
        subtitle: litter.status,
      })
    }
  }

  // Get puppies with their images
  const { data: puppies } = await supabase
    .from('puppies')
    .select('*, puppy_images(*), litter:litters(sire:dogs!litters_sire_id_fkey(*), dam:dogs!litters_dam_id_fkey(*))')
    .order('created_at', { ascending: false })

  const typedPuppies = (puppies as PuppyWithImages[]) || []

  for (const puppy of typedPuppies) {
    const puppyName = puppy.name || puppy.collar_color || 'Puppy'

    // Add main image
    if (puppy.image_url) {
      images.push({
        id: `puppy-main-${puppy.id}`,
        url: puppy.image_url,
        alt: puppyName,
        category: 'puppies',
        title: puppyName,
        subtitle: puppy.color || puppy.status,
      })
    }
    // Add gallery images
    for (const img of puppy.puppy_images || []) {
      images.push({
        id: `puppy-${img.id}`,
        url: img.image_url,
        alt: img.alt_text || puppyName,
        category: 'puppies',
        title: puppyName,
        subtitle: puppy.color || puppy.status,
      })
    }
  }

  return images
}

export default async function GalleryPage() {
  const images = await getGalleryImages()

  return (
    <div className="min-h-screen bg-[#fffbf5] pt-28 pb-12 sm:pt-32 sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Gallery
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
            Browse photos of our beautiful Fluffy French Bulldogs, past litters, and puppies.
          </p>
        </div>

        {/* Gallery */}
        <div className="mt-12">
          <GalleryGrid images={images} />
        </div>

        {/* Empty State */}
        {images.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg text-neutral-500">
              No photos available yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
