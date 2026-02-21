'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Dog, DogInsert, DogUpdate, Litter, LitterInsert, LitterUpdate, Puppy } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface LitterWithRelations extends Litter {
  sire: Dog | null
  dam: Dog | null
  puppies: Puppy[]
}

type UndoAction =
  | { type: 'assign_sire'; litterId: string; previousSireId: string | null }
  | { type: 'assign_dam'; litterId: string; previousDamId: string | null }
  | { type: 'create_litter'; litterId: string }
  | { type: 'delete_litter'; litter: Litter }
  | { type: 'create_dog'; dogId: string }
  | { type: 'delete_dog'; dog: Dog }
  | { type: 'update_dog'; dogId: string; previousData: Partial<Dog> }
  | { type: 'update_litter'; litterId: string; previousData: Partial<Litter> }

interface FamilyTreeContextType {
  dogs: Dog[]
  litters: LitterWithRelations[]
  editingDog: Dog | null
  editingLitter: LitterWithRelations | null
  isModalOpen: boolean
  isSaving: boolean
  error: string | null
  canUndo: boolean
  setEditingDog: (dog: Dog | null) => void
  setEditingLitter: (litter: LitterWithRelations | null) => void
  closeModal: () => void
  assignSireToLitter: (dogId: string, litterId: string) => Promise<void>
  assignDamToLitter: (dogId: string, litterId: string) => Promise<void>
  removeSireFromLitter: (litterId: string) => Promise<void>
  removeDamFromLitter: (litterId: string) => Promise<void>
  createLitterWithDog: (dogId: string) => Promise<void>
  createDog: (data: DogInsert) => Promise<Dog | null>
  updateDog: (id: string, data: DogUpdate) => Promise<void>
  deleteDog: (id: string) => Promise<void>
  createLitter: (data: LitterInsert) => Promise<Litter | null>
  updateLitter: (id: string, data: LitterUpdate) => Promise<void>
  deleteLitter: (id: string) => Promise<void>
  assignDogParents: (dogId: string, sireId: string | null, damId: string | null) => Promise<void>
  undo: () => Promise<void>
  reset: () => Promise<void>
  refreshData: () => Promise<void>
}

const FamilyTreeContext = createContext<FamilyTreeContextType | null>(null)

export function useFamilyTree() {
  const context = useContext(FamilyTreeContext)
  if (!context) {
    throw new Error('useFamilyTree must be used within FamilyTreeProvider')
  }
  return context
}

interface FamilyTreeProviderProps {
  children: ReactNode
  initialDogs: Dog[]
  initialLitters: LitterWithRelations[]
}

export function FamilyTreeProvider({
  children,
  initialDogs,
  initialLitters,
}: FamilyTreeProviderProps) {
  const [dogs, setDogs] = useState(initialDogs)
  const [litters, setLitters] = useState(initialLitters)
  const [editingDog, setEditingDog] = useState<Dog | null>(null)
  const [editingLitter, setEditingLitter] = useState<LitterWithRelations | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [undoStack, setUndoStack] = useState<UndoAction[]>([])

  const isModalOpen = editingDog !== null || editingLitter !== null
  const canUndo = undoStack.length > 0

  const closeModal = useCallback(() => {
    setEditingDog(null)
    setEditingLitter(null)
    setError(null)
  }, [])

  const refreshData = useCallback(async () => {
    const supabase = createClient()

    const [dogsResult, littersResult] = await Promise.all([
      supabase
        .from('dogs')
        .select('*')
        .in('status', ['available', 'breeding', 'retired'])
        .order('name'),
      supabase
        .from('litters')
        .select(`
          *,
          sire:dogs!litters_sire_id_fkey(*),
          dam:dogs!litters_dam_id_fkey(*),
          puppies(*)
        `)
        .order('date_of_birth', { ascending: false })
    ])

    if (dogsResult.data) setDogs(dogsResult.data as Dog[])
    if (littersResult.data) setLitters(littersResult.data as LitterWithRelations[])
  }, [])

  // Subscribe to realtime changes for cross-device sync
  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    channel = supabase
      .channel('family-tree-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dogs' },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'litters' },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'puppies' },
        () => refreshData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshData])

  // Optimistic update helper for litters
  const updateLitterOptimistically = useCallback((litterId: string, updates: Partial<LitterWithRelations>) => {
    setLitters(prev => prev.map(l =>
      l.id === litterId ? { ...l, ...updates } : l
    ))
  }, [])

  const assignSireToLitter = useCallback(async (dogId: string, litterId: string) => {
    const dog = dogs.find(d => d.id === dogId)
    if (!dog || dog.gender !== 'male') {
      setError('Only male dogs can be assigned as sire')
      return
    }

    const litter = litters.find(l => l.id === litterId)
    const previousSireId = litter?.sire_id || null

    // Optimistic update
    updateLitterOptimistically(litterId, { sire_id: dogId, sire: dog })

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('litters')
        .update({ sire_id: dogId } as never)
        .eq('id', litterId)

      if (updateError) throw updateError
      setUndoStack(prev => [...prev, { type: 'assign_sire', litterId, previousSireId }])
    } catch (err) {
      // Revert optimistic update on error
      const previousSire = dogs.find(d => d.id === previousSireId) || null
      updateLitterOptimistically(litterId, { sire_id: previousSireId, sire: previousSire })
      setError(err instanceof Error ? err.message : 'Failed to assign sire')
    } finally {
      setIsSaving(false)
    }
  }, [dogs, litters, updateLitterOptimistically])

  const assignDamToLitter = useCallback(async (dogId: string, litterId: string) => {
    const dog = dogs.find(d => d.id === dogId)
    if (!dog || dog.gender !== 'female') {
      setError('Only female dogs can be assigned as dam')
      return
    }

    const litter = litters.find(l => l.id === litterId)
    const previousDamId = litter?.dam_id || null

    // Optimistic update
    updateLitterOptimistically(litterId, { dam_id: dogId, dam: dog })

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('litters')
        .update({ dam_id: dogId } as never)
        .eq('id', litterId)

      if (updateError) throw updateError
      setUndoStack(prev => [...prev, { type: 'assign_dam', litterId, previousDamId }])
    } catch (err) {
      // Revert optimistic update on error
      const previousDam = dogs.find(d => d.id === previousDamId) || null
      updateLitterOptimistically(litterId, { dam_id: previousDamId, dam: previousDam })
      setError(err instanceof Error ? err.message : 'Failed to assign dam')
    } finally {
      setIsSaving(false)
    }
  }, [dogs, litters, updateLitterOptimistically])

  const removeSireFromLitter = useCallback(async (litterId: string) => {
    const litter = litters.find(l => l.id === litterId)
    const previousSireId = litter?.sire_id || null
    const previousSire = litter?.sire || null

    // Optimistic update
    updateLitterOptimistically(litterId, { sire_id: null, sire: null })

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('litters')
        .update({ sire_id: null } as never)
        .eq('id', litterId)

      if (updateError) throw updateError
      setUndoStack(prev => [...prev, { type: 'assign_sire', litterId, previousSireId }])
    } catch (err) {
      // Revert optimistic update on error
      updateLitterOptimistically(litterId, { sire_id: previousSireId, sire: previousSire })
      setError(err instanceof Error ? err.message : 'Failed to remove sire')
    } finally {
      setIsSaving(false)
    }
  }, [litters, updateLitterOptimistically])

  const removeDamFromLitter = useCallback(async (litterId: string) => {
    const litter = litters.find(l => l.id === litterId)
    const previousDamId = litter?.dam_id || null
    const previousDam = litter?.dam || null

    // Optimistic update
    updateLitterOptimistically(litterId, { dam_id: null, dam: null })

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('litters')
        .update({ dam_id: null } as never)
        .eq('id', litterId)

      if (updateError) throw updateError
      setUndoStack(prev => [...prev, { type: 'assign_dam', litterId, previousDamId }])
    } catch (err) {
      // Revert optimistic update on error
      updateLitterOptimistically(litterId, { dam_id: previousDamId, dam: previousDam })
      setError(err instanceof Error ? err.message : 'Failed to remove dam')
    } finally {
      setIsSaving(false)
    }
  }, [litters, updateLitterOptimistically])

  const createLitterWithDog = useCallback(async (dogId: string) => {
    const dog = dogs.find(d => d.id === dogId)
    if (!dog) {
      setError('Dog not found')
      return
    }

    setIsSaving(true)
    setError(null)

    const litterName = `New Litter ${new Date().toLocaleDateString()}`
    const tempId = `temp-${Date.now()}`

    // Optimistic update - add temporary litter
    const tempLitter: LitterWithRelations = {
      id: tempId,
      name: litterName,
      sire_id: dog.gender === 'male' ? dogId : null,
      dam_id: dog.gender === 'female' ? dogId : null,
      sire: dog.gender === 'male' ? dog : null,
      dam: dog.gender === 'female' ? dog : null,
      custom_sire_name: null,
      custom_dam_name: null,
      status: 'expected',
      expected_date: null,
      date_of_birth: null,
      description: null,
      puppy_count: null,
      available_count: null,
      image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      puppies: [],
    }
    setLitters(prev => [tempLitter, ...prev])

    try {
      const supabase = createClient()
      const { data, error: insertError } = await supabase
        .from('litters')
        .insert({
          name: litterName,
          sire_id: dog.gender === 'male' ? dogId : null,
          dam_id: dog.gender === 'female' ? dogId : null,
          status: 'expected',
        } as never)
        .select()
        .single()

      if (insertError) throw insertError
      if (data) {
        // Replace temp litter with real one
        setLitters(prev => prev.map(l =>
          l.id === tempId ? { ...tempLitter, id: (data as Litter).id } : l
        ))
        setUndoStack(prev => [...prev, { type: 'create_litter', litterId: (data as Litter).id }])
      }
    } catch (err) {
      // Remove temp litter on error
      setLitters(prev => prev.filter(l => l.id !== tempId))
      setError(err instanceof Error ? err.message : 'Failed to create litter')
    } finally {
      setIsSaving(false)
    }
  }, [dogs])

  const createDog = useCallback(async (data: DogInsert): Promise<Dog | null> => {
    setIsSaving(true)
    setError(null)

    const tempId = `temp-${Date.now()}`
    const tempDog: Dog = {
      id: tempId,
      name: data.name,
      slug: data.slug,
      gender: data.gender,
      color: data.color,
      date_of_birth: data.date_of_birth || null,
      status: data.status || 'breeding',
      ownership_type: data.ownership_type || 'owned',
      owner_name: data.owner_name || null,
      is_fluffy: data.is_fluffy || false,
      bio: data.bio || null,
      health_testing: data.health_testing || null,
      image_url: data.image_url || null,
      gallery_urls: data.gallery_urls || [],
      sire_id: data.sire_id || null,
      dam_id: data.dam_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Optimistic update
    setDogs(prev => [...prev, tempDog].sort((a, b) => a.name.localeCompare(b.name)))

    try {
      const supabase = createClient()
      const { data: newDog, error: insertError } = await supabase
        .from('dogs')
        .insert(data as never)
        .select()
        .single()

      if (insertError) throw insertError
      if (newDog) {
        // Replace temp dog with real one
        setDogs(prev => prev.map(d =>
          d.id === tempId ? (newDog as Dog) : d
        ).sort((a, b) => a.name.localeCompare(b.name)))
        setUndoStack(prev => [...prev, { type: 'create_dog', dogId: (newDog as Dog).id }])
        return newDog as Dog
      }
      return null
    } catch (err) {
      // Remove temp dog on error
      setDogs(prev => prev.filter(d => d.id !== tempId))
      setError(err instanceof Error ? err.message : 'Failed to create dog')
      return null
    } finally {
      setIsSaving(false)
    }
  }, [])

  const updateDog = useCallback(async (id: string, data: DogUpdate) => {
    const dog = dogs.find(d => d.id === id)
    if (!dog) {
      setError('Dog not found')
      return
    }

    const previousData: Partial<Dog> = {}
    Object.keys(data).forEach(key => {
      previousData[key as keyof Dog] = dog[key as keyof Dog] as never
    })

    // Optimistic update
    setDogs(prev => prev.map(d =>
      d.id === id ? { ...d, ...data } : d
    ))

    // Also update litters that reference this dog
    setLitters(prev => prev.map(l => {
      if (l.sire_id === id) {
        return { ...l, sire: { ...l.sire!, ...data } as Dog }
      }
      if (l.dam_id === id) {
        return { ...l, dam: { ...l.dam!, ...data } as Dog }
      }
      return l
    }))

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('dogs')
        .update(data as never)
        .eq('id', id)

      if (updateError) throw updateError
      setUndoStack(prev => [...prev, { type: 'update_dog', dogId: id, previousData }])
      closeModal()
    } catch (err) {
      // Revert optimistic update
      setDogs(prev => prev.map(d =>
        d.id === id ? { ...d, ...previousData } : d
      ))
      setError(err instanceof Error ? err.message : 'Failed to update dog')
    } finally {
      setIsSaving(false)
    }
  }, [dogs, closeModal])

  const deleteDog = useCallback(async (id: string) => {
    const dog = dogs.find(d => d.id === id)
    if (!dog) {
      setError('Dog not found')
      return
    }

    // Optimistic update - remove dog
    setDogs(prev => prev.filter(d => d.id !== id))

    // Also remove from litters
    setLitters(prev => prev.map(l => {
      const updates: Partial<LitterWithRelations> = {}
      if (l.sire_id === id) {
        updates.sire_id = null
        updates.sire = null
      }
      if (l.dam_id === id) {
        updates.dam_id = null
        updates.dam = null
      }
      return Object.keys(updates).length > 0 ? { ...l, ...updates } : l
    }))

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('dogs')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setUndoStack(prev => [...prev, { type: 'delete_dog', dog }])
      closeModal()
    } catch (err) {
      // Revert optimistic update - add dog back
      setDogs(prev => [...prev, dog].sort((a, b) => a.name.localeCompare(b.name)))
      setError(err instanceof Error ? err.message : 'Failed to delete dog')
    } finally {
      setIsSaving(false)
    }
  }, [dogs, closeModal])

  const createLitter = useCallback(async (data: LitterInsert): Promise<Litter | null> => {
    setIsSaving(true)
    setError(null)

    const tempId = `temp-${Date.now()}`
    const tempLitter: LitterWithRelations = {
      id: tempId,
      name: data.name,
      sire_id: data.sire_id || null,
      dam_id: data.dam_id || null,
      sire: dogs.find(d => d.id === data.sire_id) || null,
      dam: dogs.find(d => d.id === data.dam_id) || null,
      custom_sire_name: data.custom_sire_name || null,
      custom_dam_name: data.custom_dam_name || null,
      status: data.status || 'expected',
      expected_date: data.expected_date || null,
      date_of_birth: data.date_of_birth || null,
      description: data.description || null,
      puppy_count: data.puppy_count || null,
      available_count: data.available_count || null,
      image_url: data.image_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      puppies: [],
    }

    // Optimistic update
    setLitters(prev => [tempLitter, ...prev])

    try {
      const supabase = createClient()
      const { data: newLitter, error: insertError } = await supabase
        .from('litters')
        .insert(data as never)
        .select()
        .single()

      if (insertError) throw insertError
      if (newLitter) {
        // Replace temp litter with real one
        setLitters(prev => prev.map(l =>
          l.id === tempId ? { ...tempLitter, id: (newLitter as Litter).id } : l
        ))
        setUndoStack(prev => [...prev, { type: 'create_litter', litterId: (newLitter as Litter).id }])
        return newLitter as Litter
      }
      return null
    } catch (err) {
      // Remove temp litter on error
      setLitters(prev => prev.filter(l => l.id !== tempId))
      setError(err instanceof Error ? err.message : 'Failed to create litter')
      return null
    } finally {
      setIsSaving(false)
    }
  }, [dogs])

  const updateLitter = useCallback(async (id: string, data: LitterUpdate) => {
    const litter = litters.find(l => l.id === id)
    if (!litter) {
      setError('Litter not found')
      return
    }

    const previousData: Partial<Litter> = {}
    Object.keys(data).forEach(key => {
      previousData[key as keyof Litter] = litter[key as keyof Litter] as never
    })

    // Optimistic update
    const newSire = data.sire_id !== undefined
      ? (data.sire_id ? dogs.find(d => d.id === data.sire_id) || null : null)
      : litter.sire
    const newDam = data.dam_id !== undefined
      ? (data.dam_id ? dogs.find(d => d.id === data.dam_id) || null : null)
      : litter.dam

    setLitters(prev => prev.map(l =>
      l.id === id ? { ...l, ...data, sire: newSire, dam: newDam } : l
    ))

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('litters')
        .update(data as never)
        .eq('id', id)

      if (updateError) throw updateError
      setUndoStack(prev => [...prev, { type: 'update_litter', litterId: id, previousData }])
      closeModal()
    } catch (err) {
      // Revert optimistic update
      setLitters(prev => prev.map(l =>
        l.id === id ? { ...l, ...previousData, sire: litter.sire, dam: litter.dam } : l
      ))
      setError(err instanceof Error ? err.message : 'Failed to update litter')
    } finally {
      setIsSaving(false)
    }
  }, [dogs, litters, closeModal])

  const deleteLitter = useCallback(async (id: string) => {
    const litter = litters.find(l => l.id === id)
    if (!litter) {
      setError('Litter not found')
      return
    }

    // Optimistic update - remove litter
    setLitters(prev => prev.filter(l => l.id !== id))

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('litters')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setUndoStack(prev => [...prev, { type: 'delete_litter', litter }])
      closeModal()
    } catch (err) {
      // Revert optimistic update - add litter back
      setLitters(prev => [...prev, litter])
      setError(err instanceof Error ? err.message : 'Failed to delete litter')
    } finally {
      setIsSaving(false)
    }
  }, [litters, closeModal])

  const assignDogParents = useCallback(async (dogId: string, sireId: string | null, damId: string | null) => {
    const dog = dogs.find(d => d.id === dogId)
    if (!dog) {
      setError('Dog not found')
      return
    }

    const previousData: Partial<Dog> = {
      sire_id: dog.sire_id,
      dam_id: dog.dam_id,
    }

    // Optimistic update
    setDogs(prev => prev.map(d =>
      d.id === dogId ? { ...d, sire_id: sireId, dam_id: damId } : d
    ))

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('dogs')
        .update({ sire_id: sireId, dam_id: damId } as never)
        .eq('id', dogId)

      if (updateError) throw updateError
      setUndoStack(prev => [...prev, { type: 'update_dog', dogId, previousData }])
    } catch (err) {
      // Revert optimistic update
      setDogs(prev => prev.map(d =>
        d.id === dogId ? { ...d, ...previousData } : d
      ))
      setError(err instanceof Error ? err.message : 'Failed to assign parents')
    } finally {
      setIsSaving(false)
    }
  }, [dogs])

  const undo = useCallback(async () => {
    if (undoStack.length === 0) return

    const lastAction = undoStack[undoStack.length - 1]
    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      if (lastAction.type === 'assign_sire') {
        const previousSire = dogs.find(d => d.id === lastAction.previousSireId) || null
        updateLitterOptimistically(lastAction.litterId, {
          sire_id: lastAction.previousSireId,
          sire: previousSire
        })
        const { error: updateError } = await supabase
          .from('litters')
          .update({ sire_id: lastAction.previousSireId } as never)
          .eq('id', lastAction.litterId)
        if (updateError) throw updateError
      } else if (lastAction.type === 'assign_dam') {
        const previousDam = dogs.find(d => d.id === lastAction.previousDamId) || null
        updateLitterOptimistically(lastAction.litterId, {
          dam_id: lastAction.previousDamId,
          dam: previousDam
        })
        const { error: updateError } = await supabase
          .from('litters')
          .update({ dam_id: lastAction.previousDamId } as never)
          .eq('id', lastAction.litterId)
        if (updateError) throw updateError
      } else if (lastAction.type === 'create_litter') {
        setLitters(prev => prev.filter(l => l.id !== lastAction.litterId))
        const { error: deleteError } = await supabase
          .from('litters')
          .delete()
          .eq('id', lastAction.litterId)
        if (deleteError) throw deleteError
      } else if (lastAction.type === 'delete_litter') {
        const { sire, dam, puppies, ...litterData } = lastAction.litter as LitterWithRelations
        setLitters(prev => [...prev, lastAction.litter as LitterWithRelations])
        const { error: insertError } = await supabase
          .from('litters')
          .insert(litterData as never)
        if (insertError) throw insertError
      } else if (lastAction.type === 'create_dog') {
        setDogs(prev => prev.filter(d => d.id !== lastAction.dogId))
        const { error: deleteError } = await supabase
          .from('dogs')
          .delete()
          .eq('id', lastAction.dogId)
        if (deleteError) throw deleteError
      } else if (lastAction.type === 'delete_dog') {
        setDogs(prev => [...prev, lastAction.dog].sort((a, b) => a.name.localeCompare(b.name)))
        const { error: insertError } = await supabase
          .from('dogs')
          .insert(lastAction.dog as never)
        if (insertError) throw insertError
      } else if (lastAction.type === 'update_dog') {
        setDogs(prev => prev.map(d =>
          d.id === lastAction.dogId ? { ...d, ...lastAction.previousData } : d
        ))
        const { error: updateError } = await supabase
          .from('dogs')
          .update(lastAction.previousData as never)
          .eq('id', lastAction.dogId)
        if (updateError) throw updateError
      } else if (lastAction.type === 'update_litter') {
        setLitters(prev => prev.map(l =>
          l.id === lastAction.litterId ? { ...l, ...lastAction.previousData } : l
        ))
        const { error: updateError } = await supabase
          .from('litters')
          .update(lastAction.previousData as never)
          .eq('id', lastAction.litterId)
        if (updateError) throw updateError
      }

      setUndoStack(prev => prev.slice(0, -1))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to undo')
      await refreshData() // Refresh to get consistent state
    } finally {
      setIsSaving(false)
    }
  }, [undoStack, dogs, updateLitterOptimistically, refreshData])

  const reset = useCallback(async () => {
    if (undoStack.length === 0) return

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      for (let i = undoStack.length - 1; i >= 0; i--) {
        const action = undoStack[i]

        if (action.type === 'assign_sire') {
          await supabase
            .from('litters')
            .update({ sire_id: action.previousSireId } as never)
            .eq('id', action.litterId)
        } else if (action.type === 'assign_dam') {
          await supabase
            .from('litters')
            .update({ dam_id: action.previousDamId } as never)
            .eq('id', action.litterId)
        } else if (action.type === 'create_litter') {
          await supabase
            .from('litters')
            .delete()
            .eq('id', action.litterId)
        } else if (action.type === 'delete_litter') {
          const { sire, dam, puppies, ...litterData } = action.litter as LitterWithRelations
          await supabase.from('litters').insert(litterData as never)
        } else if (action.type === 'create_dog') {
          await supabase.from('dogs').delete().eq('id', action.dogId)
        } else if (action.type === 'delete_dog') {
          await supabase.from('dogs').insert(action.dog as never)
        } else if (action.type === 'update_dog') {
          await supabase.from('dogs').update(action.previousData as never).eq('id', action.dogId)
        } else if (action.type === 'update_litter') {
          await supabase.from('litters').update(action.previousData as never).eq('id', action.litterId)
        }
      }

      setUndoStack([])
      await refreshData() // Refresh to get consistent state after reset
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset')
    } finally {
      setIsSaving(false)
    }
  }, [undoStack, refreshData])

  return (
    <FamilyTreeContext.Provider
      value={{
        dogs,
        litters,
        editingDog,
        editingLitter,
        isModalOpen,
        isSaving,
        error,
        canUndo,
        setEditingDog,
        setEditingLitter,
        closeModal,
        assignSireToLitter,
        assignDamToLitter,
        removeSireFromLitter,
        removeDamFromLitter,
        createLitterWithDog,
        createDog,
        updateDog,
        deleteDog,
        createLitter,
        updateLitter,
        deleteLitter,
        assignDogParents,
        undo,
        reset,
        refreshData,
      }}
    >
      {children}
    </FamilyTreeContext.Provider>
  )
}
