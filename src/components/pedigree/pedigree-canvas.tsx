'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  ConnectionMode,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type Node,
  type Edge,
  type EdgeTypes,
  type NodeTypes,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  GenderMale,
  GenderFemale,
  Funnel,
  X,
  Target,
  CaretDown,
  CaretUp,
  Info,
} from '@phosphor-icons/react'

import { DogNode } from './dog-node'
import { LitterNode } from './litter-node'
import { SireEdge, DamEdge } from './pedigree-edges'
import { DogInfoModal } from './dog-info-modal'
import { buildPedigreeGraph, computeDagreLayout } from '@/lib/pedigree-layout'
import type {
  PedigreeCanvasProps,
  PedigreeNodeData,
  NodePosition,
} from '@/types/pedigree'
import type { Dog, DogWithLineage } from '@/types/database'
import { cn } from '@/lib/utils'

// Filter types
type StatusFilter = 'breeding' | 'retired' | 'available' | 'all'
type GenderFilter = 'male' | 'female' | 'all'

// Custom node types
const nodeTypes: NodeTypes = {
  dogNode: DogNode,
  litterNode: LitterNode,
}

// Custom edge types
const edgeTypes: EdgeTypes = {
  sireEdge: SireEdge,
  damEdge: DamEdge,
}

// Helper to compute relationships for a dog
function computeRelationships(
  dogId: string,
  dogsWithLineage: DogWithLineage[],
  litters: { sire_id: string | null; dam_id: string | null }[]
): {
  parentIds: Set<string>
  siblingIds: Set<string>
  offspringIds: Set<string>
} {
  const parentIds = new Set<string>()
  const siblingIds = new Set<string>()
  const offspringIds = new Set<string>()

  const dog = dogsWithLineage.find(d => d.id === dogId)
  if (!dog) return { parentIds, siblingIds, offspringIds }

  // Parents
  if (dog.sire_id) parentIds.add(dog.sire_id)
  if (dog.dam_id) parentIds.add(dog.dam_id)

  // Siblings (same parents)
  if (dog.sire_id || dog.dam_id) {
    dogsWithLineage.forEach(d => {
      if (d.id === dogId) return
      if ((dog.sire_id && d.sire_id === dog.sire_id) ||
          (dog.dam_id && d.dam_id === dog.dam_id)) {
        siblingIds.add(d.id)
      }
    })
  }

  // Offspring (dogs where this dog is sire or dam)
  dogsWithLineage.forEach(d => {
    if (d.sire_id === dogId || d.dam_id === dogId) {
      offspringIds.add(d.id)
    }
  })

  // Also check litters
  litters.forEach(l => {
    if (l.sire_id === dogId || l.dam_id === dogId) {
      // This dog is a parent of a litter - any dogs linked to this litter are offspring
    }
  })

  return { parentIds, siblingIds, offspringIds }
}

interface PedigreeCanvasInnerProps extends PedigreeCanvasProps {
  savedPositions: Map<string, { x: number; y: number }>
  onPositionsChange?: (positions: NodePosition[]) => void
  onDogClick?: (dog: Dog) => void
  externalFocusDogId?: string | null
  onExternalFocusChange?: (dogId: string | null) => void
}

function PedigreeCanvasInner({
  dogs,
  litters,
  dogsWithLineage,
  viewId = 'default',
  isEditable = false,
  showLitters = false,
  savedPositions,
  onPositionsChange,
  onDogClick,
  externalFocusDogId,
  onExternalFocusChange,
}: PedigreeCanvasInnerProps) {
  const { fitView, setCenter, getZoom } = useReactFlow()
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null)
  const [hoveredDogId, setHoveredDogId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showLegend, setShowLegend] = useState(true)
  const [collapsedDogIds, setCollapsedDogIds] = useState<Set<string>>(new Set())

  // Use external focus state if provided, otherwise use internal
  const focusedDogId = externalFocusDogId ?? null
  const setFocusedDogId = onExternalFocusChange ?? (() => {})

  // Compute descendants for each dog (for collapse functionality)
  const descendantsMap = useMemo(() => {
    const map = new Map<string, Set<string>>()

    const getDescendants = (dogId: string, visited: Set<string> = new Set()): Set<string> => {
      if (map.has(dogId)) return map.get(dogId)!
      if (visited.has(dogId)) return new Set()

      visited.add(dogId)
      const descendants = new Set<string>()

      dogsWithLineage.forEach(d => {
        if (d.sire_id === dogId || d.dam_id === dogId) {
          descendants.add(d.id)
          // Recursively add this dog's descendants
          const childDescendants = getDescendants(d.id, visited)
          childDescendants.forEach(id => descendants.add(id))
        }
      })

      map.set(dogId, descendants)
      return descendants
    }

    dogsWithLineage.forEach(dog => getDescendants(dog.id))
    return map
  }, [dogsWithLineage])

  // Compute which dogs should be hidden due to collapsed ancestors
  const hiddenDueToCollapse = useMemo(() => {
    const hidden = new Set<string>()
    collapsedDogIds.forEach(collapsedId => {
      const descendants = descendantsMap.get(collapsedId)
      if (descendants) {
        descendants.forEach(id => hidden.add(id))
      }
    })
    return hidden
  }, [collapsedDogIds, descendantsMap])
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const changedPositionsRef = useRef<Map<string, { x: number; y: number }>>(
    new Map()
  )

  // Compute available years for filter
  const availableYears = useMemo(() => {
    const years = new Set<string>()
    dogsWithLineage.forEach(dog => {
      if (dog.date_of_birth) {
        years.add(new Date(dog.date_of_birth).getFullYear().toString())
      }
    })
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))
  }, [dogsWithLineage])

  // Compute stats
  const stats = useMemo(() => {
    const totalDogs = dogsWithLineage.length
    const breedingDogs = dogsWithLineage.filter(d => d.status === 'breeding').length
    const males = dogsWithLineage.filter(d => d.gender === 'male').length
    const females = dogsWithLineage.filter(d => d.gender === 'female').length
    const totalLitters = litters.length
    return { totalDogs, breedingDogs, males, females, totalLitters }
  }, [dogsWithLineage, litters])

  // Compute relationships for hovered dog
  const hoveredRelationships = useMemo(() => {
    if (!hoveredDogId) return null
    return computeRelationships(hoveredDogId, dogsWithLineage, litters)
  }, [hoveredDogId, dogsWithLineage, litters])

  // Compute focused dog's lineage (for focus mode)
  const focusedLineage = useMemo(() => {
    if (!focusedDogId) return null
    const lineageIds = new Set<string>([focusedDogId])

    // Get all ancestors (recursive up)
    const addAncestors = (dogId: string) => {
      const dog = dogsWithLineage.find(d => d.id === dogId)
      if (!dog) return
      if (dog.sire_id) {
        lineageIds.add(dog.sire_id)
        addAncestors(dog.sire_id)
      }
      if (dog.dam_id) {
        lineageIds.add(dog.dam_id)
        addAncestors(dog.dam_id)
      }
    }
    addAncestors(focusedDogId)

    // Get direct offspring
    dogsWithLineage.forEach(d => {
      if (d.sire_id === focusedDogId || d.dam_id === focusedDogId) {
        lineageIds.add(d.id)
      }
    })

    return lineageIds
  }, [focusedDogId, dogsWithLineage])

  // Filter dogs based on active filters
  const filteredDogs = useMemo(() => {
    return dogsWithLineage.filter(dog => {
      // Collapse filter - hide descendants of collapsed dogs
      if (hiddenDueToCollapse.has(dog.id)) return false
      // Status filter
      if (statusFilter !== 'all' && dog.status !== statusFilter) return false
      // Gender filter
      if (genderFilter !== 'all' && dog.gender !== genderFilter) return false
      // Year filter
      if (yearFilter !== 'all') {
        if (!dog.date_of_birth) return false
        const year = new Date(dog.date_of_birth).getFullYear().toString()
        if (year !== yearFilter) return false
      }
      // Focus mode filter
      if (focusedLineage && !focusedLineage.has(dog.id)) return false
      return true
    })
  }, [dogsWithLineage, statusFilter, genderFilter, yearFilter, focusedLineage, hiddenDueToCollapse])

  // Build initial graph
  const { initialNodes, initialEdges } = useMemo(() => {
    // Pass empty litters array to hide litter nodes
    const littersToShow = showLitters ? litters : []
    const { nodes, edges } = buildPedigreeGraph(
      filteredDogs,
      littersToShow,
      savedPositions
    )

    // If no saved positions, compute layout
    const needsLayout = nodes.every(
      (n) => n.position.x === 0 && n.position.y === 0
    )

    if (needsLayout && nodes.length > 0) {
      const layoutedNodes = computeDagreLayout(nodes, edges)
      return { initialNodes: layoutedNodes, initialEdges: edges }
    }

    return { initialNodes: nodes, initialEdges: edges }
  }, [filteredDogs, litters, savedPositions, showLitters])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState(initialEdges)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)

  // Update highlighted node in node data
  useEffect(() => {
    if (highlightedNodeId) {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === highlightedNodeId,
          },
        }))
      )

      // Auto-clear highlight after 3 seconds
      const timeout = setTimeout(() => {
        setHighlightedNodeId(null)
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: { ...n.data, isHighlighted: false },
          }))
        )
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [highlightedNodeId, setNodes])

  // Update relationship highlighting on hover and collapse state
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.data.type !== 'dog') return n
        const dogId = n.data.dog.id

        let relationshipType: 'parent' | 'sibling' | 'offspring' | 'self' | null = null
        let isDimmed = false

        if (hoveredDogId) {
          if (dogId === hoveredDogId) {
            relationshipType = 'self'
          } else if (hoveredRelationships) {
            if (hoveredRelationships.parentIds.has(dogId)) {
              relationshipType = 'parent'
            } else if (hoveredRelationships.siblingIds.has(dogId)) {
              relationshipType = 'sibling'
            } else if (hoveredRelationships.offspringIds.has(dogId)) {
              relationshipType = 'offspring'
            } else {
              isDimmed = true
            }
          }
        }

        // Check if this dog is collapsed
        const isCollapsed = collapsedDogIds.has(dogId)

        return {
          ...n,
          data: {
            ...n.data,
            relationshipType,
            isDimmed,
            isCollapsed,
          },
        }
      })
    )
  }, [hoveredDogId, hoveredRelationships, collapsedDogIds, setNodes])

  // Handle node position changes with debounced save
  const handleNodesChange: OnNodesChange<Node<PedigreeNodeData>> = useCallback(
    (changes: NodeChange<Node<PedigreeNodeData>>[]) => {
      onNodesChange(changes)

      if (!isEditable || !onPositionsChange) return

      // Track position changes
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          changedPositionsRef.current.set(change.id, change.position)
        }
      })

      // Debounce save
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        if (changedPositionsRef.current.size > 0) {
          const positions: NodePosition[] = Array.from(
            changedPositionsRef.current.entries()
          ).map(([nodeId, pos]) => ({
            nodeId,
            x: pos.x,
            y: pos.y,
          }))

          onPositionsChange(positions)
          changedPositionsRef.current.clear()
        }
      }, 1000) // 1 second debounce
    },
    [onNodesChange, isEditable, onPositionsChange]
  )

  // Search and zoom to node
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    return nodes.filter((node) => {
      if (node.data.type === 'dog') {
        return node.data.dog.name.toLowerCase().includes(query)
      }
      // Only include litter results if showLitters is true
      if (node.data.type === 'litter' && showLitters) {
        return node.data.litter.name.toLowerCase().includes(query)
      }
      return false
    })
  }, [searchQuery, nodes, showLitters])

  const handleSearch = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      setHighlightedNodeId(nodeId)
      setSearchQuery('')

      // Zoom to node
      const zoom = getZoom()
      setCenter(
        node.position.x + 80, // Center on node
        node.position.y + 90,
        { zoom: Math.max(zoom, 1), duration: 500 }
      )
    },
    [nodes, setCenter, getZoom]
  )

  // Reset layout
  const handleResetLayout = useCallback(async () => {
    const littersToShow = showLitters ? litters : []
    const { nodes: freshNodes, edges: freshEdges } = buildPedigreeGraph(
      dogsWithLineage,
      littersToShow,
      undefined // No saved positions - force dagre layout
    )

    const layoutedNodes = computeDagreLayout(freshNodes, freshEdges)
    setNodes(layoutedNodes)
    setEdges(freshEdges)

    // Delete saved positions
    if (isEditable) {
      try {
        await fetch(`/api/pedigree/layout?viewId=${viewId}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('Failed to delete layout:', error)
      }
    }

    setTimeout(() => fitView({ duration: 500 }), 100)
  }, [dogsWithLineage, litters, setNodes, setEdges, fitView, isEditable, viewId, showLitters])

  // Handle edge changes (selection, deletion)
  const handleEdgesChange: OnEdgesChange = useCallback(
    async (changes: EdgeChange[]) => {
      // Process changes
      for (const change of changes) {
        if (change.type === 'remove' && isEditable) {
          // Find the edge being removed
          const edge = edges.find((e) => e.id === change.id)
          if (edge) {
            // Parse the edge ID to get connection info
            // Edge ID format: edge_sire_${dogId}_to_${targetId} or edge_dam_${dogId}_to_${targetId}
            const targetId = edge.target

            try {
              if (targetId.startsWith('litter_')) {
                const litterId = targetId.replace('litter_', '')
                const field = edge.type === 'sireEdge' ? 'sire_id' : 'dam_id'

                await fetch('/api/pedigree/connect', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'litter', id: litterId, field }),
                })
              } else if (targetId.startsWith('dog_')) {
                const childDogId = targetId.replace('dog_', '')
                const field = edge.type === 'sireEdge' ? 'sire_id' : 'dam_id'

                await fetch('/api/pedigree/connect', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'dog', id: childDogId, field }),
                })
              }
            } catch (error) {
              console.error('Failed to delete connection:', error)
            }
          }
        }

        if (change.type === 'select') {
          setSelectedEdge(change.selected ? change.id : null)
        }
      }

      // Apply changes to state
      onEdgesChangeBase(changes)
    },
    [edges, isEditable, onEdgesChangeBase]
  )

  // Handle new edge connections (admin only)
  const onConnect: OnConnect = useCallback(
    async (connection: Connection) => {
      if (!isEditable || !connection.source || !connection.target) return

      // Determine the source node to get gender for edge type
      const sourceNode = nodes.find((n) => n.id === connection.source)
      if (!sourceNode || sourceNode.data.type !== 'dog') return

      const isMale = sourceNode.data.dog.gender === 'male'
      const edgeType = isMale ? 'sireEdge' : 'damEdge'
      const relationshipType = isMale ? 'sire' : 'dam'

      // Determine the correct target handle based on gender
      const targetHandle = isMale ? 'sire' : 'dam'

      // Create the new edge
      const newEdge: Edge = {
        id: `edge_${relationshipType}_${connection.source}_to_${connection.target}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || 'offspring',
        targetHandle: targetHandle,
        type: edgeType,
        data: { relationshipType },
      }

      setEdges((eds) => addEdge(newEdge, eds))

      // Save to database - extract IDs
      const sourceDogId = connection.source.replace('dog_', '')
      const targetId = connection.target

      try {
        if (targetId.startsWith('litter_')) {
          // Connecting dog to litter as parent
          const litterId = targetId.replace('litter_', '')
          const field = isMale ? 'sire_id' : 'dam_id'

          await fetch('/api/pedigree/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'litter',
              litterId,
              field,
              dogId: sourceDogId,
            }),
          })
        } else if (targetId.startsWith('dog_')) {
          // Connecting dog to dog as parent
          const childDogId = targetId.replace('dog_', '')
          const field = isMale ? 'sire_id' : 'dam_id'

          await fetch('/api/pedigree/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'dog',
              childDogId,
              field,
              parentDogId: sourceDogId,
            }),
          })
        }
      } catch (error) {
        console.error('Failed to save connection:', error)
      }
    },
    [isEditable, nodes, setEdges]
  )

  // Handle node click to show dog info
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<PedigreeNodeData>) => {
      if (node.data.type === 'dog' && onDogClick) {
        onDogClick(node.data.dog as Dog)
      }
    },
    [onDogClick]
  )

  // Handle node hover for relationship highlighting
  const handleNodeMouseEnter = useCallback(
    (_event: React.MouseEvent, node: Node<PedigreeNodeData>) => {
      if (node.data.type === 'dog') {
        setHoveredDogId(node.data.dog.id)
      }
    },
    []
  )

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredDogId(null)
  }, [])

  // Handle double-click to toggle collapse
  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node<PedigreeNodeData>) => {
      if (node.data.type === 'dog') {
        const dogId = node.data.dog.id
        const hasOffspring = descendantsMap.get(dogId)?.size ?? 0 > 0

        if (hasOffspring) {
          setCollapsedDogIds(prev => {
            const next = new Set(prev)
            if (next.has(dogId)) {
              next.delete(dogId)
            } else {
              next.add(dogId)
            }
            return next
          })
        }
      }
    },
    [descendantsMap]
  )

  // Handle focus mode
  const handleFocusDog = useCallback(
    (dogId: string) => {
      setFocusedDogId(dogId)
      // Zoom to the focused dog
      const node = nodes.find(n => n.id === `dog_${dogId}`)
      if (node) {
        setTimeout(() => {
          setCenter(node.position.x + 80, node.position.y + 90, {
            zoom: 1,
            duration: 500,
          })
        }, 100)
      }
    },
    [nodes, setCenter]
  )

  const handleExitFocus = useCallback(() => {
    setFocusedDogId(null)
    setTimeout(() => fitView({ duration: 500 }), 100)
  }, [fitView])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setStatusFilter('all')
    setGenderFilter('all')
    setYearFilter('all')
    setFocusedDogId(null)
  }, [])

  const hasActiveFilters = statusFilter !== 'all' || genderFilter !== 'all' || yearFilter !== 'all' || focusedDogId !== null

  // Fit view on mount
  useEffect(() => {
    setTimeout(() => fitView({ duration: 300 }), 100)
  }, [fitView])

  return (
    <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] w-full rounded-lg border border-neutral-200 bg-neutral-50">
      {/* Search Bar - Compact on mobile */}
      <div className="absolute left-2 sm:left-4 top-2 sm:top-4 z-10 w-40 sm:w-64">
        <div className="relative">
          <input
            type="text"
            placeholder={showLitters ? "Search..." : "Search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-2 sm:px-4 py-1.5 sm:py-2 pr-8 sm:pr-10 text-xs sm:text-sm shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
          <svg
            className="absolute right-2 sm:right-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg">
            {searchResults.slice(0, 5).map((node) => (
              <button
                key={node.id}
                onClick={() => handleSearch(node.id)}
                className="flex w-full items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-amber-50"
              >
                {node.data.type === 'dog' ? (
                  <>
                    <span
                      className={cn(
                        'text-xs',
                        node.data.dog.gender === 'male'
                          ? 'text-blue-500'
                          : 'text-pink-500'
                      )}
                    >
                      {node.data.dog.gender === 'male' ? '♂' : '♀'}
                    </span>
                    <span className="truncate">{node.data.dog.name}</span>
                  </>
                ) : (
                  <>
                    <span className="text-amber-500">🐕</span>
                    <span className="truncate">{node.data.litter.name}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reset Layout Button - Hidden on mobile, shown via long-press or menu */}
      {isEditable && (
        <div className="absolute right-2 sm:right-4 top-14 sm:top-4 z-10">
          <button
            onClick={handleResetLayout}
            className="rounded-lg bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium text-neutral-700 shadow-sm border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <span className="hidden sm:inline">Reset Layout</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>
      )}

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={isEditable}
        nodesConnectable={isEditable}
        edgesReconnectable={false}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={isEditable ? ['Backspace', 'Delete'] : null}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: false,
        }}
        connectionLineStyle={{ stroke: '#fbbf24', strokeWidth: 2 }}
      >
        <Background color="#e5e5e5" gap={20} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as PedigreeNodeData | undefined
            if (data?.type === 'litter') return '#fbbf24'
            if (data?.type === 'dog') {
              return data.dog?.gender === 'male' ? '#60a5fa' : '#f472b6'
            }
            return '#9ca3af'
          }}
          maskColor="rgba(255, 251, 245, 0.8)"
          className="!bg-white !border-neutral-200"
        />
      </ReactFlow>

      {/* Quick Stats Panel - Compact on mobile */}
      <div className="absolute top-4 right-4 z-10 rounded-lg bg-white/95 px-2 py-1.5 text-[10px] sm:px-3 sm:py-2 sm:text-xs shadow-sm backdrop-blur-sm border border-neutral-200">
        <div className="hidden sm:flex items-center gap-1 text-neutral-500 font-medium border-b border-neutral-100 pb-1 mb-1">
          <Info className="h-3 w-3" />
          <span>Stats</span>
        </div>
        <div className="flex gap-2 sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-0.5">
          <span className="font-medium text-neutral-700">{stats.totalDogs}<span className="text-neutral-400 ml-0.5 hidden sm:inline">dogs</span></span>
          <span className="font-medium text-blue-600">{stats.males}<span className="text-blue-400">♂</span></span>
          <span className="font-medium text-pink-600">{stats.females}<span className="text-pink-400">♀</span></span>
          <span className="hidden sm:inline text-neutral-500">Breeding:</span>
          <span className="hidden sm:inline font-medium text-green-600">{stats.breedingDogs}</span>
          <span className="hidden sm:inline text-neutral-500">Litters:</span>
          <span className="hidden sm:inline font-medium text-amber-600">{stats.totalLitters}</span>
        </div>
      </div>

      {/* Filter Controls - Compact on mobile */}
      <div className="absolute left-2 sm:left-4 top-10 sm:top-16 z-10">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium shadow-sm border transition-colors",
            hasActiveFilters
              ? "bg-amber-50 border-amber-300 text-amber-700"
              : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          )}
        >
          <Funnel className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] sm:text-[10px] text-white">
              {(statusFilter !== 'all' ? 1 : 0) + (genderFilter !== 'all' ? 1 : 0) + (yearFilter !== 'all' ? 1 : 0) + (focusedDogId ? 1 : 0)}
            </span>
          )}
          {showFilters ? <CaretUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <CaretDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
        </button>

        {showFilters && (
          <div className="absolute mt-1 w-48 sm:w-56 rounded-lg border border-neutral-200 bg-white p-2 sm:p-3 shadow-lg text-[10px] sm:text-xs">
            {/* Status Filter */}
            <div className="mb-2 sm:mb-3">
              <label className="block font-medium text-neutral-600 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full rounded border border-neutral-200 px-2 py-1 focus:border-amber-400 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="breeding">Breeding</option>
                <option value="retired">Retired</option>
                <option value="available">Available</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div className="mb-2 sm:mb-3">
              <label className="block font-medium text-neutral-600 mb-1">Gender</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setGenderFilter('all')}
                  className={cn(
                    "flex-1 rounded px-1.5 sm:px-2 py-1 transition-colors",
                    genderFilter === 'all' ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setGenderFilter('male')}
                  className={cn(
                    "flex-1 rounded px-1.5 sm:px-2 py-1 transition-colors flex items-center justify-center gap-0.5",
                    genderFilter === 'male' ? "bg-blue-100 text-blue-700" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  <GenderMale className="h-3 w-3" /> <span className="hidden sm:inline">Male</span><span className="sm:hidden">M</span>
                </button>
                <button
                  onClick={() => setGenderFilter('female')}
                  className={cn(
                    "flex-1 rounded px-1.5 sm:px-2 py-1 transition-colors flex items-center justify-center gap-0.5",
                    genderFilter === 'female' ? "bg-pink-100 text-pink-700" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  <GenderFemale className="h-3 w-3" /> <span className="hidden sm:inline">Female</span><span className="sm:hidden">F</span>
                </button>
              </div>
            </div>

            {/* Year Filter */}
            {availableYears.length > 0 && (
              <div className="mb-2 sm:mb-3">
                <label className="block font-medium text-neutral-600 mb-1">Birth Year</label>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full rounded border border-neutral-200 px-2 py-1 focus:border-amber-400 focus:outline-none"
                >
                  <option value="all">All Years</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full rounded bg-neutral-100 px-2 py-1 sm:py-1.5 font-medium text-neutral-600 hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Active Filter Pills - More compact on mobile */}
      {hasActiveFilters && (
        <div className="absolute left-2 sm:left-4 top-[4.5rem] sm:top-28 z-10 flex flex-wrap gap-1">
          {focusedDogId && (
            <button
              onClick={handleExitFocus}
              className="flex items-center gap-0.5 rounded-full bg-purple-100 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-xs text-purple-700 hover:bg-purple-200 transition-colors"
            >
              <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">Focus</span>
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
          )}
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-xs text-green-700 hover:bg-green-200 transition-colors"
            >
              {statusFilter}
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
          )}
          {genderFilter !== 'all' && (
            <button
              onClick={() => setGenderFilter('all')}
              className={cn(
                "flex items-center gap-0.5 rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-xs transition-colors",
                genderFilter === 'male' ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-pink-100 text-pink-700 hover:bg-pink-200"
              )}
            >
              {genderFilter === 'male' ? <GenderMale className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <GenderFemale className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
              <span className="hidden sm:inline">{genderFilter}</span>
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
          )}
          {yearFilter !== 'all' && (
            <button
              onClick={() => setYearFilter('all')}
              className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-xs text-amber-700 hover:bg-amber-200 transition-colors"
            >
              {yearFilter}
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
          )}
        </div>
      )}

      {/* Enhanced Legend - Compact on mobile, positioned top center */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 sm:top-4 z-10">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="flex items-center gap-1 text-[10px] sm:text-xs text-neutral-500 hover:text-neutral-700 mb-1"
        >
          {showLegend ? <CaretDown className="h-3 w-3" /> : <CaretUp className="h-3 w-3" />}
          Legend
        </button>
        {showLegend && (
          <div className="rounded-lg bg-white/95 px-2 py-1.5 sm:px-3 sm:py-2.5 text-[10px] sm:text-xs shadow-sm backdrop-blur-sm border border-neutral-200 max-w-[160px] sm:max-w-none">
            {/* Mobile: Compact single-row layout */}
            <div className="sm:hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-0.5">
                  <GenderMale className="h-2.5 w-2.5 text-blue-500" />
                  <span className="text-neutral-500">M</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <GenderFemale className="h-2.5 w-2.5 text-pink-500" />
                  <span className="text-neutral-500">F</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <div className="h-0.5 w-3 bg-blue-400" />
                  <span className="text-neutral-500">Sire</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <div className="h-0.5 w-3 border-t border-dashed border-pink-400" />
                  <span className="text-neutral-500">Dam</span>
                </div>
              </div>
              <div className="text-neutral-400 mt-1 text-[9px]">
                Tap for info • Pinch to zoom
              </div>
            </div>

            {/* Desktop: Full layout */}
            <div className="hidden sm:block">
              {/* Gender Section */}
              <div className="mb-2">
                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mb-1">Gender</div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <GenderMale className="h-2.5 w-2.5 text-blue-500" />
                    </div>
                    <span className="text-neutral-600">Male</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded-full bg-pink-100 flex items-center justify-center">
                      <GenderFemale className="h-2.5 w-2.5 text-pink-500" />
                    </div>
                    <span className="text-neutral-600">Female</span>
                  </div>
                </div>
              </div>

              {/* Lines Section */}
              <div className="mb-2">
                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mb-1">Connections</div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="h-0.5 w-5 rounded-full bg-blue-400" />
                    <span className="text-neutral-600">Sire</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-0.5 w-5 border-t-2 border-dashed border-pink-400" />
                    <span className="text-neutral-600">Dam</span>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="mb-2">
                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mb-1">Status</div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-neutral-600">Breeding</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-neutral-400" />
                    <span className="text-neutral-600">Retired</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-neutral-600">Available</span>
                  </div>
                </div>
              </div>

              {/* Hover Highlighting Section */}
              <div className="mb-2">
                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mb-1">Hover Highlights</div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded border-2 border-amber-400 bg-amber-50" />
                    <span className="text-neutral-600">Parents</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded border-2 border-purple-400 bg-purple-50" />
                    <span className="text-neutral-600">Siblings</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded border-2 border-green-400 bg-green-50" />
                    <span className="text-neutral-600">Offspring</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-neutral-500 border-t border-neutral-200 pt-1.5 mt-1.5">
                {isEditable ? (
                  <>Drag to move • Click line + Delete to remove • Double-click to collapse</>
                ) : (
                  <>Click for details • Double-click to collapse/expand • Hover for relatives</>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Wrapper component with ReactFlowProvider
export function PedigreeCanvas(props: PedigreeCanvasProps) {
  const [savedPositions, setSavedPositions] = useState<
    Map<string, { x: number; y: number }>
  >(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null)
  const [focusDogId, setFocusDogId] = useState<string | null>(null)

  // Fetch saved positions on mount
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch(
          `/api/pedigree/layout?viewId=${props.viewId || 'default'}`
        )
        if (response.ok) {
          const data = await response.json()
          const posMap = new Map<string, { x: number; y: number }>()
          data.positions?.forEach(
            (pos: { nodeId: string; x: number; y: number }) => {
              posMap.set(pos.nodeId, { x: pos.x, y: pos.y })
            }
          )
          setSavedPositions(posMap)
        }
      } catch (error) {
        console.error('Failed to fetch positions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPositions()
  }, [props.viewId])

  // Save positions to API
  const handlePositionsChange = useCallback(
    async (positions: NodePosition[]) => {
      try {
        await fetch('/api/pedigree/layout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            viewId: props.viewId || 'default',
            positions,
          }),
        })
      } catch (error) {
        console.error('Failed to save positions:', error)
      }
    },
    [props.viewId]
  )

  if (isLoading) {
    return (
      <div className="flex h-[400px] sm:h-[500px] lg:h-[600px] w-full items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
        <div className="flex items-center gap-2 text-neutral-500">
          <svg
            className="h-5 w-5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading pedigree...
        </div>
      </div>
    )
  }

  return (
    <>
      <ReactFlowProvider>
        <PedigreeCanvasInner
          {...props}
          savedPositions={savedPositions}
          onPositionsChange={props.isEditable ? handlePositionsChange : undefined}
          onDogClick={setSelectedDog}
          externalFocusDogId={focusDogId}
          onExternalFocusChange={setFocusDogId}
        />
      </ReactFlowProvider>

      {/* Dog Info Modal */}
      <DogInfoModal
        dog={selectedDog}
        allDogs={props.dogsWithLineage as Dog[]}
        isEditable={props.isEditable}
        onClose={() => setSelectedDog(null)}
        onFocus={(dogId) => {
          setFocusDogId(dogId)
        }}
      />
    </>
  )
}
