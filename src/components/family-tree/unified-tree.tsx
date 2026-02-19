'use client'

import { useMemo } from 'react'
import { GenderMale, GenderFemale, Heart, Plus } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Dog, DogWithLineage, Puppy } from '@/types/database'
import { type LitterWithRelations } from './family-tree-context'

interface UnifiedTreeProps {
  dogs: Dog[]
  litters: LitterWithRelations[]
  dogsWithLineage?: DogWithLineage[]
  onEditDog?: (dog: Dog) => void
  onEditLitter?: (litter: LitterWithRelations) => void
  onAddParent?: (type: 'sire' | 'dam', litterId: string) => void
}

interface FamilyNode {
  dog: Dog
  partnersAndLitters: Array<{
    partner: Dog | null
    customPartnerName: string | null
    litter: LitterWithRelations
    children: FamilyNode[]
    puppies: Puppy[]
  }>
}

// Dog node with circular photo
function DogCircle({
  dog,
  size = 'md',
  onClick,
  showLabel = true,
}: {
  dog: Dog
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  showLabel?: boolean
}) {
  const isMale = dog.gender === 'male'
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }
  const ringSize = {
    sm: 'ring-2',
    md: 'ring-2',
    lg: 'ring-3',
  }
  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm',
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
              <GenderMale weight="bold" className="h-5 w-5 text-sky-400" />
            ) : (
              <GenderFemale weight="bold" className="h-5 w-5 text-rose-400" />
            )}
          </div>
        )}
      </div>
      {showLabel && (
        <p className={cn('mt-1 font-semibold text-neutral-800', textSize[size])}>{dog.name}</p>
      )}
    </div>
  )
}

// Empty slot for adding a dog
function EmptyCircle({
  type,
  onClick,
  size = 'md',
}: {
  type: 'sire' | 'dam'
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}) {
  const isMale = type === 'sire'
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        className={cn(
          'rounded-full border-2 border-dashed flex items-center justify-center transition-all hover:scale-105',
          sizeClasses[size],
          isMale ? 'border-sky-300 hover:border-sky-400 hover:bg-sky-50' : 'border-rose-300 hover:border-rose-400 hover:bg-rose-50'
        )}
      >
        <Plus weight="bold" className="h-4 w-4 text-neutral-400" />
      </button>
      <p className={cn('mt-1 text-xs font-medium', isMale ? 'text-sky-500' : 'text-rose-500')}>
        Add {type === 'sire' ? 'Sire' : 'Dam'}
      </p>
    </div>
  )
}

// External dog (custom name)
function ExternalDog({ name, type, size = 'md' }: { name: string; type: 'sire' | 'dam'; size?: 'sm' | 'md' | 'lg' }) {
  const isMale = type === 'sire'
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        'rounded-full ring-2 ring-offset-2 flex items-center justify-center',
        sizeClasses[size],
        isMale ? 'ring-sky-400 bg-sky-50' : 'ring-rose-400 bg-rose-50'
      )}>
        {isMale ? (
          <GenderMale weight="bold" className="h-5 w-5 text-sky-400" />
        ) : (
          <GenderFemale weight="bold" className="h-5 w-5 text-rose-400" />
        )}
      </div>
      <p className="mt-1 text-sm font-semibold text-neutral-800">{name}</p>
      <p className="text-xs text-amber-600">External</p>
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
        'w-12 h-12 rounded-full ring-2 ring-offset-1 overflow-hidden',
        isMale ? 'ring-sky-300' : 'ring-rose-300'
      )}>
        {puppy.image_url ? (
          <img src={puppy.image_url} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <div className={cn('flex h-full w-full items-center justify-center', isMale ? 'bg-sky-50' : 'bg-rose-50')}>
            {isMale ? (
              <GenderMale weight="bold" className="h-3 w-3 text-sky-400" />
            ) : (
              <GenderFemale weight="bold" className="h-3 w-3 text-rose-400" />
            )}
          </div>
        )}
      </div>
      <p className="mt-1 text-xs font-medium text-neutral-700">{displayName}</p>
    </div>
  )
}

// Breeding pair connector
function BreedingConnector() {
  return (
    <div className="flex items-center mx-2">
      <div className="w-4 h-0.5 bg-neutral-300" />
      <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shadow-sm">
        <Heart weight="fill" className="h-3 w-3 text-rose-400" />
      </div>
      <div className="w-4 h-0.5 bg-neutral-300" />
    </div>
  )
}

// A breeding pair with their litter
function BreedingUnit({
  sire,
  dam,
  customSireName,
  customDamName,
  litter,
  childNodes,
  puppies,
  onEditDog,
  onEditLitter,
  onAddParent,
  allDogs,
  allLitters,
  processedDogIds,
}: {
  sire: Dog | null
  dam: Dog | null
  customSireName: string | null
  customDamName: string | null
  litter: LitterWithRelations
  childNodes: FamilyNode[]
  puppies: Puppy[]
  onEditDog?: (dog: Dog) => void
  onEditLitter?: (litter: LitterWithRelations) => void
  onAddParent?: (type: 'sire' | 'dam', litterId: string) => void
  allDogs: Dog[]
  allLitters: LitterWithRelations[]
  processedDogIds: Set<string>
}) {
  const hasChildren = childNodes.length > 0 || puppies.length > 0

  return (
    <div className="flex flex-col items-center">
      {/* Parents row */}
      <div className="flex items-center">
        {/* Sire */}
        {sire ? (
          <DogCircle dog={sire} size="lg" onClick={() => onEditDog?.(sire)} />
        ) : customSireName ? (
          <ExternalDog name={customSireName} type="sire" size="lg" />
        ) : (
          <EmptyCircle type="sire" size="lg" onClick={() => onAddParent?.('sire', litter.id)} />
        )}

        <BreedingConnector />

        {/* Dam */}
        {dam ? (
          <DogCircle dog={dam} size="lg" onClick={() => onEditDog?.(dam)} />
        ) : customDamName ? (
          <ExternalDog name={customDamName} type="dam" size="lg" />
        ) : (
          <EmptyCircle type="dam" size="lg" onClick={() => onAddParent?.('dam', litter.id)} />
        )}
      </div>

      {/* Connector to litter */}
      <div className="w-0.5 h-4 bg-neutral-300" />

      {/* Litter badge */}
      <button
        onClick={() => onEditLitter?.(litter)}
        className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors text-sm"
      >
        <span className="font-semibold text-amber-800">{litter.name}</span>
        {hasChildren && (
          <span className="ml-1.5 text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">
            {childNodes.length + puppies.length}
          </span>
        )}
      </button>

      {/* Children */}
      {hasChildren && (
        <>
          <div className="w-0.5 h-4 bg-neutral-300" />

          {/* Horizontal branch line */}
          {(childNodes.length + puppies.length) > 1 && (
            <div className="relative">
              <div
                className="h-0.5 bg-neutral-300"
                style={{ width: Math.max((childNodes.length + puppies.length) * 100, 100) }}
              />
            </div>
          )}

          {/* Children grid */}
          <div className="flex flex-wrap justify-center gap-6 mt-2">
            {/* Puppies (young, not yet in dogs table) */}
            {puppies.map(puppy => (
              <div key={puppy.id} className="flex flex-col items-center">
                <div className="w-0.5 h-3 bg-neutral-300" />
                <PuppyCircle puppy={puppy} />
              </div>
            ))}

            {/* Child dogs with their own families */}
            {childNodes.map(childNode => (
              <FamilyBranch
                key={childNode.dog.id}
                node={childNode}
                onEditDog={onEditDog}
                onEditLitter={onEditLitter}
                onAddParent={onAddParent}
                allDogs={allDogs}
                allLitters={allLitters}
                processedDogIds={processedDogIds}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// A single dog and their breeding partnerships
function FamilyBranch({
  node,
  onEditDog,
  onEditLitter,
  onAddParent,
  allDogs,
  allLitters,
  processedDogIds,
}: {
  node: FamilyNode
  onEditDog?: (dog: Dog) => void
  onEditLitter?: (litter: LitterWithRelations) => void
  onAddParent?: (type: 'sire' | 'dam', litterId: string) => void
  allDogs: Dog[]
  allLitters: LitterWithRelations[]
  processedDogIds: Set<string>
}) {
  const { dog, partnersAndLitters } = node

  // If this dog has no litters as a parent, just show them as a child
  if (partnersAndLitters.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-0.5 h-3 bg-neutral-300" />
        <DogCircle dog={dog} size="md" onClick={() => onEditDog?.(dog)} />
      </div>
    )
  }

  // Dog has litters - show them with their breeding partnerships
  return (
    <div className="flex flex-col items-center">
      <div className="w-0.5 h-3 bg-neutral-300" />

      {/* Show the dog */}
      <DogCircle dog={dog} size="md" onClick={() => onEditDog?.(dog)} />

      {/* Show their litters */}
      {partnersAndLitters.map(({ partner, customPartnerName, litter, children, puppies }) => (
        <div key={litter.id} className="mt-4">
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 h-0.5 bg-neutral-300" />
            <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center">
              <Heart weight="fill" className="h-2.5 w-2.5 text-rose-400" />
            </div>
            <div className="w-4 h-0.5 bg-neutral-300" />
            {partner ? (
              <DogCircle dog={partner} size="sm" onClick={() => onEditDog?.(partner)} />
            ) : customPartnerName ? (
              <ExternalDog name={customPartnerName} type={dog.gender === 'male' ? 'dam' : 'sire'} size="sm" />
            ) : (
              <EmptyCircle
                type={dog.gender === 'male' ? 'dam' : 'sire'}
                size="sm"
                onClick={() => onAddParent?.(dog.gender === 'male' ? 'dam' : 'sire', litter.id)}
              />
            )}
          </div>

          <div className="w-0.5 h-3 bg-neutral-300 mx-auto" />

          {/* Litter badge */}
          <button
            onClick={() => onEditLitter?.(litter)}
            className="px-2 py-1 rounded-full bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors text-xs"
          >
            <span className="font-semibold text-amber-800">{litter.name}</span>
          </button>

          {/* Children of this litter */}
          {(children.length > 0 || puppies.length > 0) && (
            <>
              <div className="w-0.5 h-3 bg-neutral-300 mx-auto" />
              <div className="flex flex-wrap justify-center gap-4">
                {puppies.map(puppy => (
                  <PuppyCircle key={puppy.id} puppy={puppy} />
                ))}
                {children.map(childNode => (
                  <FamilyBranch
                    key={childNode.dog.id}
                    node={childNode}
                    onEditDog={onEditDog}
                    onEditLitter={onEditLitter}
                    onAddParent={onAddParent}
                    allDogs={allDogs}
                    allLitters={allLitters}
                    processedDogIds={processedDogIds}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

export function UnifiedTree({
  dogs,
  litters,
  dogsWithLineage,
  onEditDog,
  onEditLitter,
  onAddParent,
}: UnifiedTreeProps) {
  // Build the family tree structure
  const { rootLitters, orphanLitters } = useMemo(() => {
    // Map dog IDs to their dogs
    const dogMap = new Map(dogs.map(d => [d.id, d]))

    // Find litters where at least one parent is a "founder" (has no known parents)
    const dogIdsWithParents = new Set<string>()
    dogs.forEach(dog => {
      if (dog.sire_id) dogIdsWithParents.add(dog.id)
      if (dog.dam_id) dogIdsWithParents.add(dog.id)
    })

    // A litter is a "root" litter if neither parent has known parents in our system
    // OR if the litter has no assigned parents yet
    const rootLitters: LitterWithRelations[] = []
    const nonRootLitters: LitterWithRelations[] = []
    const orphanLitters: LitterWithRelations[] = []

    litters.forEach(litter => {
      const sire = litter.sire
      const dam = litter.dam

      // If no parents assigned, it's an orphan
      if (!sire && !dam && !litter.custom_sire_name && !litter.custom_dam_name) {
        orphanLitters.push(litter)
        return
      }

      // Check if parents have their own parents
      const sireHasParents = sire && (sire.sire_id || sire.dam_id)
      const damHasParents = dam && (dam.sire_id || dam.dam_id)

      if (!sireHasParents && !damHasParents) {
        rootLitters.push(litter)
      } else {
        nonRootLitters.push(litter)
      }
    })

    return { rootLitters, nonRootLitters, orphanLitters }
  }, [dogs, litters])

  // Build family nodes for each litter
  const buildFamilyNodes = useMemo(() => {
    const dogMap = new Map(dogs.map(d => [d.id, d]))
    const processedDogIds = new Set<string>()

    // Find children of a litter (dogs whose sire_id and dam_id match the litter's parents)
    const getChildrenOfLitter = (litter: LitterWithRelations): Dog[] => {
      return dogs.filter(dog => {
        if (dog.id === litter.sire_id || dog.id === litter.dam_id) return false

        // Match based on litter's assigned parents
        const matchesSire = litter.sire_id
          ? dog.sire_id === litter.sire_id
          : !dog.sire_id
        const matchesDam = litter.dam_id
          ? dog.dam_id === litter.dam_id
          : !dog.dam_id

        // Need at least one parent to match and not be an orphan match
        return (litter.sire_id || litter.dam_id) && matchesSire && matchesDam
      })
    }

    // Find litters where a dog is a parent
    const getLittersAsParent = (dogId: string): LitterWithRelations[] => {
      return litters.filter(l => l.sire_id === dogId || l.dam_id === dogId)
    }

    // Build node for a dog
    const buildNode = (dog: Dog, depth: number = 0): FamilyNode => {
      if (depth > 10) {
        return { dog, partnersAndLitters: [] }
      }

      const littersAsParent = getLittersAsParent(dog.id)

      const partnersAndLitters = littersAsParent.map(litter => {
        const partner = dog.gender === 'male' ? litter.dam : litter.sire
        const customPartnerName = dog.gender === 'male' ? litter.custom_dam_name : litter.custom_sire_name
        const childDogs = getChildrenOfLitter(litter)

        // Recursively build nodes for children, avoiding cycles
        const children = childDogs
          .filter(child => !processedDogIds.has(child.id))
          .map(child => {
            processedDogIds.add(child.id)
            return buildNode(child, depth + 1)
          })

        return {
          partner,
          customPartnerName,
          litter,
          children,
          puppies: litter.puppies,
        }
      })

      return { dog, partnersAndLitters }
    }

    return { getChildrenOfLitter, buildNode, processedDogIds }
  }, [dogs, litters])

  if (litters.length === 0) {
    return null
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-fit p-6">
        {/* Main family trees - root litters with their descendants */}
        <div className="flex flex-wrap justify-center gap-16">
          {rootLitters.map((litter) => {
            const childDogs = buildFamilyNodes.getChildrenOfLitter(litter)
            const processedDogIds = new Set<string>()

            // Mark parents as processed
            if (litter.sire_id) processedDogIds.add(litter.sire_id)
            if (litter.dam_id) processedDogIds.add(litter.dam_id)

            // Build child nodes
            const childNodes = childDogs.map(child => {
              processedDogIds.add(child.id)
              return buildFamilyNodes.buildNode(child, 0)
            })

            return (
              <BreedingUnit
                key={litter.id}
                sire={litter.sire}
                dam={litter.dam}
                customSireName={litter.custom_sire_name}
                customDamName={litter.custom_dam_name}
                litter={litter}
                childNodes={childNodes}
                puppies={litter.puppies}
                onEditDog={onEditDog}
                onEditLitter={onEditLitter}
                onAddParent={onAddParent}
                allDogs={dogs}
                allLitters={litters}
                processedDogIds={processedDogIds}
              />
            )
          })}
        </div>

        {/* Orphan litters (no parents assigned) */}
        {orphanLitters.length > 0 && (
          <div className="mt-12 pt-8 border-t border-dashed border-neutral-300">
            <p className="text-center text-sm text-neutral-500 mb-6">
              Litters without parents assigned:
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              {orphanLitters.map((litter) => (
                <BreedingUnit
                  key={litter.id}
                  sire={null}
                  dam={null}
                  customSireName={litter.custom_sire_name}
                  customDamName={litter.custom_dam_name}
                  litter={litter}
                  childNodes={[]}
                  puppies={litter.puppies}
                  onEditDog={onEditDog}
                  onEditLitter={onEditLitter}
                  onAddParent={onAddParent}
                  allDogs={dogs}
                  allLitters={litters}
                  processedDogIds={new Set()}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
