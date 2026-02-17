'use client'

import Image from 'next/image'
import { useState } from 'react'
import { GenderMale, GenderFemale } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Puppy, PuppyImage } from '@/types/database'

interface PuppyCardProps {
  puppy: Puppy & { puppy_images?: PuppyImage[] }
}

const statusConfig = {
  available: { label: 'Available', variant: 'success' as const },
  reserved: { label: 'Reserved', variant: 'warning' as const },
  deposit: { label: 'Deposit Paid', variant: 'info' as const },
  sold: { label: 'Sold', variant: 'default' as const },
}

export function PuppyCard({ puppy }: PuppyCardProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const status = statusConfig[puppy.status] || statusConfig.available

  const displayName = puppy.name || `${puppy.collar_color || 'No'} Collar`

  return (
    <article
      className="luxury-card group relative overflow-hidden rounded-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Corner ornaments */}
      <div className="corner-ornament corner-ornament-tl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
      <div className="corner-ornament corner-ornament-br opacity-0 group-hover:opacity-40 transition-opacity duration-500" />

      {/* Image container */}
      <div className="relative aspect-square overflow-hidden">
        {/* Luxury frame effect */}
        <div className="absolute inset-0 z-10 pointer-events-none border border-[#c9a227]/0 group-hover:border-[#c9a227]/20 transition-colors duration-500" />

        {puppy.image_url ? (
          <>
            {/* Background gradient for loading */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#faf6f0] to-[#f5efe6]" />

            {/* Main image */}
            <Image
              src={puppy.image_url}
              alt={displayName}
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
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#faf6f0] to-[#f5efe6]">
            <span className="text-6xl opacity-30">🐕</span>
            {puppy.collar_color && (
              <span
                className="mt-2 inline-block h-3 w-16 rounded-full shadow-sm"
                style={{ backgroundColor: puppy.collar_color.toLowerCase() }}
              />
            )}
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-4 right-4 z-20">
          <Badge
            variant={status.variant}
            className={cn(
              'backdrop-blur-sm transition-transform duration-300',
              isHovered && 'scale-105'
            )}
          >
            {status.label}
          </Badge>
        </div>

        {/* Gender badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider backdrop-blur-sm transition-all duration-300',
            puppy.gender === 'male'
              ? 'bg-[#1a1612]/80 text-[#e8d48a] ring-1 ring-[#c9a227]/30'
              : 'bg-[#c9a227]/90 text-white ring-1 ring-[#c9a227]/50',
            isHovered && 'scale-105'
          )}>
            {puppy.gender === 'male' ? (
              <GenderMale weight="bold" className="h-3.5 w-3.5" />
            ) : (
              <GenderFemale weight="bold" className="h-3.5 w-3.5" />
            )}
            {puppy.gender === 'male' ? 'Male' : 'Female'}
          </span>
        </div>

        {/* Name overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
          <h3 className="font-display text-2xl font-medium text-white drop-shadow-lg">
            {displayName}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            {puppy.color && (
              <span className="font-body text-sm text-[#e8d48a]">{puppy.color}</span>
            )}
            {puppy.current_weight_oz && (
              <>
                {puppy.color && <span className="text-[#c9a227]/50">·</span>}
                <span className="font-body text-sm text-white/70">
                  {(puppy.current_weight_oz / 16).toFixed(1)} lbs
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

        <div className="flex items-center justify-between">
          {puppy.price && puppy.status === 'available' && (
            <span className="font-display text-lg font-medium text-[#1a1612]">
              ${puppy.price.toLocaleString()}
            </span>
          )}
          {puppy.status === 'sold' && (
            <span className="font-body text-sm text-neutral-500">
              Found their forever home
            </span>
          )}
          {puppy.status === 'reserved' && (
            <span className="font-body text-sm text-amber-600">
              Reserved
            </span>
          )}
          {puppy.status === 'deposit' && (
            <span className="font-body text-sm text-blue-600">
              Deposit received
            </span>
          )}
        </div>

        {puppy.notes && puppy.status === 'available' && (
          <p className="mt-2 font-body text-sm leading-relaxed text-neutral-600 line-clamp-2">
            {puppy.notes}
          </p>
        )}
      </div>
    </article>
  )
}
