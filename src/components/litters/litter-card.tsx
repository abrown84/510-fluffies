'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { LitterWithParents } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, cn } from '@/lib/utils'

interface LitterCardProps {
  litter: LitterWithParents
}

const statusConfig = {
  expected: { label: 'Expecting', variant: 'info' as const },
  born: { label: 'Born', variant: 'warning' as const },
  available: { label: 'Available', variant: 'success' as const },
  sold: { label: 'Sold Out', variant: 'default' as const },
}

export function LitterCard({ litter }: LitterCardProps) {
  const status = statusConfig[litter.status as keyof typeof statusConfig] || statusConfig.expected
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="litter-card-enhanced overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="pro-image-container relative aspect-video overflow-hidden">
        {litter.image_url ? (
          <>
            {/* Background gradient for loading */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-neutral-50 to-amber-100" />

            {/* Main image */}
            <Image
              src={litter.image_url}
              alt={litter.name}
              fill
              className={cn(
                'pro-image object-cover transition-all duration-700',
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              )}
              onLoad={() => setIsLoaded(true)}
            />

            {/* Professional overlays */}
            <div className="pro-image-lighting absolute inset-0 pointer-events-none" />
            <div className="pro-image-vignette absolute inset-0 pointer-events-none" />
            <div className="pro-image-shine absolute inset-0 pointer-events-none" />

            {/* Decorative corners */}
            <div className="corner-accent corner-accent-tl" />
            <div className="corner-accent corner-accent-tr" />
            <div className="corner-accent corner-accent-bl" />
            <div className="corner-accent corner-accent-br" />

            {/* Sparkles */}
            {isHovered && (
              <div className="pro-sparkles absolute inset-0 pointer-events-none">
                <div className="sparkle sparkle-1" />
                <div className="sparkle sparkle-2" />
                <div className="sparkle sparkle-3" />
                <div className="sparkle sparkle-4" />
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-50 via-neutral-50 to-amber-100">
            <div className="relative">
              <span className="text-7xl drop-shadow-lg animate-bounce">🐾</span>
              <div className="absolute -inset-4 bg-amber-200/30 rounded-full blur-xl -z-10" />
            </div>
          </div>
        )}

        {/* Status badge with glow */}
        <div className="absolute right-3 top-3 z-20">
          <Badge
            variant={status.variant}
            className={cn(
              'badge-glow backdrop-blur-sm font-semibold transition-transform duration-300',
              isHovered && 'scale-110'
            )}
          >
            {status.label}
          </Badge>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardContent className="relative p-6">
        {/* Decorative top line */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

        {/* Litter Name */}
        <h3 className="text-xl font-bold text-neutral-900">{litter.name}</h3>

        {/* Parents with fancy styling */}
        <div className="mt-4 flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-amber-50/80 to-neutral-50/80 border border-amber-100/50">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Sire
            </p>
            {litter.sire ? (
              <Link
                href={`/dogs/${litter.sire.id}`}
                className="font-bold text-neutral-800 hover:text-amber-600 transition-colors"
              >
                {litter.sire.name}
              </Link>
            ) : litter.custom_sire_name ? (
              <span className="font-bold text-neutral-800">{litter.custom_sire_name}</span>
            ) : (
              <span className="text-neutral-400 italic">TBD</span>
            )}
          </div>

          {/* Fancy heart divider */}
          <div className="relative">
            <span className="text-2xl text-amber-400">×</span>
            <div className="absolute inset-0 bg-amber-200/50 blur-md -z-10 rounded-full" />
          </div>

          <div className="flex-1 text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Dam
            </p>
            {litter.dam ? (
              <Link
                href={`/dogs/${litter.dam.id}`}
                className="font-bold text-neutral-800 hover:text-amber-600 transition-colors"
              >
                {litter.dam.name}
              </Link>
            ) : litter.custom_dam_name ? (
              <span className="font-bold text-neutral-800">{litter.custom_dam_name}</span>
            ) : (
              <span className="text-neutral-400 italic">TBD</span>
            )}
          </div>
        </div>

        {/* Details with icons */}
        <div className="mt-5 space-y-3">
          {litter.expected_date && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-500 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Expected
              </span>
              <span className="font-semibold text-neutral-700">{formatDate(litter.expected_date)}</span>
            </div>
          )}
          {litter.date_of_birth && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-500 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Born
              </span>
              <span className="font-semibold text-neutral-700">{formatDate(litter.date_of_birth)}</span>
            </div>
          )}
          {litter.available_count !== null && litter.available_count > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-500 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Available
              </span>
              <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {litter.available_count} {litter.available_count === 1 ? 'puppy' : 'puppies'}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {litter.description && (
          <p className="mt-4 text-sm text-neutral-600 leading-relaxed border-l-2 border-amber-200 pl-3 italic">
            {litter.description}
          </p>
        )}

        {/* CTA with enhanced styling */}
        <div className="mt-6 flex gap-3">
          <Link href={`/litters/${litter.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full"
            >
              View Details
            </Button>
          </Link>
          {litter.status !== 'sold' && (
            <Link href="/apply" className="flex-1">
              <Button
                variant="primary"
                className="w-full relative overflow-hidden group/btn"
              >
                <span className="relative z-10">Apply</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 transform translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
