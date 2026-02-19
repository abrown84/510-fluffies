import dagre from 'dagre'
import type { Node, Edge } from '@xyflow/react'
import { NODE_DIMENSIONS, type PedigreeNodeData } from '@/types/pedigree'

interface LayoutOptions {
  direction?: 'TB' | 'BT' | 'LR' | 'RL' // Top-Bottom, Bottom-Top, etc.
  nodeSpacing?: number
  rankSpacing?: number
}

/**
 * Computes generations for each dog based on ancestry depth
 * Dogs with no parents = generation 1, their offspring = generation 2, etc.
 */
export function computeGenerations(
  dogs: Array<{
    id: string
    sire_id: string | null
    dam_id: string | null
  }>
): Map<string, number> {
  const generations = new Map<string, number>()
  const dogMap = new Map(dogs.map(d => [d.id, d]))

  // Compute generation for a dog recursively
  const getGeneration = (dogId: string, visited: Set<string> = new Set()): number => {
    if (generations.has(dogId)) return generations.get(dogId)!
    if (visited.has(dogId)) return 1 // Prevent cycles

    visited.add(dogId)
    const dog = dogMap.get(dogId)
    if (!dog) return 1

    let maxParentGen = 0
    if (dog.sire_id && dogMap.has(dog.sire_id)) {
      maxParentGen = Math.max(maxParentGen, getGeneration(dog.sire_id, visited))
    }
    if (dog.dam_id && dogMap.has(dog.dam_id)) {
      maxParentGen = Math.max(maxParentGen, getGeneration(dog.dam_id, visited))
    }

    const gen = maxParentGen + 1
    generations.set(dogId, gen)
    return gen
  }

  // Compute for all dogs
  dogs.forEach(dog => getGeneration(dog.id))

  return generations
}

/**
 * Computes node positions using Dagre algorithm for hierarchical layout
 * Parents appear above children, with proper spacing
 */
export function computeDagreLayout(
  nodes: Node<PedigreeNodeData>[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node<PedigreeNodeData>[] {
  const { direction = 'TB', nodeSpacing = 50, rankSpacing = 100 } = options

  // Create a new directed graph
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: 50,
    marginy: 50,
  })

  // Add nodes to the graph
  nodes.forEach((node) => {
    const nodeType = node.data.type === 'dog' ? 'dog' : 'litter'
    const { width, height } = NODE_DIMENSIONS[nodeType]
    g.setNode(node.id, { width, height })
  })

  // Add edges to the graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  // Run the layout algorithm
  dagre.layout(g)

  // Apply computed positions to nodes
  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id)
    const nodeType = node.data.type === 'dog' ? 'dog' : 'litter'
    const { width, height } = NODE_DIMENSIONS[nodeType]

    return {
      ...node,
      position: {
        // Dagre returns center positions, convert to top-left
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    }
  })
}

/**
 * Builds nodes and edges from dog/litter data
 */
export function buildPedigreeGraph(
  dogs: Array<{
    id: string
    name: string
    sire_id: string | null
    dam_id: string | null
    sire?: { name: string } | null
    dam?: { name: string } | null
    [key: string]: unknown
  }>,
  litters: Array<{
    id: string
    sire_id: string | null
    dam_id: string | null
    sire: unknown | null
    dam: unknown | null
    puppies: Array<{ id: string; [key: string]: unknown }>
    [key: string]: unknown
  }>,
  savedPositions?: Map<string, { x: number; y: number }>
): {
  nodes: Node<PedigreeNodeData>[]
  edges: Edge[]
} {
  const nodes: Node<PedigreeNodeData>[] = []
  const edges: Edge[] = []
  const dogNodeIds = new Set<string>()

  // Build a map of dog id -> name for parent lookups
  const dogNames = new Map<string, string>()
  dogs.forEach(dog => dogNames.set(dog.id, dog.name))

  // Count offspring for each dog
  const offspringCounts = new Map<string, number>()
  dogs.forEach(dog => {
    if (dog.sire_id) {
      offspringCounts.set(dog.sire_id, (offspringCounts.get(dog.sire_id) || 0) + 1)
    }
    if (dog.dam_id) {
      offspringCounts.set(dog.dam_id, (offspringCounts.get(dog.dam_id) || 0) + 1)
    }
  })

  // Compute generations (once, outside loop)
  const generations = computeGenerations(dogs)

  // Create dog nodes
  dogs.forEach((dog) => {
    const nodeId = `dog_${dog.id}`
    dogNodeIds.add(nodeId)

    // Get parent names for tooltip
    const sireName = dog.sire?.name || (dog.sire_id ? dogNames.get(dog.sire_id) : undefined)
    const damName = dog.dam?.name || (dog.dam_id ? dogNames.get(dog.dam_id) : undefined)

    const savedPos = savedPositions?.get(nodeId)
    const offspringCount = offspringCounts.get(dog.id) || 0
    nodes.push({
      id: nodeId,
      type: 'dogNode',
      position: savedPos || { x: 0, y: 0 },
      data: {
        type: 'dog',
        dog: dog as never,
        parentNames: {
          sire: sireName,
          dam: damName,
        },
        offspringCount,
        generation: generations.get(dog.id) || 1,
        hasOffspring: offspringCount > 0,
      },
    })

    // Create edges from dog's parents (if stored on dog itself)
    if (dog.sire_id) {
      const sireNodeId = `dog_${dog.sire_id}`
      edges.push({
        id: `edge_sire_${dog.sire_id}_to_${dog.id}`,
        source: sireNodeId,
        target: nodeId,
        sourceHandle: 'offspring',
        targetHandle: 'sire',
        type: 'sireEdge',
        data: { relationshipType: 'sire' as const },
        animated: false,
      })
    }
    if (dog.dam_id) {
      const damNodeId = `dog_${dog.dam_id}`
      edges.push({
        id: `edge_dam_${dog.dam_id}_to_${dog.id}`,
        source: damNodeId,
        target: nodeId,
        sourceHandle: 'offspring',
        targetHandle: 'dam',
        type: 'damEdge',
        data: { relationshipType: 'dam' as const },
        animated: false,
      })
    }
  })

  // Create litter nodes
  litters.forEach((litter) => {
    const nodeId = `litter_${litter.id}`
    const savedPos = savedPositions?.get(nodeId)

    nodes.push({
      id: nodeId,
      type: 'litterNode',
      position: savedPos || { x: 0, y: 0 },
      data: {
        type: 'litter',
        litter: litter as never,
      },
    })

    // Create edges from litter's parents
    if (litter.sire_id) {
      const sireNodeId = `dog_${litter.sire_id}`
      if (dogNodeIds.has(sireNodeId)) {
        edges.push({
          id: `edge_sire_${litter.sire_id}_to_litter_${litter.id}`,
          source: sireNodeId,
          target: nodeId,
          sourceHandle: 'offspring',
          targetHandle: 'sire',
          type: 'sireEdge',
          data: { relationshipType: 'sire' as const },
          animated: false,
        })
      }
    }
    if (litter.dam_id) {
      const damNodeId = `dog_${litter.dam_id}`
      if (dogNodeIds.has(damNodeId)) {
        edges.push({
          id: `edge_dam_${litter.dam_id}_to_litter_${litter.id}`,
          source: damNodeId,
          target: nodeId,
          sourceHandle: 'offspring',
          targetHandle: 'dam',
          type: 'damEdge',
          data: { relationshipType: 'dam' as const },
          animated: false,
        })
      }
    }
  })

  return { nodes, edges }
}
