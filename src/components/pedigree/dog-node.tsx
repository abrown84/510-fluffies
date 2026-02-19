'use client'

import { memo, useState, useEffect, useRef } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import Link from 'next/link'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { DogNodeData } from '@/types/pedigree'

// Helper to calculate age
function calculateAge(dateOfBirth: string | null): string {
  if (!dateOfBirth) return 'Unknown'
  const birth = new Date(dateOfBirth)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()

  if (years === 0) {
    return `${months} mo`
  } else if (months < 0) {
    return `${years - 1} yr ${12 + months} mo`
  }
  return `${years} yr${months > 0 ? ` ${months} mo` : ''}`
}

const DogNode = memo(function DogNode({
  data,
  selected,
}: NodeProps<Node<DogNodeData>>) {
  const { dog, isHighlighted, relationshipType, isDimmed, parentNames, offspringCount, generation, isCollapsed, hasOffspring } = data
  const isMale = dog.gender === 'male'
  const [showTooltip, setShowTooltip] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Delayed tooltip - only show after hovering for 500ms to not interfere with handle clicks
  useEffect(() => {
    if (isHovering) {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowTooltip(true)
      }, 500)
    } else {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      setShowTooltip(false)
    }
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [isHovering])

  // Relationship highlight styles
  const getRelationshipStyles = () => {
    if (isDimmed) return 'opacity-30'
    switch (relationshipType) {
      case 'self':
        return 'ring-4 ring-amber-500 ring-offset-2 scale-105 shadow-lg'
      case 'parent':
        return 'ring-4 ring-amber-400 ring-offset-2 bg-amber-50'
      case 'sibling':
        return 'ring-4 ring-purple-400 ring-offset-2 bg-purple-50'
      case 'offspring':
        return 'ring-4 ring-green-400 ring-offset-2 bg-green-50'
      default:
        return ''
    }
  }

  return (
    <div
      className={cn(
        'relative w-40 rounded-xl bg-white shadow-md transition-all duration-200',
        'border-2',
        isMale ? 'border-blue-300' : 'border-pink-300',
        selected && 'ring-2 ring-amber-400 ring-offset-2',
        isHighlighted && 'ring-4 ring-amber-400 ring-offset-2 scale-105',
        getRelationshipStyles()
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Hover Tooltip - positioned to the right to avoid blocking handles */}
      {showTooltip && (
        <div className="absolute top-1/2 left-full ml-2 -translate-y-1/2 z-50 w-48 rounded-lg bg-neutral-900 p-2.5 text-xs text-white shadow-xl pointer-events-none">
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 h-2 w-2 bg-neutral-900" />

          <div className="font-semibold text-sm mb-1.5 text-amber-300">{dog.name}</div>

          <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
            <span className="text-neutral-400">Age:</span>
            <span>{calculateAge(dog.date_of_birth)}</span>

            <span className="text-neutral-400">Status:</span>
            <span className={cn(
              dog.status === 'breeding' ? 'text-green-400' :
              dog.status === 'retired' ? 'text-neutral-400' : 'text-amber-400'
            )}>
              {dog.status}
            </span>

            {parentNames?.sire && (
              <>
                <span className="text-neutral-400">Sire:</span>
                <span className="text-blue-300">{parentNames.sire}</span>
              </>
            )}

            {parentNames?.dam && (
              <>
                <span className="text-neutral-400">Dam:</span>
                <span className="text-pink-300">{parentNames.dam}</span>
              </>
            )}

            {offspringCount !== undefined && offspringCount > 0 && (
              <>
                <span className="text-neutral-400">Offspring:</span>
                <span className="text-green-400">{offspringCount}</span>
              </>
            )}

            {generation !== undefined && (
              <>
                <span className="text-neutral-400">Generation:</span>
                <span className="text-purple-400">Gen {generation}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Parent connection handles - larger with hover effects */}
      <Handle
        type="target"
        position={Position.Top}
        id="parent"
        className={cn(
          "!w-4 !h-4 !bg-amber-400 !border-2 !border-white",
          "transition-all duration-200 hover:scale-150 hover:!bg-amber-500 hover:shadow-lg",
          "before:absolute before:inset-[-8px] before:content-[''] before:rounded-full"
        )}
      />

      {/* Photo */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        {dog.image_url ? (
          <img
            src={dog.image_url}
            alt={dog.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center text-4xl',
              isMale ? 'bg-blue-50 text-blue-300' : 'bg-pink-50 text-pink-300'
            )}
          >
            {isMale ? '♂' : '♀'}
          </div>
        )}

        {/* Gender badge */}
        <div
          className={cn(
            'absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-md',
            isMale ? 'bg-blue-500' : 'bg-pink-500'
          )}
        >
          {isMale ? '♂' : '♀'}
        </div>

        {/* Relationship indicator badge */}
        {relationshipType && relationshipType !== 'self' && !isDimmed && (
          <div
            className={cn(
              'absolute top-2 left-2 flex h-5 px-1.5 items-center justify-center rounded text-[9px] font-bold text-white shadow-md',
              relationshipType === 'parent' ? 'bg-amber-500' :
              relationshipType === 'sibling' ? 'bg-purple-500' :
              'bg-green-500'
            )}
          >
            {relationshipType === 'parent' ? 'Parent' :
             relationshipType === 'sibling' ? 'Sibling' :
             'Offspring'}
          </div>
        )}

        {/* Generation badge */}
        {generation !== undefined && !relationshipType && (
          <div className="absolute top-2 left-2 flex h-5 px-1.5 items-center justify-center rounded text-[9px] font-bold text-white shadow-md bg-purple-500">
            Gen {generation}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 text-center">
        <Link
          href={`/dogs/${dog.slug}`}
          className="block font-semibold text-neutral-800 hover:text-amber-600 transition-colors text-sm truncate"
          title={dog.name}
        >
          {dog.name}
        </Link>
        {dog.color && (
          <p className="mt-0.5 text-xs text-neutral-500 truncate">{dog.color}</p>
        )}
        <span
          className={cn(
            'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
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

      {/* Offspring connection handle and collapse button */}
      <div className="relative">
        <Handle
          type="source"
          position={Position.Bottom}
          id="offspring"
          className={cn(
            "!w-4 !h-4 !border-2 !border-white",
            isMale ? "!bg-blue-400 hover:!bg-blue-500" : "!bg-pink-400 hover:!bg-pink-500",
            "transition-all duration-200 hover:scale-150 hover:shadow-lg",
            "before:absolute before:inset-[-8px] before:content-[''] before:rounded-full"
          )}
        />

        {/* Collapse indicator for dogs with offspring */}
        {hasOffspring && (
          <div
            className={cn(
              'absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shadow-sm border-2 border-white',
              isCollapsed
                ? 'bg-neutral-400 text-white'
                : 'bg-green-500 text-white'
            )}
            title={isCollapsed ? 'Offspring hidden' : `${offspringCount} offspring`}
          >
            {isCollapsed ? (
              <CaretDown className="h-3 w-3" />
            ) : (
              <CaretUp className="h-3 w-3" />
            )}
          </div>
        )}
      </div>
    </div>
  )
})

export { DogNode }
