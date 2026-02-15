'use client'

import { useRouter } from 'next/navigation'
import { GalleryManager } from '@/components/admin/gallery-manager'
import type { DogImage } from '@/types/database'

interface GalleryManagerWrapperProps {
  dogId: string
  initialImages: DogImage[]
}

export function GalleryManagerWrapper({ dogId, initialImages }: GalleryManagerWrapperProps) {
  const router = useRouter()

  const handleImagesChange = () => {
    router.refresh()
  }

  return (
    <GalleryManager
      images={initialImages.map(img => ({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text,
        display_order: img.display_order,
      }))}
      entityId={dogId}
      entityType="dog"
      bucket="dogs"
      onImagesChange={handleImagesChange}
    />
  )
}
