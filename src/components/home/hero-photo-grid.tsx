'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface HeroPhotoGridProps {
  images: string[]
}

export function HeroPhotoGrid({ images }: HeroPhotoGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (images.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [images.length])

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set([...prev, index]))
  }

  if (images.length === 0) return null

  return (
    <div className="mt-12 lg:mt-0">
      {/* Main carousel */}
      <div className="relative">
        <div
          className={cn(
            'hero-grid-item relative aspect-[4/3] overflow-hidden rounded-2xl',
            mounted && 'image-reveal'
          )}
          onMouseEnter={() => setHoveredIndex(activeIndex)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-neutral-200" />

          {/* All images stacked, only active one visible */}
          {images.map((url, i) => (
            <Image
              key={i}
              src={url}
              alt="Fluffy French Bulldog"
              fill
              priority={i === 0}
              className={cn(
                'pro-image object-cover transition-all duration-700',
                loadedImages.has(i) ? 'scale-100' : 'scale-105',
                i === activeIndex ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => handleImageLoad(i)}
            />
          ))}

          {/* Professional overlays */}
          <div className="pro-image-lighting absolute inset-0 pointer-events-none" />
          <div className="pro-image-vignette absolute inset-0 pointer-events-none" />
          <div className="pro-image-shine absolute inset-0 pointer-events-none" />

          {/* Corner accents */}
          <div className="corner-accent corner-accent-tl" />
          <div className="corner-accent corner-accent-tr" />
          <div className="corner-accent corner-accent-bl" />
          <div className="corner-accent corner-accent-br" />

          {/* Sparkles */}
          {hoveredIndex === activeIndex && (
            <div className="pro-sparkles absolute inset-0 pointer-events-none">
              <div className="sparkle sparkle-1" />
              <div className="sparkle sparkle-2" />
              <div className="sparkle sparkle-3" />
              <div className="sparkle sparkle-4" />
            </div>
          )}

          {/* Featured badge */}
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-sm font-semibold rounded-full shadow-lg badge-glow">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                aria-label="Next image"
              >
                <svg className="w-5 h-5 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="mt-4 pt-1 flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={cn(
                  'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300',
                  i === activeIndex
                    ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-neutral-900'
                    : 'opacity-60 hover:opacity-100'
                )}
              >
                <Image
                  src={url}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dot indicators */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === activeIndex ? 'w-6 bg-amber-500' : 'w-2 bg-white/50 hover:bg-white/80'
            )}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
