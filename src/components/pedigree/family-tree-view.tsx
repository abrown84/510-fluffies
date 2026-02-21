'use client'

import { useState, useEffect } from 'react'
import { ListBullets, Graph } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { PedigreeCanvas } from './pedigree-canvas'
import { FamilyListView } from './family-list-view'
import type { Dog, DogWithLineage, Litter, Puppy } from '@/types/database'

interface FamilyTreeViewProps {
  dogs: Dog[]
  dogsWithLineage: DogWithLineage[]
  litters: (Litter & { sire: Dog | null; dam: Dog | null; puppies: Puppy[] })[]
  viewId?: string
  isEditable?: boolean
}

type ViewMode = 'canvas' | 'list'

export function FamilyTreeView({
  dogs,
  dogsWithLineage,
  litters,
  viewId = 'default',
  isEditable = false,
}: FamilyTreeViewProps) {
  // Default to list view on mobile, canvas on desktop
  const [viewMode, setViewMode] = useState<ViewMode>('canvas')
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Auto-switch to list view on mobile if user hasn't explicitly chosen
      if (mobile && viewMode === 'canvas') {
        setViewMode('list')
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, []) // Only run on mount

  return (
    <div>
      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('canvas')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              viewMode === 'canvas'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <Graph className="h-4 w-4" />
            <span className="hidden sm:inline">Tree View</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              viewMode === 'list'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <ListBullets className="h-4 w-4" />
            <span className="hidden sm:inline">List View</span>
          </button>
        </div>

        {/* Mobile hint */}
        {isMobile && viewMode === 'canvas' && (
          <p className="text-xs text-amber-600">
            Pinch to zoom • Drag to pan
          </p>
        )}
      </div>

      {/* Views */}
      {viewMode === 'canvas' ? (
        <PedigreeCanvas
          dogs={dogs}
          litters={litters}
          dogsWithLineage={dogsWithLineage}
          viewId={viewId}
          isEditable={isEditable}
        />
      ) : (
        <FamilyListView
          dogs={dogs}
          dogsWithLineage={dogsWithLineage}
          litters={litters}
        />
      )}

      {/* View-specific instructions */}
      <div className="mt-4 text-center text-sm text-neutral-500">
        {viewMode === 'canvas' ? (
          <p>
            {isEditable ? (
              <>Drag nodes to rearrange • Positions are saved automatically</>
            ) : (
              <>
                {isMobile ? (
                  <>Tap dog for details • Pinch to zoom • Drag to pan</>
                ) : (
                  <>Click and drag to pan • Scroll to zoom • Click a dog to view details</>
                )}
              </>
            )}
          </p>
        ) : (
          <p>Tap a dog to see their parents • Tap &quot;View&quot; for full profile</p>
        )}
      </div>
    </div>
  )
}
