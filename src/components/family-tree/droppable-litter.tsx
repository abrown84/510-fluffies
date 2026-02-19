'use client'

import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { GenderMale, GenderFemale, Plus, X, CaretDown, MagnifyingGlass } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Dog, Puppy } from '@/types/database'
import { DraggableTreeNode } from './draggable-tree-node'
import { useFamilyTree, type LitterWithRelations } from './family-tree-context'

interface DroppableLitterProps {
  litter: LitterWithRelations
}

interface DropSlotProps {
  type: 'sire' | 'dam'
  litterId: string
  currentDog: Dog | null
  customName: string | null
}

function DropSlot({ type, litterId, currentDog, customName }: DropSlotProps) {
  const { dogs, removeSireFromLitter, removeDamFromLitter, assignSireToLitter, assignDamToLitter, isSaving } = useFamilyTree()
  const [showSelector, setShowSelector] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const selectorRef = useRef<HTMLDivElement>(null)

  const { isOver, setNodeRef, active } = useDroppable({
    id: `${type}-${litterId}`,
    data: { type, litterId },
  })

  // Close selector when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowSelector(false)
        setSearchQuery('')
      }
    }
    if (showSelector) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSelector])

  const activeDog = active?.data?.current?.dog as Dog | undefined
  const isDogDragging = !!activeDog
  const isValidDrop = activeDog && (
    (type === 'sire' && activeDog.gender === 'male') ||
    (type === 'dam' && activeDog.gender === 'female')
  )
  const isInvalidDrop = activeDog && !isValidDrop

  // Filter dogs by gender and search
  const availableDogs = dogs
    .filter(d => d.gender === (type === 'sire' ? 'male' : 'female'))
    .filter(d => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (type === 'sire') {
      await removeSireFromLitter(litterId)
    } else {
      await removeDamFromLitter(litterId)
    }
  }

  const handleSelectDog = async (dogId: string) => {
    setShowSelector(false)
    setSearchQuery('')
    if (type === 'sire') {
      await assignSireToLitter(dogId, litterId)
    } else {
      await assignDamToLitter(dogId, litterId)
    }
  }

  const handleSlotClick = () => {
    if (!isDogDragging && !currentDog && !customName) {
      setShowSelector(true)
    }
  }

  if (currentDog) {
    return (
      <div className="group relative">
        <DraggableTreeNode dog={currentDog} size="lg" />
        <button
          onClick={handleRemove}
          disabled={isSaving}
          className="absolute -top-1 -right-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
          title={`Remove ${type}`}
        >
          <X weight="bold" className="h-3 w-3" />
        </button>
      </div>
    )
  }

  if (customName) {
    return (
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'relative flex h-32 w-32 items-center justify-center rounded-full border-2 ring-2 ring-offset-2',
            type === 'sire' ? 'border-blue-200 bg-blue-50 ring-blue-400' : 'border-pink-200 bg-pink-50 ring-pink-400'
          )}
        >
          <div className="text-center px-2">
            {type === 'sire' ? (
              <GenderMale weight="bold" className="mx-auto h-6 w-6 text-blue-400 mb-1" />
            ) : (
              <GenderFemale weight="bold" className="mx-auto h-6 w-6 text-pink-400 mb-1" />
            )}
            <span className="text-xs font-medium text-neutral-600 line-clamp-2">{customName}</span>
          </div>
        </div>
        <div className="mt-2 flex flex-col items-center">
          <p className="text-sm font-medium text-neutral-700">{customName}</p>
          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded mt-0.5">External</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={selectorRef}>
      <div
        ref={setNodeRef}
        onClick={handleSlotClick}
        className={cn(
          'flex flex-col items-center transition-all duration-300 ease-out cursor-pointer',
          isOver && isValidDrop && 'scale-110',
          isDogDragging && !isOver && 'animate-pulse',
          showSelector && 'scale-105'
        )}
      >
        <div
          className={cn(
            'relative flex h-32 w-32 items-center justify-center rounded-full border-3 border-dashed transition-all duration-300 ease-out',
            type === 'sire' ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50' : 'border-pink-300 hover:border-pink-400 hover:bg-pink-50',
            isDogDragging && !isOver && (type === 'sire' ? 'border-blue-400 bg-blue-50/50' : 'border-pink-400 bg-pink-50/50'),
            isOver && isValidDrop && (type === 'sire' ? 'border-blue-500 bg-blue-100 shadow-lg shadow-blue-200' : 'border-pink-500 bg-pink-100 shadow-lg shadow-pink-200'),
            isOver && isInvalidDrop && 'border-red-500 bg-red-100 shadow-lg shadow-red-200',
            showSelector && (type === 'sire' ? 'border-blue-500 bg-blue-100 ring-4 ring-blue-200' : 'border-pink-500 bg-pink-100 ring-4 ring-pink-200')
          )}
        >
          {/* Animated ring when valid drop */}
          {isOver && isValidDrop && (
            <div className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-30',
              type === 'sire' ? 'bg-blue-400' : 'bg-pink-400'
            )} />
          )}
          <div className="text-center relative z-10">
            {type === 'sire' ? (
              <GenderMale weight="bold" className={cn(
                'mx-auto h-10 w-10 transition-all duration-200',
                isOver && isValidDrop && 'scale-125',
                isOver && isInvalidDrop ? 'text-red-400' : 'text-blue-400'
              )} />
            ) : (
              <GenderFemale weight="bold" className={cn(
                'mx-auto h-10 w-10 transition-all duration-200',
                isOver && isValidDrop && 'scale-125',
                isOver && isInvalidDrop ? 'text-red-400' : 'text-pink-400'
              )} />
            )}
            <Plus weight="bold" className={cn(
              'mx-auto h-5 w-5 mt-1 transition-transform duration-200',
              isOver && isValidDrop && 'rotate-180 scale-125',
              isOver && isInvalidDrop ? 'text-red-400' : 'text-neutral-400'
            )} />
          </div>
        </div>
        <p className={cn(
          'mt-2 text-sm font-medium transition-all duration-200 flex items-center gap-1',
          isOver && isValidDrop && 'font-bold scale-105',
          isOver && isInvalidDrop ? 'text-red-500' : isOver && isValidDrop ? (type === 'sire' ? 'text-blue-600' : 'text-pink-600') : 'text-neutral-500'
        )}>
          {isOver && isInvalidDrop
            ? `Need ${type === 'sire' ? 'male' : 'female'}`
            : isOver && isValidDrop
            ? 'Release to assign!'
            : (
              <>
                {`Add ${type === 'sire' ? 'Sire' : 'Dam'}`}
                <CaretDown weight="bold" className="h-3 w-3" />
              </>
            )}
        </p>
      </div>

      {/* Dog Selector Dropdown */}
      {showSelector && (
        <div className={cn(
          'absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl bg-white shadow-2xl border z-50 overflow-hidden',
          type === 'sire' ? 'border-blue-200' : 'border-pink-200'
        )}>
          {/* Search */}
          <div className="p-2 border-b border-neutral-100">
            <div className="relative">
              <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder={`Search ${type === 'sire' ? 'males' : 'females'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
            </div>
          </div>

          {/* Dogs List */}
          <div className="max-h-64 overflow-y-auto">
            {availableDogs.length > 0 ? (
              availableDogs.map(dog => (
                <button
                  key={dog.id}
                  onClick={() => handleSelectDog(dog.id)}
                  disabled={isSaving}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                    type === 'sire' ? 'hover:bg-blue-50' : 'hover:bg-pink-50',
                    'disabled:opacity-50'
                  )}
                >
                  <div className={cn(
                    'relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-offset-1 shrink-0',
                    type === 'sire' ? 'ring-blue-300' : 'ring-pink-300'
                  )}>
                    {dog.image_url ? (
                      <img src={dog.image_url} alt={dog.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className={cn(
                        'w-full h-full flex items-center justify-center',
                        type === 'sire' ? 'bg-blue-100' : 'bg-pink-100'
                      )}>
                        {type === 'sire' ? (
                          <GenderMale className="h-4 w-4 text-blue-400" />
                        ) : (
                          <GenderFemale className="h-4 w-4 text-pink-400" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{dog.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{dog.color}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-6 text-center text-sm text-neutral-500">
                {searchQuery ? `No ${type === 'sire' ? 'males' : 'females'} found` : `No ${type === 'sire' ? 'male' : 'female'} dogs available`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function DroppableLitter({ litter }: DroppableLitterProps) {
  const { setEditingLitter } = useFamilyTree()

  return (
    <div className="relative">
      {/* Parents Row */}
      <div className="flex items-center justify-center gap-8">
        <DropSlot
          type="sire"
          litterId={litter.id}
          currentDog={litter.sire}
          customName={litter.custom_sire_name}
        />

        {/* Connection Symbol */}
        <div className="flex flex-col items-center">
          <div className="w-px h-8 bg-amber-300" />
          <div className="w-16 h-px bg-amber-300" />
          <span className="text-amber-500 font-semibold text-lg">&times;</span>
          <div className="w-16 h-px bg-amber-300" />
          <div className="w-px h-8 bg-amber-300" />
        </div>

        <DropSlot
          type="dam"
          litterId={litter.id}
          currentDog={litter.dam}
          customName={litter.custom_dam_name}
        />
      </div>

      {/* Connection Line */}
      <div className="flex justify-center mt-4">
        <div className="w-px h-8 bg-amber-300" />
      </div>

      {/* Litter Info */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setEditingLitter(litter)}
          className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 mb-4 hover:bg-amber-100 transition-colors"
        >
          <span className="font-semibold text-amber-700">{litter.name}</span>
          {litter.puppies.length > 0 && (
            <span className="text-sm text-amber-500">
              ({litter.puppies.length} puppies)
            </span>
          )}
        </button>

        {/* Puppies */}
        {litter.puppies.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {litter.puppies.map((puppy) => (
              <PuppyNode key={puppy.id} puppy={puppy} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PuppyNode({ puppy }: { puppy: Puppy }) {
  const displayName = puppy.name || `${puppy.collar_color || 'No'} Collar`

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 overflow-hidden rounded-full ring-2 ring-offset-2 ring-neutral-200">
        {puppy.image_url ? (
          <img
            src={puppy.image_url}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-100">
            <span className="text-xl">pup</span>
          </div>
        )}
      </div>
      <p className="mt-1 text-xs font-medium text-neutral-700">{displayName}</p>
      <span className="text-xs text-neutral-400">
        {puppy.gender === 'male' ? 'M' : 'F'}
      </span>
    </div>
  )
}
