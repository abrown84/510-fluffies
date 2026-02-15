'use client'

import { useRouter } from 'next/navigation'
import { GalleryManager } from '@/components/admin/gallery-manager'
import type { LitterImage } from '@/types/database'

interface LitterGalleryWrapperProps {
  litterId: string
  initialImages: LitterImage[]
}

export function LitterGalleryWrapper({ litterId, initialImages }: LitterGalleryWrapperProps) {
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
      entityId={litterId}
      entityType="litter"
      bucket="litters"
      onImagesChange={handleImagesChange}
    />
  )
}
