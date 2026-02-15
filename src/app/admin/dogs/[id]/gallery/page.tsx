import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { GalleryManagerWrapper } from './gallery-wrapper'
import type { Dog, DogImage } from '@/types/database'

interface DogGalleryPageProps {
  params: Promise<{ id: string }>
}

interface DogWithImages extends Dog {
  dog_images: DogImage[]
}

async function getDogWithImages(id: string): Promise<DogWithImages | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dogs')
    .select('*, dog_images(*)')
    .eq('id', id)
    .single()
  return data as DogWithImages | null
}

export default async function DogGalleryPage({ params }: DogGalleryPageProps) {
  const { id } = await params
  const dog = await getDogWithImages(id)

  if (!dog) {
    notFound()
  }

  return (
    <div>
      <Link
        href="/admin/dogs"
        className="inline-flex items-center text-sm text-neutral-600 hover:text-amber-600"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dogs
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-neutral-900">{dog.name}&apos;s Gallery</h1>
        <p className="mt-1 text-neutral-600">
          Manage photos for {dog.name}
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Photo Gallery</CardTitle>
          <CardDescription>
            Upload and manage photos. Images will appear on the public gallery and {dog.name}&apos;s profile page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GalleryManagerWrapper
            dogId={dog.id}
            initialImages={dog.dog_images || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
