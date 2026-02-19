'use client'

import { useMemo } from 'react'
import { GenderMale, GenderFemale, Heart, Plus, PencilSimple, Users, Baby, Dog as DogIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Dog, DogWithLineage, Puppy } from '@/types/database'
import { type LitterWithRelations } from './family-tree-context'

interface ComprehensiveTreeProps {
  dogs: Dog[]
  litters: LitterWithRelations[]
  dogsWithLineage?: DogWithLineage[]
  onEditDog?: (dog: Dog) => void
  onEditLitter?: (litter: LitterWithRelations) => void
  onAddParent?: (type: 'sire' | 'dam', litterId: string) => void
}

// Get all relationships for a dog
function getDogRelationships(dog: Dog, dogs: Dog[], litters: LitterWithRelations[], dogsWithLineage?: DogWithLineage[]) {
  const lineage = dogsWithLineage?.find(d => d.id === dog.id)

  // Parents
  const sire = lineage?.sire || null
  const dam = lineage?.dam || null

  // Find siblings (dogs with same parents)
  const siblings = dogs.filter(d =>
    d.id !== dog.id &&
    ((dog.sire_id && d.sire_id === dog.sire_id) || (dog.dam_id && d.dam_id === dog.dam_id))
  )

  // Find litters where this dog is a parent
  const litterAsParent = litters.filter(l =>
    l.sire_id === dog.id || l.dam_id === dog.id
  )

  // Find partners (dogs they've bred with)
  const partners: Dog[] = []
  litterAsParent.forEach(l => {
    if (l.sire_id === dog.id && l.dam) {
      if (!partners.find(p => p.id === l.dam!.id)) {
        partners.push(l.dam)
      }
    }
    if (l.dam_id === dog.id && l.sire) {
      if (!partners.find(p => p.id === l.sire!.id)) {
        partners.push(l.sire)
      }
    }
  })

  // Get all children (puppies from litters)
  const children = litterAsParent.flatMap(l => l.puppies)

  return { sire, dam, siblings, partners, litterAsParent, children }
}

// Dog node component
function DogNode({
  dog,
  size = 'md',
  onClick,
  showName = true,
  showRole,
}: {
  dog: Dog
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  showName?: boolean
  showRole?: string
}) {
  const isMale = dog.gender === 'male'
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  }
  const ringSize = {
    sm: 'ring-2',
    md: 'ring-3',
    lg: 'ring-4',
  }

  return (
    <div className="flex flex-col items-center group">
      <div
        onClick={onClick}
        className={cn(
          'relative overflow-hidden rounded-full ring-offset-2 transition-all duration-200',
          onClick && 'cursor-pointer hover:scale-105 hover:shadow-lg',
          sizeClasses[size],
          ringSize[size],
          isMale ? 'ring-sky-400' : 'ring-rose-400'
        )}
      >
        {dog.image_url ? (
          <img
            src={dog.image_url}
            alt={dog.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={cn(
            'flex h-full w-full items-center justify-center',
            isMale ? 'bg-sky-50' : 'bg-rose-50'
          )}>
            {isMale ? (
              <GenderMale weight="bold" className={cn(
                size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8',
                'text-sky-400'
              )} />
            ) : (
              <GenderFemale weight="bold" className={cn(
                size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8',
                'text-rose-400'
              )} />
            )}
          </div>
        )}
        {onClick && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <PencilSimple weight="bold" className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
      {showName && (
        <div className="mt-1.5 text-center">
          <p className={cn(
            'font-semibold text-neutral-800 group-hover:text-amber-600 transition-colors',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            {dog.name}
          </p>
          {showRole && (
            <p className={cn(
              'text-xs',
              isMale ? 'text-sky-500' : 'text-rose-500'
            )}>
              {showRole}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Empty slot for adding parent
function EmptySlot({
  type,
  onAdd,
  size = 'md'
}: {
  type: 'sire' | 'dam'
  onAdd?: () => void
  size?: 'sm' | 'md' | 'lg'
}) {
  const isMale = type === 'sire'
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onAdd}
        className={cn(
          'rounded-full border-3 border-dashed transition-all duration-200 hover:scale-105 flex items-center justify-center',
          sizeClasses[size],
          isMale ? 'border-sky-300 hover:border-sky-400 hover:bg-sky-50' : 'border-rose-300 hover:border-rose-400 hover:bg-rose-50'
        )}
      >
        <Plus weight="bold" className={cn(
          'text-neutral-400',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
        )} />
      </button>
      <p className={cn(
        'mt-1.5 font-medium',
        size === 'sm' ? 'text-xs' : 'text-sm',
        isMale ? 'text-sky-500' : 'text-rose-500'
      )}>
        Add {type === 'sire' ? 'Sire' : 'Dam'}
      </p>
    </div>
  )
}

// Heart connector between breeding pair
function HeartConnector({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <div className="flex items-center mx-2">
      <div className={cn('bg-neutral-300', size === 'sm' ? 'w-3 h-0.5' : 'w-4 h-0.5')} />
      <div className={cn(
        'flex items-center justify-center rounded-full bg-sky-100 shadow-sm',
        size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'
      )}>
        <Heart weight="fill" className={cn('text-sky-400', size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5')} />
      </div>
      <div className={cn('bg-neutral-300', size === 'sm' ? 'w-3 h-0.5' : 'w-4 h-0.5')} />
    </div>
  )
}

// Family unit showing a breeding pair and their litters
function FamilyUnit({
  litter,
  dogs,
  litters,
  dogsWithLineage,
  onEditDog,
  onEditLitter,
  onAddParent,
}: {
  litter: LitterWithRelations
  dogs: Dog[]
  litters: LitterWithRelations[]
  dogsWithLineage?: DogWithLineage[]
  onEditDog?: (dog: Dog) => void
  onEditLitter?: (litter: LitterWithRelations) => void
  onAddParent?: (type: 'sire' | 'dam', litterId: string) => void
}) {
  // Get lineage for sire and dam
  const sireLineage = litter.sire ? dogsWithLineage?.find(d => d.id === litter.sire!.id) : null
  const damLineage = litter.dam ? dogsWithLineage?.find(d => d.id === litter.dam!.id) : null

  // Find dogs that were born from this litter (grown up puppies)
  // These are dogs whose sire_id and dam_id match this litter's parents
  const offspringDogs = dogs.filter(dog => {
    if (!litter.sire_id && !litter.dam_id) return false
    // Match dogs that have the same parents as this litter
    const matchesSire = litter.sire_id ? dog.sire_id === litter.sire_id : true
    const matchesDam = litter.dam_id ? dog.dam_id === litter.dam_id : true
    // Must match at least one parent and not be the parent themselves
    return (matchesSire && matchesDam) &&
           (litter.sire_id || litter.dam_id) &&
           dog.id !== litter.sire_id &&
           dog.id !== litter.dam_id
  })

  const hasPuppies = litter.puppies.length > 0
  const hasOffspring = offspringDogs.length > 0
  const hasChildren = hasPuppies || hasOffspring

  const hasGrandparents = (sireLineage?.sire || sireLineage?.dam) || (damLineage?.sire || damLineage?.dam)

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-neutral-100">
      {/* Grandparents Row (Parents of the sire/dam) */}
      {hasGrandparents && (
        <>
          <div className="flex justify-center gap-16">
            {/* Sire's Parents */}
            {(sireLineage?.sire || sireLineage?.dam) && (
              <div className="flex flex-col items-center">
                <div className="flex items-end gap-1">
                  {sireLineage?.sire && (
                    <DogNode dog={sireLineage.sire} size="sm" onClick={() => onEditDog?.(sireLineage.sire!)} />
                  )}
                  {sireLineage?.sire && sireLineage?.dam && <HeartConnector size="sm" />}
                  {sireLineage?.dam && (
                    <DogNode dog={sireLineage.dam} size="sm" onClick={() => onEditDog?.(sireLineage.dam!)} />
                  )}
                </div>
              </div>
            )}

            {/* Dam's Parents */}
            {(damLineage?.sire || damLineage?.dam) && (
              <div className="flex flex-col items-center">
                <div className="flex items-end gap-1">
                  {damLineage?.sire && (
                    <DogNode dog={damLineage.sire} size="sm" onClick={() => onEditDog?.(damLineage.sire!)} />
                  )}
                  {damLineage?.sire && damLineage?.dam && <HeartConnector size="sm" />}
                  {damLineage?.dam && (
                    <DogNode dog={damLineage.dam} size="sm" onClick={() => onEditDog?.(damLineage.dam!)} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Connector lines from grandparents to parents */}
          <svg className="w-full h-8" preserveAspectRatio="none">
            <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#d4d4d4" strokeWidth="2" />
            <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#d4d4d4" strokeWidth="2" />
          </svg>
        </>
      )}

      {/* Parents Row */}
      <div className="flex items-end">
        {/* Sire */}
        {litter.sire ? (
          <DogNode
            dog={litter.sire}
            size="lg"
            onClick={() => onEditDog?.(litter.sire!)}
            showRole="Sire"
          />
        ) : litter.custom_sire_name ? (
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full ring-4 ring-offset-2 ring-sky-400 bg-sky-50 flex items-center justify-center">
              <GenderMale weight="bold" className="h-8 w-8 text-sky-400" />
            </div>
            <p className="mt-1.5 text-sm font-semibold text-neutral-800">{litter.custom_sire_name}</p>
            <p className="text-xs text-amber-600">External</p>
          </div>
        ) : (
          <EmptySlot type="sire" size="lg" onAdd={() => onAddParent?.('sire', litter.id)} />
        )}

        <HeartConnector />

        {/* Dam */}
        {litter.dam ? (
          <DogNode
            dog={litter.dam}
            size="lg"
            onClick={() => onEditDog?.(litter.dam!)}
            showRole="Dam"
          />
        ) : litter.custom_dam_name ? (
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full ring-4 ring-offset-2 ring-rose-400 bg-rose-50 flex items-center justify-center">
              <GenderFemale weight="bold" className="h-8 w-8 text-rose-400" />
            </div>
            <p className="mt-1.5 text-sm font-semibold text-neutral-800">{litter.custom_dam_name}</p>
            <p className="text-xs text-amber-600">External</p>
          </div>
        ) : (
          <EmptySlot type="dam" size="lg" onAdd={() => onAddParent?.('dam', litter.id)} />
        )}
      </div>

      {/* Connector to litter */}
      <div className="w-0.5 h-5 bg-neutral-300 my-2" />

      {/* Litter Badge */}
      <button
        onClick={() => onEditLitter?.(litter)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
      >
        <Baby weight="bold" className="h-4 w-4 text-amber-600" />
        <span className="font-semibold text-amber-800">{litter.name}</span>
        {hasChildren && (
          <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
            {offspringDogs.length + litter.puppies.length}
          </span>
        )}
      </button>

      {/* Children (Offspring Dogs + Puppies) */}
      {hasChildren && (
        <>
          <div className="w-0.5 h-4 bg-neutral-300 my-2" />

          {/* Branch line */}
          <div className="relative">
            <div
              className="h-0.5 bg-neutral-300"
              style={{ width: `${Math.max((offspringDogs.length + litter.puppies.length) * 70, 60)}px` }}
            />
          </div>

          {/* Children Row - Dogs first (grown up), then Puppies */}
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            {/* Offspring Dogs (grown up children) */}
            {offspringDogs.map((dog) => (
              <div key={dog.id} className="flex flex-col items-center">
                <div className="w-0.5 h-3 bg-neutral-300" />
                <DogNode
                  dog={dog}
                  size="md"
                  onClick={() => onEditDog?.(dog)}
                />
              </div>
            ))}

            {/* Puppies (young children) */}
            {litter.puppies.map((puppy) => (
              <PuppyNode key={puppy.id} puppy={puppy} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Puppy node
function PuppyNode({ puppy }: { puppy: Puppy }) {
  const displayName = puppy.name || `${puppy.collar_color || 'No'} Collar`
  const isMale = puppy.gender === 'male'

  return (
    <div className="flex flex-col items-center">
      {/* Connector */}
      <div className="w-0.5 h-3 bg-neutral-300" />

      <div
        className={cn(
          'relative overflow-hidden rounded-full ring-2 ring-offset-1 w-14 h-14',
          isMale ? 'ring-sky-300' : 'ring-rose-300'
        )}
      >
        {puppy.image_url ? (
          <img
            src={puppy.image_url}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={cn(
            'flex h-full w-full items-center justify-center',
            isMale ? 'bg-sky-50' : 'bg-rose-50'
          )}>
            {isMale ? (
              <GenderMale weight="bold" className="h-4 w-4 text-sky-400" />
            ) : (
              <GenderFemale weight="bold" className="h-4 w-4 text-rose-400" />
            )}
          </div>
        )}
      </div>
      <p className="mt-1 text-xs font-medium text-neutral-700 max-w-[60px] truncate text-center">
        {displayName}
      </p>
      <p className={cn('text-[10px]', isMale ? 'text-sky-500' : 'text-rose-500')}>
        {isMale ? 'Male' : 'Female'}
      </p>
    </div>
  )
}

// Siblings section
function SiblingsSection({ siblings, onEditDog }: { siblings: Dog[], onEditDog?: (dog: Dog) => void }) {
  if (siblings.length === 0) return null

  return (
    <div className="mt-4 p-4 bg-neutral-50 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Users weight="bold" className="h-4 w-4 text-neutral-500" />
        <h4 className="text-sm font-semibold text-neutral-700">Siblings ({siblings.length})</h4>
      </div>
      <div className="flex flex-wrap gap-3">
        {siblings.map(sibling => (
          <DogNode key={sibling.id} dog={sibling} size="sm" onClick={() => onEditDog?.(sibling)} />
        ))}
      </div>
    </div>
  )
}

export function ComprehensiveTree({
  dogs,
  litters,
  dogsWithLineage,
  onEditDog,
  onEditLitter,
  onAddParent,
}: ComprehensiveTreeProps) {
  if (litters.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-8">
        {litters.map((litter) => (
          <FamilyUnit
            key={litter.id}
            litter={litter}
            dogs={dogs}
            litters={litters}
            dogsWithLineage={dogsWithLineage}
            onEditDog={onEditDog}
            onEditLitter={onEditLitter}
            onAddParent={onAddParent}
          />
        ))}
      </div>
    </div>
  )
}
