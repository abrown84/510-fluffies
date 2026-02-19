'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Target } from '@phosphor-icons/react'
import type { Dog } from '@/types/database'
import { cn } from '@/lib/utils'

interface DogInfoModalProps {
  dog: Dog | null
  onClose: () => void
  onFocus?: (dogId: string) => void
}

export function DogInfoModal({ dog, onClose, onFocus }: DogInfoModalProps) {
  // Close on escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (dog) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }
  }, [dog, handleKeyDown])

  if (!dog) return null

  const isMale = dog.gender === 'male'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Photo */}
        <div className="relative aspect-square">
          {dog.image_url ? (
            <img
              src={dog.image_url}
              alt={dog.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={cn(
                'flex h-full w-full items-center justify-center text-8xl',
                isMale ? 'bg-blue-50 text-blue-300' : 'bg-pink-50 text-pink-300'
              )}
            >
              {isMale ? '♂' : '♀'}
            </div>
          )}

          {/* Gender badge */}
          <div
            className={cn(
              'absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg',
              isMale ? 'bg-blue-500' : 'bg-pink-500'
            )}
          >
            {isMale ? '♂' : '♀'}
          </div>
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">{dog.name}</h2>
              {dog.color && (
                <p className="mt-1 text-neutral-600">{dog.color}</p>
              )}
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-sm font-medium',
                dog.status === 'breeding'
                  ? 'bg-green-100 text-green-700'
                  : dog.status === 'retired'
                  ? 'bg-neutral-100 text-neutral-600'
                  : 'bg-amber-100 text-amber-700'
              )}
            >
              {dog.status}
            </span>
          </div>

          {/* Details */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            {dog.date_of_birth && (
              <div>
                <span className="text-neutral-500">Born</span>
                <p className="font-medium text-neutral-800">
                  {new Date(dog.date_of_birth).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Bio */}
          {dog.bio && (
            <p className="mt-4 text-sm text-neutral-600 line-clamp-3">
              {dog.bio}
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Link
              href={`/dogs/${dog.slug}`}
              className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 text-center font-medium text-white hover:bg-amber-600 transition-colors"
            >
              View Full Profile
            </Link>
            {onFocus && (
              <button
                onClick={() => {
                  onFocus(dog.id)
                  onClose()
                }}
                className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2.5 font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                title="Focus on this dog's lineage"
              >
                <Target className="h-4 w-4" />
                Focus
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-4 py-2.5 font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
