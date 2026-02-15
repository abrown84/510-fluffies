import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { GalleryGrid } from './gallery-grid'
import type { Dog, DogImage, Litter, LitterImage, Puppy, PuppyImage, LitterWithParents } from '@/types/database'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Browse our gallery of Fluffy French Bulldogs, litters, and puppies.',
}

export const revalidate = 3600

interface LitterWithImages extends Litter {
  sire: Dog | null
  dam: Dog | null
}

interface PuppyWithImages extends Puppy {
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

  // Execute all queries in parallel for maximum efficiency
  const [
    { data: dogs },
    { data: litters },
    { data: puppies },
    { data: dogImages },
    { data: litterImages },
    { data: puppyImages },
  ] = await Promise.all([
    // Main entity queries
    supabase
      .from('dogs')
      .select('*')
      .in('status', ['available', 'breeding'])
      .order('name'),
    supabase
      .from('litters')
      .select('*, sire:dogs!litters_sire_id_fkey(*), dam:dogs!litters_dam_id_fkey(*)')
      .order('created_at', { ascending: false }),
    supabase
      .from('puppies')
      .select('*, litter:litters(sire:dogs!litters_sire_id_fkey(*), dam:dogs!litters_dam_id_fkey(*))')
      .order('created_at', { ascending: false }),
    // Gallery image queries
    supabase.from('dog_images').select('*'),
    supabase.from('litter_images').select('*'),
    supabase.from('puppy_images').select('*'),
  ])

  const typedDogs = (dogs as Dog[]) || []
  const typedLitters = (litters as LitterWithImages[]) || []
  const typedPuppies = (puppies as PuppyWithImages[]) || []

  // Create lookup maps for O(1) access instead of O(n) find()
  const dogMap = new Map(typedDogs.map(d => [d.id, d]))
  const litterMap = new Map(typedLitters.map(l => [l.id, l]))
  const puppyMap = new Map(typedPuppies.map(p => [p.id, p]))

  // Process dogs
  for (const dog of typedDogs) {
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
    if (dog.gallery_urls?.length) {
      for (let i = 0; i < dog.gallery_urls.length; i++) {
        images.push({
          id: `dog-gallery-${dog.id}-${i}`,
          url: dog.gallery_urls[i],
          alt: dog.name,
          category: 'dogs',
          title: dog.name,
          subtitle: dog.color,
        })
      }
    }
  }

  // Process dog gallery images
  if (dogImages?.length) {
    for (const img of dogImages as DogImage[]) {
      const dog = dogMap.get(img.dog_id)
      if (dog) {
        images.push({
          id: `dog-img-${img.id}`,
          url: img.image_url,
          alt: img.alt_text || dog.name,
          category: 'dogs',
          title: dog.name,
          subtitle: dog.color,
        })
      }
    }
  }

  // Process litters
  for (const litter of typedLitters) {
    const litterName = litter.sire && litter.dam
      ? `${litter.sire.name} × ${litter.dam.name}`
      : 'Litter'
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
  }

  // Process litter gallery images
  if (litterImages?.length) {
    for (const img of litterImages as LitterImage[]) {
      const litter = litterMap.get(img.litter_id)
      if (litter) {
        const litterName = litter.sire && litter.dam
          ? `${litter.sire.name} × ${litter.dam.name}`
          : 'Litter'
        images.push({
          id: `litter-img-${img.id}`,
          url: img.image_url,
          alt: img.alt_text || litterName,
          category: 'litters',
          title: litterName,
          subtitle: litter.status,
        })
      }
    }
  }

  // Process puppies
  for (const puppy of typedPuppies) {
    const puppyName = puppy.name || puppy.collar_color || 'Puppy'
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
  }

  // Process puppy gallery images
  if (puppyImages?.length) {
    for (const img of puppyImages as PuppyImage[]) {
      const puppy = puppyMap.get(img.puppy_id)
      if (puppy) {
        const puppyName = puppy.name || puppy.collar_color || 'Puppy'
        images.push({
          id: `puppy-img-${img.id}`,
          url: img.image_url,
          alt: img.alt_text || puppyName,
          category: 'puppies',
          title: puppyName,
          subtitle: puppy.color || puppy.status,
        })
      }
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
