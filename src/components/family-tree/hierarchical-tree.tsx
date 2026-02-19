'use client'

import { useState } from 'react'
import { GenderMale, GenderFemale, Heart, Plus, PencilSimple } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Dog, DogWithLineage, Puppy } from '@/types/database'
import { useFamilyTree, type LitterWithRelations } from './family-tree-context'

interface HierarchicalTreeProps {
  litters: LitterWithRelations[]
  dogsWithLineage?: DogWithLineage[]
  onEditDog?: (dog: Dog) => void
  onEditLitter?: (litter: LitterWithRelations) => void
  onAddParent?: (type: 'sire' | 'dam', litterId: string) => void
}

// Color palette for family branches
const branchColors = [
  { ring: 'ring-sky-400', bg: 'bg-sky-50', text: 'text-sky-600', line: 'border-sky-300' },
  { ring: 'ring-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-600', line: 'border-emerald-300' },
  { ring: 'ring-violet-400', bg: 'bg-violet-50', text: 'text-violet-600', line: 'border-violet-300' },
  { ring: 'ring-amber-400', bg: 'bg-amber-50', text: 'text-amber-600', line: 'border-amber-300' },
  { ring: 'ring-rose-400', bg: 'bg-rose-50', text: 'text-rose-600', line: 'border-rose-300' },
]

// Node sizes
const nodeSize = {
  parent: 'w-24 h-24',
  puppy: 'w-16 h-16',
  empty: 'w-24 h-24',
}

interface TreeNodeProps {
  dog: Dog | null
  customName?: string | null
  size?: 'parent' | 'puppy'
  colorIndex?: number
  onClick?: () => void
  onAddClick?: () => void
  type?: 'sire' | 'dam' | 'puppy'
  lineage?: DogWithLineage | null
  showLineage?: boolean
}

function TreeNode({ dog, customName, size = 'parent', colorIndex = 0, onClick, onAddClick, type, lineage, showLineage }: TreeNodeProps) {
  const colors = branchColors[colorIndex % branchColors.length]
  const isMale = type === 'sire' || dog?.gender === 'male'
  const nodeClasses = size === 'parent' ? nodeSize.parent : nodeSize.puppy
  const hasLineage = showLineage && lineage && (lineage.sire || lineage.dam)

  // Empty slot
  if (!dog && !customName) {
    return (
      <div className="flex flex-col items-center">
        <button
          onClick={onAddClick}
          className={cn(
            'relative overflow-hidden rounded-full border-3 border-dashed transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center group',
            nodeClasses,
            isMale ? 'border-sky-300 hover:border-sky-400 hover:bg-sky-50' : 'border-rose-300 hover:border-rose-400 hover:bg-rose-50'
          )}
        >
          <div className="flex flex-col items-center">
            {isMale ? (
              <GenderMale weight="bold" className="h-6 w-6 text-sky-400 group-hover:text-sky-500" />
            ) : (
              <GenderFemale weight="bold" className="h-6 w-6 text-rose-400 group-hover:text-rose-500" />
            )}
            <Plus weight="bold" className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 mt-1" />
          </div>
        </button>
        <p className={cn(
          'mt-2 text-sm font-medium',
          isMale ? 'text-sky-500' : 'text-rose-500'
        )}>
          Add {type === 'sire' ? 'Sire' : 'Dam'}
        </p>
      </div>
    )
  }

  // Custom named parent (external)
  if (customName && !dog) {
    return (
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'relative overflow-hidden rounded-full ring-4 ring-offset-2 flex items-center justify-center',
            nodeClasses,
            isMale ? 'ring-sky-400 bg-sky-50' : 'ring-amber-400 bg-amber-50'
          )}
        >
          {isMale ? (
            <GenderMale weight="bold" className="h-8 w-8 text-sky-400" />
          ) : (
            <GenderFemale weight="bold" className="h-8 w-8 text-amber-400" />
          )}
        </div>
        <div className="mt-2 text-center">
          <p className="font-semibold text-neutral-800">{customName}</p>
          <p className={cn('text-xs', isMale ? 'text-sky-500' : 'text-amber-500')}>External</p>
        </div>
      </div>
    )
  }

  // Regular dog node with optional lineage
  return (
    <div className="flex flex-col items-center">
      {/* Grandparents (this dog's parents) */}
      {hasLineage && (
        <div className="flex flex-col items-center mb-2">
          <div className="flex items-end gap-2">
            {/* Grandfather (sire's sire or this dog's sire) */}
            {lineage.sire && (
              <MiniNode dog={lineage.sire} />
            )}
            {lineage.sire && lineage.dam && (
              <div className="flex items-center mb-5">
                <div className="w-3 h-0.5 bg-neutral-300" />
                <Heart weight="fill" className="h-3 w-3 text-sky-300" />
                <div className="w-3 h-0.5 bg-neutral-300" />
              </div>
            )}
            {/* Grandmother (dam's dam or this dog's dam) */}
            {lineage.dam && (
              <MiniNode dog={lineage.dam} />
            )}
          </div>
          {/* Connector line down to current dog */}
          <div className="w-0.5 h-3 bg-neutral-300" />
        </div>
      )}

      {/* Current dog */}
      <div className="flex flex-col items-center group">
        <div
          onClick={onClick}
          className={cn(
            'relative overflow-hidden rounded-full ring-4 ring-offset-2 transition-all duration-200 cursor-pointer',
            onClick && 'hover:scale-105 hover:shadow-lg',
            nodeClasses,
            isMale ? 'ring-sky-400' : 'ring-rose-400'
          )}
        >
          {dog?.image_url ? (
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
                <GenderMale weight="bold" className="h-8 w-8 text-sky-400" />
              ) : (
                <GenderFemale weight="bold" className="h-8 w-8 text-rose-400" />
              )}
            </div>
          )}
          {/* Edit overlay on hover */}
          {onClick && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <PencilSimple weight="bold" className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        <div className="mt-2 text-center">
          <p className="font-semibold text-neutral-800 group-hover:text-amber-600 transition-colors">
            {dog?.name}
          </p>
          <p className={cn('text-xs', isMale ? 'text-sky-500' : 'text-rose-500')}>
            {dog?.color || (isMale ? 'Male' : 'Female')}
          </p>
        </div>
      </div>
    </div>
  )
}

// Mini node for grandparents (smaller display)
function MiniNode({ dog }: { dog: Dog }) {
  const isMale = dog.gender === 'male'

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'relative overflow-hidden rounded-full ring-2 ring-offset-1 w-12 h-12',
          isMale ? 'ring-sky-300' : 'ring-rose-300'
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
              <GenderMale weight="bold" className="h-4 w-4 text-sky-400" />
            ) : (
              <GenderFemale weight="bold" className="h-4 w-4 text-rose-400" />
            )}
          </div>
        )}
      </div>
      <p className="mt-1 text-[10px] font-medium text-neutral-600 truncate max-w-[60px]">
        {dog.name}
      </p>
    </div>
  )
}

function HeartConnector() {
  return (
    <div className="flex items-center mx-4">
      <div className="w-6 h-0.5 bg-neutral-300" />
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 shadow-sm">
        <Heart weight="fill" className="h-4 w-4 text-sky-400" />
      </div>
      <div className="w-6 h-0.5 bg-neutral-300" />
    </div>
  )
}

function VerticalConnector({ height = 'h-8' }: { height?: string }) {
  return (
    <div className={cn('w-0.5 bg-neutral-300', height)} />
  )
}

function HorizontalConnector({ width = 'w-8' }: { width?: string }) {
  return (
    <div className={cn('h-0.5 bg-neutral-300', width)} />
  )
}

interface FamilyUnitProps {
  litter: LitterWithRelations
  colorIndex?: number
  dogsWithLineage?: DogWithLineage[]
  onEditDog?: (dog: Dog) => void
  onEditLitter?: (litter: LitterWithRelations) => void
  onAddParent?: (type: 'sire' | 'dam', litterId: string) => void
}

function FamilyUnit({ litter, colorIndex = 0, dogsWithLineage, onEditDog, onEditLitter, onAddParent }: FamilyUnitProps) {
  const hasPuppies = litter.puppies.length > 0
  const hasBothParents = (litter.sire || litter.custom_sire_name) && (litter.dam || litter.custom_dam_name)

  // Find lineage data for sire and dam
  const sireLineage = litter.sire ? dogsWithLineage?.find(d => d.id === litter.sire!.id) : null
  const damLineage = litter.dam ? dogsWithLineage?.find(d => d.id === litter.dam!.id) : null

  return (
    <div className="flex flex-col items-center">
      {/* Parents Row */}
      <div className="flex items-end">
        {/* Sire */}
        <TreeNode
          dog={litter.sire}
          customName={litter.custom_sire_name}
          type="sire"
          colorIndex={colorIndex}
          lineage={sireLineage}
          showLineage={!!sireLineage?.sire || !!sireLineage?.dam}
          onClick={litter.sire ? () => onEditDog?.(litter.sire!) : undefined}
          onAddClick={() => onAddParent?.('sire', litter.id)}
        />

        {/* Heart Connector */}
        <HeartConnector />

        {/* Dam */}
        <TreeNode
          dog={litter.dam}
          customName={litter.custom_dam_name}
          type="dam"
          colorIndex={colorIndex}
          lineage={damLineage}
          showLineage={!!damLineage?.sire || !!damLineage?.dam}
          onClick={litter.dam ? () => onEditDog?.(litter.dam!) : undefined}
          onAddClick={() => onAddParent?.('dam', litter.id)}
        />
      </div>

      {/* Vertical line down to litter info */}
      <div className="flex flex-col items-center">
        <VerticalConnector height="h-6" />
      </div>

      {/* Litter Info Badge */}
      <button
        onClick={() => onEditLitter?.(litter)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-neutral-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all"
      >
        <span className="font-semibold text-neutral-700">{litter.name}</span>
        {hasPuppies && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            {litter.puppies.length} {litter.puppies.length === 1 ? 'puppy' : 'puppies'}
          </span>
        )}
      </button>

      {/* Puppies Section */}
      {hasPuppies && (
        <>
          {/* Connector line down */}
          <VerticalConnector height="h-4" />

          {/* Horizontal branch line above puppies */}
          <div className="relative">
            <div
              className="h-0.5 bg-neutral-300"
              style={{ width: `${Math.max(litter.puppies.length * 80, 60)}px` }}
            />
            {/* Vertical drop lines for each puppy */}
            <div className="absolute top-0 left-0 right-0 flex justify-around">
              {litter.puppies.map((_, i) => (
                <div key={i} className="w-0.5 h-4 bg-neutral-300" />
              ))}
            </div>
          </div>

          {/* Puppies Row */}
          <div className="flex gap-4 mt-4">
            {litter.puppies.map((puppy) => (
              <PuppyNode key={puppy.id} puppy={puppy} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function PuppyNode({ puppy }: { puppy: Puppy }) {
  const displayName = puppy.name || `${puppy.collar_color || 'No'} Collar`
  const isMale = puppy.gender === 'male'

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'relative overflow-hidden rounded-full ring-3 ring-offset-2 transition-all duration-200 hover:scale-105',
          nodeSize.puppy,
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
              <GenderMale weight="bold" className="h-5 w-5 text-sky-400" />
            ) : (
              <GenderFemale weight="bold" className="h-5 w-5 text-rose-400" />
            )}
          </div>
        )}
      </div>
      <div className="mt-1 text-center">
        <p className="text-xs font-medium text-neutral-700">{displayName}</p>
        <p className={cn('text-[10px]', isMale ? 'text-sky-500' : 'text-rose-500')}>
          {isMale ? 'Male' : 'Female'}
        </p>
      </div>
    </div>
  )
}

export function HierarchicalTree({ litters, dogsWithLineage, onEditDog, onEditLitter, onAddParent }: HierarchicalTreeProps) {
  if (litters.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-500">
        <p className="text-lg font-medium">No family trees yet</p>
        <p className="text-sm mt-1">Add a litter to start building your family tree</p>
      </div>
    )
  }

  // Group litters by parent pairs for side-by-side display
  const littersByParents = litters.reduce((acc, litter) => {
    const key = `${litter.sire_id || litter.custom_sire_name || 'none'}-${litter.dam_id || litter.custom_dam_name || 'none'}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(litter)
    return acc
  }, {} as Record<string, LitterWithRelations[]>)

  const parentPairs = Object.values(littersByParents)

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="flex flex-wrap justify-center gap-16 min-w-fit px-8">
        {parentPairs.map((pairLitters, pairIndex) => (
          <div key={pairIndex} className="flex flex-col items-center">
            {pairLitters.map((litter, litterIndex) => (
              <div key={litter.id} className={cn(litterIndex > 0 && 'mt-12')}>
                <FamilyUnit
                  litter={litter}
                  colorIndex={pairIndex}
                  dogsWithLineage={dogsWithLineage}
                  onEditDog={onEditDog}
                  onEditLitter={onEditLitter}
                  onAddParent={onAddParent}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
