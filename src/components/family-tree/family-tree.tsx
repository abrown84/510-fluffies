'use client'

import { GenderMale, GenderFemale, Heart } from '@phosphor-icons/react'
import { TreeNode } from './tree-node'
import { cn } from '@/lib/utils'
import type { Dog, DogWithLineage, Litter, Puppy } from '@/types/database'

interface LitterWithRelations extends Litter {
  sire: Dog | null
  dam: Dog | null
  puppies: Puppy[]
}

interface FamilyTreeProps {
  dogs: Dog[]
  litters: LitterWithRelations[]
  dogsWithLineage?: DogWithLineage[]
}

// Tree connector component with animated gradient lines
function TreeConnector({ direction = 'vertical', className }: { direction?: 'vertical' | 'horizontal'; className?: string }) {
  return (
    <div
      className={cn(
        'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300 rounded-full',
        direction === 'vertical' ? 'w-1 h-full' : 'h-1 w-full',
        className
      )}
    />
  )
}

function ParentLineage({ dog, dogsWithLineage, depth = 0 }: { dog: Dog; dogsWithLineage?: DogWithLineage[]; depth?: number }) {
  const dogWithLineage = dogsWithLineage?.find(d => d.id === dog.id)

  if (!dogWithLineage?.sire && !dogWithLineage?.dam) {
    return null
  }

  // Limit recursion depth to prevent infinite loops
  if (depth > 2) return null

  return (
    <div className="flex flex-col items-center mb-3">
      {/* Grandparents row */}
      <div className="flex items-end gap-6">
        {dogWithLineage.sire && (
          <div className="flex flex-col items-center">
            {/* Recurse for great-grandparents */}
            {depth < 2 && <ParentLineage dog={dogWithLineage.sire} dogsWithLineage={dogsWithLineage} depth={depth + 1} />}
            <div className={cn(
              "relative overflow-hidden rounded-full ring-2 ring-offset-2 transition-all hover:scale-110 hover:shadow-lg dog-node-glow",
              depth === 0 ? "w-14 h-14 ring-blue-400" : "w-10 h-10 ring-blue-300"
            )}>
              {dogWithLineage.sire.image_url ? (
                <img
                  src={dogWithLineage.sire.image_url}
                  alt={dogWithLineage.sire.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-50">
                  <GenderMale weight="bold" className={cn(depth === 0 ? "h-5 w-5" : "h-4 w-4", "text-blue-400")} />
                </div>
              )}
            </div>
            <p className={cn(
              "mt-1 font-medium text-neutral-700 truncate max-w-[80px]",
              depth === 0 ? "text-xs" : "text-[10px]"
            )}>
              {dogWithLineage.sire.name}
            </p>
          </div>
        )}
        {dogWithLineage.dam && (
          <div className="flex flex-col items-center">
            {/* Recurse for great-grandparents */}
            {depth < 2 && <ParentLineage dog={dogWithLineage.dam} dogsWithLineage={dogsWithLineage} depth={depth + 1} />}
            <div className={cn(
              "relative overflow-hidden rounded-full ring-2 ring-offset-2 transition-all hover:scale-110 hover:shadow-lg dog-node-glow",
              depth === 0 ? "w-14 h-14 ring-pink-400" : "w-10 h-10 ring-pink-300"
            )}>
              {dogWithLineage.dam.image_url ? (
                <img
                  src={dogWithLineage.dam.image_url}
                  alt={dogWithLineage.dam.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-pink-50">
                  <GenderFemale weight="bold" className={cn(depth === 0 ? "h-5 w-5" : "h-4 w-4", "text-pink-400")} />
                </div>
              )}
            </div>
            <p className={cn(
              "mt-1 font-medium text-neutral-700 truncate max-w-[80px]",
              depth === 0 ? "text-xs" : "text-[10px]"
            )}>
              {dogWithLineage.dam.name}
            </p>
          </div>
        )}
      </div>
      {/* Connector line down */}
      <div className="w-0.5 h-4 bg-gradient-to-b from-amber-300 to-amber-400 rounded-full mt-2" />
    </div>
  )
}

function DogWithParents({ dog, dogsWithLineage }: { dog: Dog; dogsWithLineage?: DogWithLineage[] }) {
  return (
    <div className="flex flex-col items-center">
      <ParentLineage dog={dog} dogsWithLineage={dogsWithLineage} />
      <TreeNode dog={dog} size="lg" />
    </div>
  )
}

// Breeding pair connector with heart icon
function BreedingConnector() {
  return (
    <div className="flex flex-col items-center self-end mb-16">
      <div className="w-0.5 h-6 bg-gradient-to-b from-transparent via-amber-300 to-amber-400 rounded-full" />
      <div className="flex items-center">
        <div className="w-8 h-0.5 bg-amber-400 rounded-full" />
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 shadow-md">
          <Heart weight="fill" className="h-5 w-5 text-amber-600" />
        </div>
        <div className="w-8 h-0.5 bg-amber-400 rounded-full" />
      </div>
      <div className="w-0.5 h-6 bg-gradient-to-b from-amber-400 via-amber-300 to-transparent rounded-full" />
    </div>
  )
}

export function FamilyTree({ dogs, litters, dogsWithLineage }: FamilyTreeProps) {
  const littersByParents = litters.reduce((acc, litter) => {
    const key = `${litter.sire_id || 'unknown'}-${litter.dam_id || 'unknown'}`
    if (!acc[key]) {
      acc[key] = {
        sire: litter.sire,
        dam: litter.dam,
        litters: [],
      }
    }
    acc[key].litters.push(litter)
    return acc
  }, {} as Record<string, { sire: Dog | null; dam: Dog | null; litters: LitterWithRelations[] }>)

  const parentPairs = Object.values(littersByParents).filter(
    pair => pair.sire || pair.dam
  )

  if (parentPairs.length === 0) {
    return (
      <div className="text-center text-neutral-500 py-12">
        <p className="text-lg">No family relationships to display yet.</p>
        <p className="text-sm mt-2">Add litters with parent dogs to see the family tree.</p>
      </div>
    )
  }

  return (
    <div className="space-y-20">
      {parentPairs.map((pair, index) => (
        <div key={index} className="relative litter-hover-lift rounded-2xl p-6 bg-gradient-to-b from-white to-amber-50/30">
          {/* Family Unit Header */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-100 rounded-full">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Family {index + 1}
            </span>
          </div>

          {/* Parents Row */}
          <div className="flex items-end justify-center gap-6 sm:gap-10 pt-4">
            {pair.sire && <DogWithParents dog={pair.sire} dogsWithLineage={dogsWithLineage} />}
            {pair.sire && pair.dam && <BreedingConnector />}
            {pair.dam && <DogWithParents dog={pair.dam} dogsWithLineage={dogsWithLineage} />}
          </div>

          {/* Connection Line to Litters */}
          <div className="flex justify-center mt-6">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-8 bg-gradient-to-b from-amber-400 to-amber-300 rounded-full" />
              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-md" />
            </div>
          </div>

          {/* Litters */}
          <div className="mt-6 space-y-10">
            {pair.litters.map((litter) => (
              <div key={litter.id} className="text-center">
                {/* Litter Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-5 py-2.5 mb-6 shadow-sm border border-amber-200/50">
                  <span className="font-bold text-amber-800">{litter.name}</span>
                  {litter.puppies.length > 0 && (
                    <span className="text-sm text-amber-600 bg-white/60 px-2 py-0.5 rounded-full">
                      {litter.puppies.length} {litter.puppies.length === 1 ? 'puppy' : 'puppies'}
                    </span>
                  )}
                </div>

                {/* Puppies Grid */}
                {litter.puppies.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-5">
                    {litter.puppies.map((puppy) => (
                      <PuppyNode key={puppy.id} puppy={puppy} />
                    ))}
                  </div>
                )}

                {litter.puppies.length === 0 && (
                  <p className="text-sm text-neutral-400 italic">No puppies added yet</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Standalone Dogs (no litters) */}
      {dogs.filter(dog => !litters.some(l => l.sire_id === dog.id || l.dam_id === dog.id)).length > 0 && (
        <div className="border-t-2 border-neutral-200 pt-10">
          <h3 className="text-center text-lg font-bold text-neutral-700 mb-2">
            Other Dogs
          </h3>
          <p className="text-center text-sm text-neutral-500 mb-6">
            Dogs not yet assigned to any litters
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {dogs
              .filter(dog => !litters.some(l => l.sire_id === dog.id || l.dam_id === dog.id))
              .map(dog => (
                <DogWithParents key={dog.id} dog={dog} dogsWithLineage={dogsWithLineage} />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PuppyNode({ puppy }: { puppy: Puppy }) {
  const displayName = puppy.name || `${puppy.collar_color || 'No'} Collar`
  const isMale = puppy.gender === 'male'

  return (
    <div className="flex flex-col items-center group transition-transform duration-200 hover:scale-105">
      {/* Connection line from litter */}
      <div className="w-0.5 h-3 bg-gradient-to-b from-amber-300 to-transparent rounded-full mb-1" />

      <div className={cn(
        "relative w-18 h-18 overflow-hidden rounded-full ring-2 ring-offset-2 transition-all duration-200 group-hover:ring-4 group-hover:shadow-lg",
        isMale ? "ring-blue-300 group-hover:ring-blue-400" : "ring-pink-300 group-hover:ring-pink-400"
      )}>
        {puppy.image_url ? (
          <img
            src={puppy.image_url}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={cn(
            "flex h-full w-full items-center justify-center",
            isMale ? "bg-blue-50" : "bg-pink-50"
          )}>
            <span className="text-2xl">🐶</span>
          </div>
        )}
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm font-semibold text-neutral-700 group-hover:text-amber-600 transition-colors">
          {displayName}
        </p>
        <div className={cn(
          "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-0.5",
          isMale ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"
        )}>
          {isMale ? (
            <GenderMale weight="bold" className="h-3 w-3" />
          ) : (
            <GenderFemale weight="bold" className="h-3 w-3" />
          )}
          <span>{isMale ? 'Male' : 'Female'}</span>
        </div>
      </div>
    </div>
  )
}
