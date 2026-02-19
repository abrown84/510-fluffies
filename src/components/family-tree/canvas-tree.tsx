'use client'

import { useMemo } from 'react'
import { GenderMale, GenderFemale, Heart, Plus, PencilSimple } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Dog, DogWithLineage, Puppy } from '@/types/database'
import { type LitterWithRelations } from './family-tree-context'

interface CanvasTreeProps {
  dogs: Dog[]
  litters: LitterWithRelations[]
  dogsWithLineage?: DogWithLineage[]
  onEditDog?: (dog: Dog) => void
  onEditLitter?: (litter: LitterWithRelations) => void
  onAddParent?: (type: 'sire' | 'dam', litterId: string) => void
}

// Dog node with circular photo
function DogCircle({
  dog,
  size = 'md',
  onClick,
  label,
}: {
  dog: Dog
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  label?: string
}) {
  const isMale = dog.gender === 'male'
  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  }
  const ringSize = {
    sm: 'ring-2',
    md: 'ring-3',
    lg: 'ring-4',
  }

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={onClick}
        className={cn(
          'relative overflow-hidden rounded-full ring-offset-2 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg',
          sizeClasses[size],
          ringSize[size],
          isMale ? 'ring-sky-400' : 'ring-rose-400'
        )}
      >
        {dog.image_url ? (
          <img src={dog.image_url} alt={dog.name} className="h-full w-full object-cover" />
        ) : (
          <div className={cn('flex h-full w-full items-center justify-center', isMale ? 'bg-sky-50' : 'bg-rose-50')}>
            {isMale ? (
              <GenderMale weight="bold" className="h-6 w-6 text-sky-400" />
            ) : (
              <GenderFemale weight="bold" className="h-6 w-6 text-rose-400" />
            )}
          </div>
        )}
      </div>
      <p className="mt-1 text-sm font-semibold text-neutral-800">{dog.name}</p>
      {label && <p className={cn('text-xs', isMale ? 'text-sky-500' : 'text-rose-500')}>{label}</p>}
    </div>
  )
}

// Empty slot for adding a dog
function EmptyCircle({
  type,
  onClick,
}: {
  type: 'sire' | 'dam'
  onClick?: () => void
}) {
  const isMale = type === 'sire'

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        className={cn(
          'w-20 h-20 rounded-full border-3 border-dashed flex items-center justify-center transition-all hover:scale-105',
          isMale ? 'border-sky-300 hover:border-sky-400 hover:bg-sky-50' : 'border-rose-300 hover:border-rose-400 hover:bg-rose-50'
        )}
      >
        <Plus weight="bold" className="h-6 w-6 text-neutral-400" />
      </button>
      <p className={cn('mt-1 text-sm font-medium', isMale ? 'text-sky-500' : 'text-rose-500')}>
        Add {type === 'sire' ? 'Sire' : 'Dam'}
      </p>
    </div>
  )
}

// Custom parent (external dog not in system)
function ExternalDog({ name, type }: { name: string; type: 'sire' | 'dam' }) {
  const isMale = type === 'sire'

  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        'w-20 h-20 rounded-full ring-3 ring-offset-2 flex items-center justify-center',
        isMale ? 'ring-sky-400 bg-sky-50' : 'ring-rose-400 bg-rose-50'
      )}>
        {isMale ? (
          <GenderMale weight="bold" className="h-6 w-6 text-sky-400" />
        ) : (
          <GenderFemale weight="bold" className="h-6 w-6 text-rose-400" />
        )}
      </div>
      <p className="mt-1 text-sm font-semibold text-neutral-800">{name}</p>
      <p className="text-xs text-amber-600">External</p>
    </div>
  )
}

// Breeding pair with connecting lines
function BreedingPair({
  litter,
  allDogs,
  dogsWithLineage,
  onEditDog,
  onEditLitter,
  onAddParent,
}: {
  litter: LitterWithRelations
  allDogs: Dog[]
  dogsWithLineage?: DogWithLineage[]
  onEditDog?: (dog: Dog) => void
  onEditLitter?: (litter: LitterWithRelations) => void
  onAddParent?: (type: 'sire' | 'dam', litterId: string) => void
}) {
  // Find offspring dogs (dogs born from this breeding pair)
  const offspringDogs = allDogs.filter(dog => {
    if (!litter.sire_id && !litter.dam_id) return false
    const matchesSire = litter.sire_id ? dog.sire_id === litter.sire_id : !dog.sire_id
    const matchesDam = litter.dam_id ? dog.dam_id === litter.dam_id : !dog.dam_id
    return matchesSire && matchesDam && dog.id !== litter.sire_id && dog.id !== litter.dam_id
  })

  // Get lineage for parents
  const sireLineage = litter.sire ? dogsWithLineage?.find(d => d.id === litter.sire!.id) : null
  const damLineage = litter.dam ? dogsWithLineage?.find(d => d.id === litter.dam!.id) : null

  const hasChildren = litter.puppies.length > 0 || offspringDogs.length > 0
  const childCount = litter.puppies.length + offspringDogs.length

  return (
    <div className="flex flex-col items-center">
      {/* Grandparents (parents of sire and dam) */}
      <div className="flex gap-24 mb-2">
        {/* Sire's parents */}
        {(sireLineage?.sire || sireLineage?.dam) && (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              {sireLineage?.sire && (
                <DogCircle dog={sireLineage.sire} size="sm" onClick={() => onEditDog?.(sireLineage.sire!)} />
              )}
              {sireLineage?.sire && sireLineage?.dam && (
                <Heart weight="fill" className="h-3 w-3 text-sky-300 mx-1" />
              )}
              {sireLineage?.dam && (
                <DogCircle dog={sireLineage.dam} size="sm" onClick={() => onEditDog?.(sireLineage.dam!)} />
              )}
            </div>
            <div className="w-0.5 h-4 bg-neutral-300 mt-1" />
          </div>
        )}

        {/* Dam's parents */}
        {(damLineage?.sire || damLineage?.dam) && (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              {damLineage?.sire && (
                <DogCircle dog={damLineage.sire} size="sm" onClick={() => onEditDog?.(damLineage.sire!)} />
              )}
              {damLineage?.sire && damLineage?.dam && (
                <Heart weight="fill" className="h-3 w-3 text-sky-300 mx-1" />
              )}
              {damLineage?.dam && (
                <DogCircle dog={damLineage.dam} size="sm" onClick={() => onEditDog?.(damLineage.dam!)} />
              )}
            </div>
            <div className="w-0.5 h-4 bg-neutral-300 mt-1" />
          </div>
        )}
      </div>

      {/* Parents (Sire + Dam) */}
      <div className="flex items-center">
        {/* Sire */}
        {litter.sire ? (
          <DogCircle dog={litter.sire} size="lg" onClick={() => onEditDog?.(litter.sire!)} />
        ) : litter.custom_sire_name ? (
          <ExternalDog name={litter.custom_sire_name} type="sire" />
        ) : (
          <EmptyCircle type="sire" onClick={() => onAddParent?.('sire', litter.id)} />
        )}

        {/* Heart connector */}
        <div className="flex items-center mx-4">
          <div className="w-6 h-0.5 bg-neutral-300" />
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shadow-sm">
            <Heart weight="fill" className="h-4 w-4 text-rose-400" />
          </div>
          <div className="w-6 h-0.5 bg-neutral-300" />
        </div>

        {/* Dam */}
        {litter.dam ? (
          <DogCircle dog={litter.dam} size="lg" onClick={() => onEditDog?.(litter.dam!)} />
        ) : litter.custom_dam_name ? (
          <ExternalDog name={litter.custom_dam_name} type="dam" />
        ) : (
          <EmptyCircle type="dam" onClick={() => onAddParent?.('dam', litter.id)} />
        )}
      </div>

      {/* Vertical connector to litter */}
      <div className="w-0.5 h-6 bg-neutral-300" />

      {/* Litter badge */}
      <button
        onClick={() => onEditLitter?.(litter)}
        className="px-4 py-2 rounded-full bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-2"
      >
        <span className="font-semibold text-amber-800">{litter.name}</span>
        {hasChildren && (
          <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{childCount}</span>
        )}
      </button>

      {/* Children section */}
      {hasChildren && (
        <>
          {/* Vertical line down */}
          <div className="w-0.5 h-4 bg-neutral-300" />

          {/* Horizontal branch */}
          <div className="relative flex justify-center">
            <div
              className="h-0.5 bg-neutral-300"
              style={{ width: Math.max(childCount * 80, 80) }}
            />
            {/* Drop lines for each child */}
            <div className="absolute top-0 left-0 right-0 flex justify-around">
              {[...offspringDogs, ...litter.puppies].map((_, i) => (
                <div key={i} className="w-0.5 h-4 bg-neutral-300" />
              ))}
            </div>
          </div>

          {/* Children */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {/* Offspring dogs */}
            {offspringDogs.map(dog => (
              <DogCircle key={dog.id} dog={dog} size="md" onClick={() => onEditDog?.(dog)} />
            ))}

            {/* Puppies */}
            {litter.puppies.map(puppy => (
              <PuppyCircle key={puppy.id} puppy={puppy} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Puppy node
function PuppyCircle({ puppy }: { puppy: Puppy }) {
  const displayName = puppy.name || `${puppy.collar_color || 'No'} Collar`
  const isMale = puppy.gender === 'male'

  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        'w-16 h-16 rounded-full ring-2 ring-offset-1 overflow-hidden',
        isMale ? 'ring-sky-300' : 'ring-rose-300'
      )}>
        {puppy.image_url ? (
          <img src={puppy.image_url} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <div className={cn('flex h-full w-full items-center justify-center', isMale ? 'bg-sky-50' : 'bg-rose-50')}>
            {isMale ? (
              <GenderMale weight="bold" className="h-4 w-4 text-sky-400" />
            ) : (
              <GenderFemale weight="bold" className="h-4 w-4 text-rose-400" />
            )}
          </div>
        )}
      </div>
      <p className="mt-1 text-xs font-medium text-neutral-700">{displayName}</p>
    </div>
  )
}

export function CanvasTree({
  dogs,
  litters,
  dogsWithLineage,
  onEditDog,
  onEditLitter,
  onAddParent,
}: CanvasTreeProps) {
  // Sort litters by date to show chronological order
  const sortedLitters = useMemo(() => {
    return [...litters].sort((a, b) => {
      const dateA = a.date_of_birth || a.expected_date || a.created_at
      const dateB = b.date_of_birth || b.expected_date || b.created_at
      return new Date(dateA).getTime() - new Date(dateB).getTime()
    })
  }, [litters])

  if (litters.length === 0) {
    return null
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-fit p-8">
        {/* Canvas with all breeding pairs */}
        <div className="flex flex-wrap justify-center gap-12">
          {sortedLitters.map((litter) => (
            <BreedingPair
              key={litter.id}
              litter={litter}
              allDogs={dogs}
              dogsWithLineage={dogsWithLineage}
              onEditDog={onEditDog}
              onEditLitter={onEditLitter}
              onAddParent={onAddParent}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
