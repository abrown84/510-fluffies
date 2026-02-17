'use client'

import { TreeNode } from './tree-node'
import type { Dog, Litter, Puppy } from '@/types/database'

interface LitterWithRelations extends Litter {
  sire: Dog | null
  dam: Dog | null
  puppies: Puppy[]
}

interface FamilyTreeProps {
  dogs: Dog[]
  litters: LitterWithRelations[]
}

export function FamilyTree({ dogs, litters }: FamilyTreeProps) {
  // Group litters by parent pairs
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
        <p>No family relationships to display yet.</p>
        <p className="text-sm mt-2">Add litters with parent dogs to see the family tree.</p>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {parentPairs.map((pair, index) => (
        <div key={index} className="relative">
          {/* Parents Row */}
          <div className="flex items-center justify-center gap-8">
            {pair.sire && <TreeNode dog={pair.sire} size="lg" />}
            {pair.sire && pair.dam && (
              <div className="flex flex-col items-center">
                <div className="w-px h-8 bg-amber-300" />
                <div className="w-16 h-px bg-amber-300" />
                <span className="text-amber-500 font-semibold text-lg">×</span>
                <div className="w-16 h-px bg-amber-300" />
                <div className="w-px h-8 bg-amber-300" />
              </div>
            )}
            {pair.dam && <TreeNode dog={pair.dam} size="lg" />}
          </div>

          {/* Connection Line */}
          <div className="flex justify-center mt-4">
            <div className="w-px h-8 bg-amber-300" />
          </div>

          {/* Litters */}
          <div className="mt-4 space-y-8">
            {pair.litters.map((litter) => (
              <div key={litter.id} className="text-center">
                {/* Litter Name */}
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 mb-4">
                  <span className="font-semibold text-amber-700">{litter.name}</span>
                  {litter.puppies.length > 0 && (
                    <span className="text-sm text-amber-500">
                      ({litter.puppies.length} puppies)
                    </span>
                  )}
                </div>

                {/* Puppies */}
                {litter.puppies.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-4">
                    {litter.puppies.map((puppy) => (
                      <PuppyNode key={puppy.id} puppy={puppy} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Standalone Dogs (no litters) */}
      {dogs.filter(dog => !litters.some(l => l.sire_id === dog.id || l.dam_id === dog.id)).length > 0 && (
        <div className="border-t border-neutral-200 pt-8">
          <h3 className="text-center text-lg font-semibold text-neutral-700 mb-6">
            Other Dogs
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {dogs
              .filter(dog => !litters.some(l => l.sire_id === dog.id || l.dam_id === dog.id))
              .map(dog => (
                <TreeNode key={dog.id} dog={dog} size="md" />
              ))}
          </div>
        </div>
      )}
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
            <span className="text-xl">🐕</span>
          </div>
        )}
      </div>
      <p className="mt-1 text-xs font-medium text-neutral-700">{displayName}</p>
      <span className="text-xs text-neutral-400">
        {puppy.gender === 'male' ? '♂' : '♀'}
      </span>
    </div>
  )
}
