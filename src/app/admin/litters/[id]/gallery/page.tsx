import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { LitterGalleryWrapper } from './gallery-wrapper'
import type { Litter, LitterImage, Dog } from '@/types/database'

interface LitterGalleryPageProps {
  params: Promise<{ id: string }>
}

interface LitterWithImages extends Litter {
  litter_images: LitterImage[]
  sire: Dog | null
  dam: Dog | null
}

async function getLitterWithImages(id: string): Promise<LitterWithImages | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('litters')
    .select('*, litter_images(*), sire:dogs!litters_sire_id_fkey(*), dam:dogs!litters_dam_id_fkey(*)')
    .eq('id', id)
    .single()
  return data as LitterWithImages | null
}

export default async function LitterGalleryPage({ params }: LitterGalleryPageProps) {
  const { id } = await params
  const litter = await getLitterWithImages(id)

  if (!litter) {
    notFound()
  }

  const litterName = litter.sire && litter.dam
    ? `${litter.sire.name} × ${litter.dam.name}`
    : 'Litter'

  return (
    <div>
      <Link
        href="/admin/litters"
        className="inline-flex items-center text-sm text-neutral-600 hover:text-amber-600"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Litters
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-neutral-900">{litterName} Gallery</h1>
        <p className="mt-1 text-neutral-600">
          Manage photos for this litter
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Photo Gallery</CardTitle>
          <CardDescription>
            Upload and manage photos. Images will appear on the public gallery and litter detail page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LitterGalleryWrapper
            litterId={litter.id}
            initialImages={litter.litter_images || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
