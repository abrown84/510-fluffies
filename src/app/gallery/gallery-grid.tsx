'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GalleryImage } from './page'

interface GalleryGridProps {
  images: GalleryImage[]
}

type FilterCategory = 'all' | 'dogs' | 'litters' | 'puppies'

const filterLabels: Record<FilterCategory, string> = {
  all: 'All Photos',
  dogs: 'Our Dogs',
  litters: 'Litters',
  puppies: 'Puppies',
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const [filter, setFilter] = useState<FilterCategory>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filteredImages = filter === 'all'
    ? images
    : images.filter(img => img.category === filter)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
    document.body.style.overflow = ''
  }

  const goToPrevious = () => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === 0 ? filteredImages.length - 1 : lightboxIndex - 1)
  }

  const goToNext = () => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === filteredImages.length - 1 ? 0 : lightboxIndex + 1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
  }

  const categoryCounts = {
    all: images.length,
    dogs: images.filter(img => img.category === 'dogs').length,
    litters: images.filter(img => img.category === 'litters').length,
    puppies: images.filter(img => img.category === 'puppies').length,
  }

  return (
    <>
      {/* Filter Tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {(Object.keys(filterLabels) as FilterCategory[]).map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              filter === category
                ? 'bg-amber-100 text-amber-800'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            )}
          >
            {filterLabels[category]}
            <span className="ml-1.5 text-xs opacity-60">({categoryCounts[category]})</span>
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {filteredImages.map((image, index) => (
          <div
            key={image.id}
            className="mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-xl bg-neutral-100 transition-transform hover:scale-[1.02]"
            onClick={() => openLightbox(index)}
          >
            <div className="relative">
              <Image
                src={image.url}
                alt={image.alt}
                width={400}
                height={400}
                className="h-auto w-full object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity hover:opacity-100">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-medium text-white">{image.title}</p>
                  {image.subtitle && (
                    <p className="text-xs text-white/80">{image.subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => { e.stopPropagation(); goToPrevious() }}
            className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          {/* Image */}
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={filteredImages[lightboxIndex].url}
              alt={filteredImages[lightboxIndex].alt}
              width={1200}
              height={1200}
              className="max-h-[85vh] w-auto object-contain"
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p className="text-lg font-medium text-white">
                {filteredImages[lightboxIndex].title}
              </p>
              {filteredImages[lightboxIndex].subtitle && (
                <p className="text-sm text-white/80">
                  {filteredImages[lightboxIndex].subtitle}
                </p>
              )}
              <p className="mt-2 text-xs text-white/60">
                {lightboxIndex + 1} of {filteredImages.length}
              </p>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => { e.stopPropagation(); goToNext() }}
            className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      )}
    </>
  )
}
