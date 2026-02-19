'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { DogImage } from '@/types/database'

interface ImageGalleryProps {
  mainImage: string | null
  dogName: string
  additionalImages: DogImage[]
}

export function ImageGallery({ mainImage, dogName, additionalImages }: ImageGalleryProps) {
  // Combine main image with additional images
  const allImages = [
    ...(mainImage ? [{ id: 'main', image_url: mainImage, alt_text: dogName }] : []),
    ...additionalImages.map(img => ({ id: img.id, image_url: img.image_url, alt_text: img.alt_text || dogName })),
  ]

  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedImage = allImages[selectedIndex]

  if (allImages.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
        <div className="flex h-full items-center justify-center">
          <span className="text-8xl">🐕</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={selectedImage.image_url}
          alt={selectedImage.alt_text || dogName}
          fill
          className="object-cover transition-opacity duration-300"
          priority
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg bg-neutral-100 transition-all duration-200',
                'hover:ring-2 hover:ring-amber-400 hover:ring-offset-2',
                'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
                selectedIndex === index && 'ring-2 ring-amber-500 ring-offset-2'
              )}
            >
              <Image
                src={image.image_url}
                alt={image.alt_text || dogName}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
