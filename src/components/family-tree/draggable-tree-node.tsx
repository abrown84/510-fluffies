'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import { GenderMale, GenderFemale } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Dog } from '@/types/database'
import { useFamilyTree } from './family-tree-context'

interface DraggableTreeNodeProps {
  dog: Dog
  size?: 'sm' | 'md' | 'lg'
}

export function DraggableTreeNode({ dog, size = 'md' }: DraggableTreeNodeProps) {
  const { setEditingDog } = useFamilyTree()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `dog-${dog.id}`,
    data: { type: 'dog', dog },
  })

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }

  const nameSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined

  const handleClick = (e: React.MouseEvent) => {
    // Only open edit modal if not dragging
    if (!isDragging) {
      setEditingDog(dog)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={cn(
        'group relative flex flex-col items-center transition-transform cursor-grab select-none',
        isDragging && 'opacity-50 cursor-grabbing'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'relative overflow-hidden rounded-full ring-2 ring-offset-2 transition-all group-hover:ring-4',
          dog.gender === 'male' ? 'ring-blue-400' : 'ring-pink-400',
          sizeClasses[size]
        )}
      >
        {dog.image_url ? (
          <Image
            src={dog.image_url}
            alt={dog.name}
            fill
            className="object-cover pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-100">
            <span className="text-2xl">🐕</span>
          </div>
        )}
      </div>

      {/* Name and gender */}
      <div className="mt-2 text-center">
        <p className={cn(
          'font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors',
          nameSizeClasses[size]
        )}>
          {dog.name}
        </p>
        <div className="flex items-center justify-center gap-1">
          {dog.gender === 'male' ? (
            <GenderMale weight="bold" className="h-3 w-3 text-blue-500" />
          ) : (
            <GenderFemale weight="bold" className="h-3 w-3 text-pink-500" />
          )}
          <span className="text-xs text-neutral-500">{dog.color}</span>
        </div>
      </div>
    </div>
  )
}
