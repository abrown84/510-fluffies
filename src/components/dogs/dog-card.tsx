'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Dog } from '@/types/database'
import { calculateAge, cn } from '@/lib/utils'
import { GenderMale, GenderFemale, ArrowRight } from '@phosphor-icons/react'

interface DogCardProps {
  dog: Dog
}

export function DogCard({ dog }: DogCardProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={`/dogs/${dog.slug}`}>
      <article
        className="luxury-card group relative overflow-hidden rounded-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Corner ornaments */}
        <div className="corner-ornament corner-ornament-tl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
        <div className="corner-ornament corner-ornament-br opacity-0 group-hover:opacity-40 transition-opacity duration-500" />

        {/* Image container */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {/* Luxury frame effect */}
          <div className="absolute inset-0 z-10 pointer-events-none border border-[#c9a227]/0 group-hover:border-[#c9a227]/20 transition-colors duration-500" />

          {dog.image_url ? (
            <>
              {/* Background gradient for loading */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#faf6f0] to-[#f5efe6]" />

              {/* Main image */}
              <Image
                src={dog.image_url}
                alt={dog.name}
                fill
                className={cn(
                  'object-cover transition-all duration-700',
                  isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
                  'group-hover:scale-105'
                )}
                onLoad={() => setIsLoaded(true)}
              />

              {/* Professional lighting overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1612]/60 via-transparent to-[#1a1612]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

              {/* Vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(26,22,18,0.3)_100%)]" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#faf6f0] to-[#f5efe6]">
              <span className="text-6xl opacity-30">🐕</span>
            </div>
          )}

          {/* Gender badge - refined */}
          <div className="absolute top-4 right-4 z-20">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider backdrop-blur-sm transition-all duration-300',
              dog.gender === 'male'
                ? 'bg-[#1a1612]/80 text-[#e8d48a] ring-1 ring-[#c9a227]/30'
                : 'bg-[#c9a227]/90 text-white ring-1 ring-[#c9a227]/50',
              isHovered && 'scale-105'
            )}>
              {dog.gender === 'male' ? (
                <GenderMale weight="bold" className="h-3.5 w-3.5" />
              ) : (
                <GenderFemale weight="bold" className="h-3.5 w-3.5" />
              )}
              {dog.gender === 'male' ? 'Male' : 'Female'}
            </span>
          </div>

          {/* Name overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
            <h3 className="font-display text-2xl font-medium text-white drop-shadow-lg">
              {dog.name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-body text-sm text-[#e8d48a]">{dog.color}</span>
              {dog.date_of_birth && (
                <>
                  <span className="text-[#c9a227]/50">·</span>
                  <span className="font-body text-sm text-white/70">
                    {calculateAge(dog.date_of_birth)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="relative p-5 bg-gradient-to-b from-white to-[#faf6f0]">
          {/* Decorative top line */}
          <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-[#c9a227]/30 to-transparent" />

          {dog.bio && (
            <p className="font-body text-sm leading-relaxed text-neutral-600 line-clamp-2">
              {dog.bio}
            </p>
          )}

          {/* View profile link */}
          <div className="mt-4 flex items-center justify-between">
            <span className="font-body text-xs font-medium uppercase tracking-wider text-[#c9a227] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              View Profile
            </span>
            <ArrowRight
              weight="bold"
              className="h-4 w-4 text-[#c9a227] transform translate-x-0 opacity-0 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300"
            />
          </div>
        </div>
      </article>
    </Link>
  )
}
