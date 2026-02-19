'use client'

import { useDroppable } from '@dnd-kit/core'
import { Plus, Dog, Sparkle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export function NewLitterDropzone() {
  const { isOver, setNodeRef, active } = useDroppable({
    id: 'new-litter',
    data: { type: 'new-litter' },
  })

  const isDogDragging = active?.data?.current?.type === 'dog'

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative rounded-2xl border-3 border-dashed p-8 text-center transition-all duration-300 ease-out overflow-hidden',
        isDogDragging ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50' : 'border-neutral-300 bg-neutral-50',
        isOver && 'border-amber-500 bg-gradient-to-br from-amber-100 to-orange-100 scale-[1.02] shadow-xl shadow-amber-200/50'
      )}
    >
      {/* Animated background when hovering */}
      {isOver && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-amber-200 rounded-full opacity-30 animate-pulse" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-orange-200 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      )}

      <div className="relative z-10">
        <div className={cn(
          'mx-auto flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300',
          isOver ? 'bg-amber-300 scale-110 shadow-lg' : isDogDragging ? 'bg-amber-100 animate-bounce' : 'bg-neutral-200'
        )}>
          {isOver ? (
            <div className="relative">
              <Dog weight="fill" className="h-10 w-10 text-amber-700" />
              <Sparkle weight="fill" className="absolute -top-2 -right-2 h-5 w-5 text-amber-500 animate-spin" />
            </div>
          ) : (
            <Plus weight="bold" className={cn(
              "h-10 w-10 transition-all duration-200",
              isDogDragging ? "text-amber-500 rotate-90" : "text-neutral-500"
            )} />
          )}
        </div>
        <p className={cn(
          'mt-4 text-lg font-bold transition-all duration-200',
          isOver ? 'text-amber-700 scale-105' : isDogDragging ? 'text-amber-600' : 'text-neutral-600'
        )}>
          {isOver ? '✨ Release to Create Litter!' : isDogDragging ? 'Drop Here!' : 'Create New Litter'}
        </p>
        <p className={cn(
          "mt-1 text-sm transition-colors",
          isDogDragging ? "text-amber-500" : "text-neutral-500"
        )}>
          {isDogDragging ? 'This dog will be the first parent' : 'Drag any dog here to start a new litter'}
        </p>
      </div>
    </div>
  )
}
