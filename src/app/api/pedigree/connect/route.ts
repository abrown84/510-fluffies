import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { LitterUpdate, DogUpdate } from '@/types/database'

interface ConnectLitterPayload {
  type: 'litter'
  litterId: string
  field: 'sire_id' | 'dam_id'
  dogId: string
}

interface ConnectDogPayload {
  type: 'dog'
  childDogId: string
  field: 'sire_id' | 'dam_id'
  parentDogId: string
}

type ConnectPayload = ConnectLitterPayload | ConnectDogPayload

// POST /api/pedigree/connect
// Saves a parent connection (dog -> litter or dog -> dog)
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: ConnectPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (body.type === 'litter') {
    // Connect dog to litter as sire or dam
    const { litterId, field, dogId } = body

    if (!litterId || !field || !dogId) {
      return NextResponse.json(
        { error: 'litterId, field, and dogId are required' },
        { status: 400 }
      )
    }

    if (field !== 'sire_id' && field !== 'dam_id') {
      return NextResponse.json(
        { error: 'field must be sire_id or dam_id' },
        { status: 400 }
      )
    }

    const updateData: LitterUpdate = field === 'sire_id' ? { sire_id: dogId } : { dam_id: dogId }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('litters')
      .update(updateData)
      .eq('id', litterId)

    if (error) {
      console.error('Error connecting dog to litter:', error)
      return NextResponse.json(
        { error: 'Failed to save connection' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, type: 'litter', litterId, field, dogId })
  }

  if (body.type === 'dog') {
    // Connect dog to dog as sire or dam (parent relationship)
    const { childDogId, field, parentDogId } = body

    if (!childDogId || !field || !parentDogId) {
      return NextResponse.json(
        { error: 'childDogId, field, and parentDogId are required' },
        { status: 400 }
      )
    }

    if (field !== 'sire_id' && field !== 'dam_id') {
      return NextResponse.json(
        { error: 'field must be sire_id or dam_id' },
        { status: 400 }
      )
    }

    const dogUpdateData: DogUpdate = field === 'sire_id' ? { sire_id: parentDogId } : { dam_id: parentDogId }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('dogs')
      .update(dogUpdateData)
      .eq('id', childDogId)

    if (error) {
      console.error('Error connecting parent to dog:', error)
      return NextResponse.json(
        { error: 'Failed to save connection' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, type: 'dog', childDogId, field, parentDogId })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}

// DELETE /api/pedigree/connect
// Removes a parent connection
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { type: 'litter' | 'dog'; id: string; field: 'sire_id' | 'dam_id' }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { type, id, field } = body

  if (!type || !id || !field) {
    return NextResponse.json(
      { error: 'type, id, and field are required' },
      { status: 400 }
    )
  }

  let error
  if (type === 'litter') {
    const litterUpdateData: LitterUpdate = field === 'sire_id' ? { sire_id: null } : { dam_id: null }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (supabase as any).from('litters').update(litterUpdateData).eq('id', id)
    error = result.error
  } else {
    const dogUpdateData: DogUpdate = field === 'sire_id' ? { sire_id: null } : { dam_id: null }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (supabase as any).from('dogs').update(dogUpdateData).eq('id', id)
    error = result.error
  }

  if (error) {
    console.error('Error removing connection:', error)
    return NextResponse.json(
      { error: 'Failed to remove connection' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, type, id, field })
}
