'use client'

import { memo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
  type Edge,
} from '@xyflow/react'
import type { PedigreeEdgeData } from '@/types/pedigree'

/**
 * Sire (male parent) edge - solid blue line
 */
export const SireEdge = memo(function SireEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps<Edge<PedigreeEdgeData>>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  })

  return (
    <>
      {/* Invisible wider path for easier clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
      />
      {/* Glow effect when selected */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke="#60a5fa"
          strokeWidth={10}
          strokeOpacity={0.3}
          style={{ pointerEvents: 'none' }}
        />
      )}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#2563eb' : '#60a5fa', // darker when selected
          strokeWidth: selected ? 4 : 2.5,
          cursor: 'pointer',
        }}
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="rounded-md bg-blue-500 px-2 py-1 text-xs font-medium text-white shadow-lg"
          >
            ♂ Sire Connection
            <div className="text-[10px] opacity-75">Press Delete to remove</div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

/**
 * Dam (female parent) edge - dashed pink line
 */
export const DamEdge = memo(function DamEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps<Edge<PedigreeEdgeData>>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  })

  return (
    <>
      {/* Invisible wider path for easier clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
      />
      {/* Glow effect when selected */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke="#f472b6"
          strokeWidth={10}
          strokeOpacity={0.3}
          style={{ pointerEvents: 'none' }}
        />
      )}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#db2777' : '#f472b6', // darker when selected
          strokeWidth: selected ? 4 : 2.5,
          strokeDasharray: '8 4',
          cursor: 'pointer',
        }}
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="rounded-md bg-pink-500 px-2 py-1 text-xs font-medium text-white shadow-lg"
          >
            ♀ Dam Connection
            <div className="text-[10px] opacity-75">Press Delete to remove</div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})
