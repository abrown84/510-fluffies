import type { Node, Edge } from '@xyflow/react'
import type { Dog, Litter, Puppy } from './database'

// Relationship type for hover highlighting
export type RelationshipType = 'parent' | 'sibling' | 'offspring' | 'self' | null

// Node types for the pedigree canvas
export type DogNodeData = {
  type: 'dog'
  dog: Dog
  isHighlighted?: boolean
  // Relationship highlighting
  relationshipType?: RelationshipType
  isDimmed?: boolean
  // Tooltip data
  parentNames?: {
    sire?: string
    dam?: string
  }
  offspringCount?: number
  // Generation info
  generation?: number
  // Collapse state
  isCollapsed?: boolean
  hasOffspring?: boolean
  // Mobile/compact mode
  compact?: boolean
  // Collapse toggle callback (for mobile tap)
  onToggleCollapse?: (dogId: string) => void
}

export type LitterNodeData = {
  type: 'litter'
  litter: Litter & {
    sire: Dog | null
    dam: Dog | null
    puppies: Puppy[]
  }
  isHighlighted?: boolean
  // Mobile/compact mode
  compact?: boolean
}

export type PedigreeNodeData = DogNodeData | LitterNodeData

export type PedigreeNode = Node<PedigreeNodeData>

// Edge types - sire edges are solid, dam edges are dashed
export type PedigreeEdgeData = {
  relationshipType: 'sire' | 'dam' | 'offspring'
}

export type PedigreeEdge = Edge<PedigreeEdgeData>

// Layout position storage
export interface NodePosition {
  nodeId: string
  x: number
  y: number
}

export interface PedigreeLayoutPayload {
  viewId: string
  positions: NodePosition[]
}

// Database row type for pedigree_layouts
export interface PedigreeLayoutRow {
  id: string
  view_id: string
  node_id: string
  x: number
  y: number
  created_at: string
  updated_at: string
}

// Props for the PedigreeCanvas component
export interface PedigreeCanvasProps {
  dogs: Dog[]
  litters: (Litter & {
    sire: Dog | null
    dam: Dog | null
    puppies: Puppy[]
  })[]
  dogsWithLineage: (Dog & {
    sire: Dog | null
    dam: Dog | null
  })[]
  viewId?: string
  isEditable?: boolean
  showLitters?: boolean
}

// Node dimensions for layout calculations
export const NODE_DIMENSIONS = {
  dog: { width: 160, height: 180 },
  dogCompact: { width: 100, height: 120 },
  litter: { width: 200, height: 120 },
  litterCompact: { width: 140, height: 90 },
} as const
