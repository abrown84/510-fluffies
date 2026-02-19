import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PedigreeLayoutPayload, NodePosition } from '@/types/pedigree'

// GET /api/pedigree/layout?viewId=xxx
// Returns all saved node positions for a given view
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const viewId = searchParams.get('viewId') || 'default'

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('pedigree_layouts')
    .select('node_id, x, y')
    .eq('view_id', viewId)

  if (error) {
    // If table doesn't exist yet, just return empty positions
    // This allows the app to work before the migration is applied
    console.warn('Error fetching pedigree layout (table may not exist):', error.message)
    return NextResponse.json({ viewId, positions: [] })
  }

  const positions: NodePosition[] = (data || []).map((row: { node_id: string; x: number; y: number }) => ({
    nodeId: row.node_id,
    x: row.x,
    y: row.y,
  }))

  return NextResponse.json({ viewId, positions })
}

// POST /api/pedigree/layout
// Saves node positions for a given view (upsert)
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: PedigreeLayoutPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { viewId = 'default', positions } = body

  if (!Array.isArray(positions) || positions.length === 0) {
    return NextResponse.json(
      { error: 'positions array is required' },
      { status: 400 }
    )
  }

  // Validate positions
  for (const pos of positions) {
    if (!pos.nodeId || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
      return NextResponse.json(
        { error: 'Each position must have nodeId, x, and y' },
        { status: 400 }
      )
    }
  }

  // Upsert positions
  const upsertData = positions.map((pos) => ({
    view_id: viewId,
    node_id: pos.nodeId,
    x: pos.x,
    y: pos.y,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('pedigree_layouts')
    .upsert(upsertData, {
      onConflict: 'view_id,node_id',
    })

  if (error) {
    console.error('Error saving pedigree layout:', error)
    return NextResponse.json(
      { error: 'Failed to save layout' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, viewId, count: positions.length })
}

// DELETE /api/pedigree/layout?viewId=xxx
// Clears all saved positions for a view (used for reset)
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const viewId = searchParams.get('viewId') || 'default'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('pedigree_layouts')
    .delete()
    .eq('view_id', viewId)

  if (error) {
    console.error('Error deleting pedigree layout:', error)
    return NextResponse.json(
      { error: 'Failed to delete layout' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, viewId })
}
