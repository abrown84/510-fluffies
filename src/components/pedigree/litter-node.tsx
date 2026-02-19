'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { LitterNodeData } from '@/types/pedigree'

const LitterNode = memo(function LitterNode({
  data,
  selected,
}: NodeProps<Node<LitterNodeData>>) {
  const { litter, isHighlighted } = data
  const puppyCount = litter.puppies?.length || litter.puppy_count || 0

  return (
    <div
      className={cn(
        'relative w-52 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 shadow-md transition-all duration-200',
        'border-2 border-amber-300',
        selected && 'ring-2 ring-amber-400 ring-offset-2',
        isHighlighted && 'ring-4 ring-amber-400 ring-offset-2 scale-105'
      )}
    >
      {/* Parent connection handles - two handles for sire and dam */}
      <Handle
        type="target"
        position={Position.Top}
        id="sire"
        className={cn(
          "!w-4 !h-4 !bg-blue-400 !border-2 !border-white !left-1/3",
          "transition-all duration-200 hover:scale-150 hover:!bg-blue-500 hover:shadow-lg",
          "before:absolute before:inset-[-8px] before:content-[''] before:rounded-full"
        )}
        style={{ left: '33%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="dam"
        className={cn(
          "!w-4 !h-4 !bg-pink-400 !border-2 !border-white !left-2/3",
          "transition-all duration-200 hover:scale-150 hover:!bg-pink-500 hover:shadow-lg",
          "before:absolute before:inset-[-8px] before:content-[''] before:rounded-full"
        )}
        style={{ left: '67%' }}
      />

      {/* Header */}
      <div className="rounded-t-lg bg-amber-400/20 px-3 py-2 border-b border-amber-200">
        <Link
          href={`/litters/${litter.id}`}
          className="block font-semibold text-amber-800 hover:text-amber-600 transition-colors text-sm truncate"
          title={litter.name}
        >
          {litter.name}
        </Link>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Parents */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="text-blue-500 font-bold">♂</span>
            <span className="text-neutral-600 truncate max-w-[70px]">
              {litter.sire?.name || litter.custom_sire_name || 'Unknown'}
            </span>
          </div>
          <span className="text-neutral-400">×</span>
          <div className="flex items-center gap-1">
            <span className="text-pink-500 font-bold">♀</span>
            <span className="text-neutral-600 truncate max-w-[70px]">
              {litter.dam?.name || litter.custom_dam_name || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Puppy count */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">🐕</span>
          <span className="font-medium text-neutral-700">
            {puppyCount} {puppyCount === 1 ? 'puppy' : 'puppies'}
          </span>
        </div>

        {/* Status badge */}
        <div className="text-center">
          <span
            className={cn(
              'inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
              litter.status === 'available'
                ? 'bg-green-100 text-green-700'
                : litter.status === 'expected'
                ? 'bg-blue-100 text-blue-700'
                : litter.status === 'born'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-neutral-100 text-neutral-600'
            )}
          >
            {litter.status}
          </span>
        </div>

        {/* Date */}
        {(litter.date_of_birth || litter.expected_date) && (
          <p className="text-center text-[10px] text-neutral-500">
            {litter.date_of_birth
              ? new Date(litter.date_of_birth).toLocaleDateString()
              : `Expected: ${new Date(litter.expected_date!).toLocaleDateString()}`}
          </p>
        )}
      </div>

      {/* Offspring connection handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="offspring"
        className={cn(
          "!w-4 !h-4 !bg-amber-400 !border-2 !border-white",
          "transition-all duration-200 hover:scale-150 hover:!bg-amber-500 hover:shadow-lg",
          "before:absolute before:inset-[-8px] before:content-[''] before:rounded-full"
        )}
      />
    </div>
  )
})

export { LitterNode }
