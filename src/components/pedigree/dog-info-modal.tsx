'use client'

import { useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import { Target, UserPlus } from '@phosphor-icons/react'
import type { Dog } from '@/types/database'
import { cn } from '@/lib/utils'

interface DogInfoModalProps {
  dog: Dog | null
  allDogs?: Dog[]
  isEditable?: boolean
  onClose: () => void
  onFocus?: (dogId: string) => void
  onParentSet?: (childId: string, parentId: string, parentType: 'sire' | 'dam') => void
}

export function DogInfoModal({ dog, allDogs, isEditable, onClose, onFocus, onParentSet }: DogInfoModalProps) {
  const [showParentSelect, setShowParentSelect] = useState(false)
  const [selectedSire, setSelectedSire] = useState<string>('')
  const [selectedDam, setSelectedDam] = useState<string>('')
  const [saving, setSaving] = useState(false)

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
      // Initialize with current parents
      setSelectedSire(dog.sire_id || '')
      setSelectedDam(dog.dam_id || '')
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }
  }, [dog, handleKeyDown])

  if (!dog) return null

  const isMale = dog.gender === 'male'
  const males = allDogs?.filter(d => d.gender === 'male' && d.id !== dog.id) || []
  const females = allDogs?.filter(d => d.gender === 'female' && d.id !== dog.id) || []

  const handleSaveParents = async () => {
    if (!dog) return
    setSaving(true)
    try {
      // Save sire if changed
      if (selectedSire !== (dog.sire_id || '')) {
        if (selectedSire) {
          await fetch('/api/pedigree/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'dog',
              childDogId: dog.id,
              field: 'sire_id',
              parentDogId: selectedSire,
            }),
          })
          onParentSet?.(dog.id, selectedSire, 'sire')
        } else {
          await fetch('/api/pedigree/connect', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'dog',
              id: dog.id,
              field: 'sire_id',
            }),
          })
        }
      }
      // Save dam if changed
      if (selectedDam !== (dog.dam_id || '')) {
        if (selectedDam) {
          await fetch('/api/pedigree/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'dog',
              childDogId: dog.id,
              field: 'dam_id',
              parentDogId: selectedDam,
            }),
          })
          onParentSet?.(dog.id, selectedDam, 'dam')
        } else {
          await fetch('/api/pedigree/connect', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'dog',
              id: dog.id,
              field: 'dam_id',
            }),
          })
        }
      }
      setShowParentSelect(false)
      // Refresh the page to show updated connections
      window.location.reload()
    } catch (error) {
      console.error('Failed to save parents:', error)
    } finally {
      setSaving(false)
    }
  }

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

          {/* Parent Selection (Admin Only) */}
          {isEditable && showParentSelect && (
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <h3 className="font-semibold text-neutral-800 mb-3">Set Parents</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-neutral-600 mb-1">
                    <span className="text-blue-500 font-bold">♂</span> Sire (Father)
                  </label>
                  <select
                    value={selectedSire}
                    onChange={(e) => setSelectedSire(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  >
                    <option value="">No sire selected</option>
                    {males.map((male) => (
                      <option key={male.id} value={male.id}>
                        {male.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-600 mb-1">
                    <span className="text-pink-500 font-bold">♀</span> Dam (Mother)
                  </label>
                  <select
                    value={selectedDam}
                    onChange={(e) => setSelectedDam(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  >
                    <option value="">No dam selected</option>
                    {females.map((female) => (
                      <option key={female.id} value={female.id}>
                        {female.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveParents}
                    disabled={saving}
                    className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Parents'}
                  </button>
                  <button
                    onClick={() => setShowParentSelect(false)}
                    className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/dogs/${dog.slug}`}
              className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 text-center font-medium text-white hover:bg-amber-600 transition-colors"
            >
              View Full Profile
            </Link>
            {isEditable && !showParentSelect && (
              <button
                onClick={() => setShowParentSelect(true)}
                className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 font-medium text-green-700 hover:bg-green-100 transition-colors"
                title="Set this dog's parents"
              >
                <UserPlus className="h-4 w-4" />
                Set Parents
              </button>
            )}
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
