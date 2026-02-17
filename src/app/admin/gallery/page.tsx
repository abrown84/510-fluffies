import { createClient } from '@/lib/supabase/server'
import { GalleryClient } from './gallery-client'
import type { Dog, Litter, Puppy, DogImage, LitterImage, PuppyImage } from '@/types/database'

export interface UnifiedImage {
  id: string
  image_url: string
  alt_text: string | null
  display_order: number
  created_at: string
  entity_type: 'dog' | 'litter' | 'puppy'
  entity_id: string
  entity_name: string
}

interface LitterWithParents extends Litter {
  sire: Pick<Dog, 'name'> | null
  dam: Pick<Dog, 'name'> | null
}

interface DogWithImages extends Dog {
  dog_images: DogImage[]
}

interface LitterWithImages extends LitterWithParents {
  litter_images: LitterImage[]
}

interface PuppyWithImages extends Puppy {
  puppy_images: PuppyImage[]
}

interface Entity {
  id: string
  name: string
  type: 'dog' | 'litter' | 'puppy'
}

async function getAllImages(): Promise<{
  dogImages: UnifiedImage[]
  litterImages: UnifiedImage[]
  puppyImages: UnifiedImage[]
  entities: Entity[]
}> {
  const supabase = await createClient()

  // Query through parent tables with joins
  const [dogsResult, littersResult, puppiesResult] = await Promise.all([
    supabase
      .from('dogs')
      .select('id, name, status, image_url, gallery_urls, dog_images(*)')
      .order('name'),
    supabase
      .from('litters')
      .select('id, name, image_url, sire:dogs!litters_sire_id_fkey(name), dam:dogs!litters_dam_id_fkey(name), litter_images(*)')
      .order('created_at', { ascending: false }),
    supabase
      .from('puppies')
      .select('id, name, collar_color, status, image_url, puppy_images(*)')
      .order('created_at', { ascending: false }),
  ])

  const dogs = (dogsResult.data as DogWithImages[]) || []
  const litters = (littersResult.data as LitterWithImages[]) || []
  const puppies = (puppiesResult.data as PuppyWithImages[]) || []

  // Collect dog images from all sources
  const dogImages: UnifiedImage[] = []
  for (const dog of dogs) {
    // Cover image (image_url on dog record)
    if (dog.image_url) {
      dogImages.push({
        id: `dog-cover-${dog.id}`,
        image_url: dog.image_url,
        alt_text: `${dog.name} cover`,
        display_order: -1,
        created_at: new Date().toISOString(),
        entity_type: 'dog',
        entity_id: dog.id,
        entity_name: dog.name,
      })
    }
    // Gallery URLs array on dog record
    if (dog.gallery_urls?.length) {
      dog.gallery_urls.forEach((url, i) => {
        dogImages.push({
          id: `dog-gallery-${dog.id}-${i}`,
          image_url: url,
          alt_text: `${dog.name} gallery ${i + 1}`,
          display_order: i,
          created_at: new Date().toISOString(),
          entity_type: 'dog',
          entity_id: dog.id,
          entity_name: dog.name,
        })
      })
    }
    // dog_images table
    for (const img of dog.dog_images || []) {
      dogImages.push({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text,
        display_order: img.display_order,
        created_at: img.created_at,
        entity_type: 'dog',
        entity_id: dog.id,
        entity_name: dog.name,
      })
    }
  }

  // Collect litter images from all sources
  const litterImages: UnifiedImage[] = []
  for (const litter of litters) {
    let name = litter.name
    if (litter.sire?.name && litter.dam?.name) {
      name = `${litter.name} (${litter.sire.name} x ${litter.dam.name})`
    }
    // Cover image
    if (litter.image_url) {
      litterImages.push({
        id: `litter-cover-${litter.id}`,
        image_url: litter.image_url,
        alt_text: `${name} cover`,
        display_order: -1,
        created_at: new Date().toISOString(),
        entity_type: 'litter',
        entity_id: litter.id,
        entity_name: name,
      })
    }
    // litter_images table
    for (const img of litter.litter_images || []) {
      litterImages.push({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text,
        display_order: img.display_order,
        created_at: img.created_at,
        entity_type: 'litter',
        entity_id: litter.id,
        entity_name: name,
      })
    }
  }

  // Collect puppy images from all sources
  const puppyImages: UnifiedImage[] = []
  for (const puppy of puppies) {
    const name = puppy.name || puppy.collar_color || 'Unnamed Puppy'
    // Cover image
    if (puppy.image_url) {
      puppyImages.push({
        id: `puppy-cover-${puppy.id}`,
        image_url: puppy.image_url,
        alt_text: `${name} cover`,
        display_order: -1,
        created_at: new Date().toISOString(),
        entity_type: 'puppy',
        entity_id: puppy.id,
        entity_name: name,
      })
    }
    // puppy_images table
    for (const img of puppy.puppy_images || []) {
      puppyImages.push({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text,
        display_order: img.display_order,
        created_at: img.created_at,
        entity_type: 'puppy',
        entity_id: puppy.id,
        entity_name: name,
      })
    }
  }

  // Build entities list for upload dropdown
  const entities: Entity[] = [
    ...dogs.map((d) => ({ id: d.id, name: d.name, type: 'dog' as const })),
    ...litters.map((l) => {
      let name = l.name
      if (l.sire?.name && l.dam?.name) {
        name = `${l.name} (${l.sire.name} x ${l.dam.name})`
      }
      return { id: l.id, name, type: 'litter' as const }
    }),
    ...puppies.map((p) => ({
      id: p.id,
      name: p.name || p.collar_color || 'Unnamed Puppy',
      type: 'puppy' as const,
    })),
  ]

  return { dogImages, litterImages, puppyImages, entities }
}

export default async function AdminGalleryPage() {
  const { dogImages, litterImages, puppyImages, entities } = await getAllImages()
  const allImages = [...dogImages, ...litterImages, ...puppyImages]

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Photo Gallery</h1>
        <p className="mt-1 text-neutral-600">
          Manage all photos across dogs, litters, and puppies
        </p>
      </div>

      <GalleryClient
        images={allImages}
        stats={{
          dogs: dogImages.length,
          litters: litterImages.length,
          puppies: puppyImages.length,
          total: allImages.length,
        }}
        entities={entities}
      />
    </div>
  )
}
