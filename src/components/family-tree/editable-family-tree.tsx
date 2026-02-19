'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gear, Info, ArrowCounterClockwise, ArrowsCounterClockwise, Plus, Dog as DogIcon, Baby, X, FloppyDisk, Trash, MagnifyingGlass, TreeStructure, GenderMale, GenderFemale } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { FamilyTreeProvider, useFamilyTree, type LitterWithRelations } from './family-tree-context'
import { UnifiedTree } from './unified-tree'
import { EditModal } from './edit-modal'
import { cn } from '@/lib/utils'
import type { Dog, DogWithLineage, Litter, Puppy } from '@/types/database'

interface EditableFamilyTreeProps {
  dogs: Dog[]
  litters: LitterWithRelations[]
  dogsWithLineage?: DogWithLineage[]
}

export function EditableFamilyTree({ dogs, litters, dogsWithLineage }: EditableFamilyTreeProps) {
  return (
    <FamilyTreeProvider initialDogs={dogs} initialLitters={litters}>
      <FamilyTreeEditor dogsWithLineage={dogsWithLineage} />
      <EditModal />
      <FloatingAdminButton />
    </FamilyTreeProvider>
  )
}

const newDogSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  gender: z.enum(['male', 'female']),
  color: z.string().min(1, 'Color is required'),
  status: z.enum(['available', 'reserved', 'sold', 'breeding', 'retired']),
})

const newLitterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['expected', 'born', 'available', 'sold']),
  expected_date: z.string().optional(),
})

type NewDogFormData = z.infer<typeof newDogSchema>
type NewLitterFormData = z.infer<typeof newLitterSchema>

function FamilyTreeEditor({ dogsWithLineage }: { dogsWithLineage?: DogWithLineage[] }) {
  const { dogs, litters, assignSireToLitter, assignDamToLitter, createDog, createLitter, deleteLitter, setEditingDog, setEditingLitter, isSaving, canUndo, undo, reset } = useFamilyTree()
  const [showAddDogModal, setShowAddDogModal] = useState(false)
  const [showAddLitterModal, setShowAddLitterModal] = useState(false)
  const [parentSelectorModal, setParentSelectorModal] = useState<{
    type: 'sire' | 'dam'
    litterId: string
  } | null>(null)

  const handleAddParent = (type: 'sire' | 'dam', litterId: string) => {
    setParentSelectorModal({ type, litterId })
  }

  const handleSelectParent = async (dogId: string) => {
    if (!parentSelectorModal) return
    const { type, litterId } = parentSelectorModal
    if (type === 'sire') {
      await assignSireToLitter(dogId, litterId)
    } else {
      await assignDamToLitter(dogId, litterId)
    }
    setParentSelectorModal(null)
  }

  return (
    <>
      {/* Edit Mode Banner */}
      <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info weight="fill" className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Edit Mode</p>
              <p className="text-sm text-amber-700">
                Click on empty slots to add parents. Click on dogs or litters to edit.
              </p>
            </div>
          </div>
          {canUndo && (
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={isSaving}
                className="text-amber-700 border-amber-300 hover:bg-amber-100"
              >
                <ArrowCounterClockwise weight="bold" className="mr-1 h-4 w-4" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                disabled={isSaving}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <ArrowsCounterClockwise weight="bold" className="mr-1 h-4 w-4" />
                Reset All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowAddDogModal(true)}
            className="border-sky-300 text-sky-700 hover:bg-sky-50"
          >
            <DogIcon weight="bold" className="mr-2 h-4 w-4" />
            Add Dog
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAddLitterModal(true)}
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <Baby weight="bold" className="mr-2 h-4 w-4" />
            Add Litter
          </Button>
        </div>
      </div>

      {isSaving && (
        <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
          Saving changes...
        </div>
      )}

      {/* Unified Family Tree */}
      <UnifiedTree
        dogs={dogs}
        litters={litters}
        dogsWithLineage={dogsWithLineage}
        onEditDog={setEditingDog}
        onEditLitter={setEditingLitter}
        onAddParent={handleAddParent}
      />

      {/* Empty State */}
      {litters.length === 0 && (
        <div className="text-center py-16">
          <div className="mb-4">
            <TreeStructure weight="light" className="h-16 w-16 text-neutral-300 mx-auto" />
          </div>
          <p className="text-lg font-medium text-neutral-600">No family trees yet</p>
          <p className="text-sm text-neutral-500 mt-1 mb-6">Create a litter to start building your family tree</p>
          <Button
            variant="primary"
            onClick={() => setShowAddLitterModal(true)}
          >
            <Baby weight="bold" className="mr-2 h-4 w-4" />
            Create First Litter
          </Button>
        </div>
      )}

      {/* Parent Selector Modal */}
      {parentSelectorModal && (
        <ParentSelectorModal
          type={parentSelectorModal.type}
          dogs={dogs.filter(d => d.gender === (parentSelectorModal.type === 'sire' ? 'male' : 'female'))}
          onSelect={handleSelectParent}
          onClose={() => setParentSelectorModal(null)}
          isSaving={isSaving}
        />
      )}

      {/* Add Dog Modal */}
      {showAddDogModal && (
        <AddDogModal
          onClose={() => setShowAddDogModal(false)}
          onSubmit={async (data) => {
            await createDog(data)
            setShowAddDogModal(false)
          }}
          isSaving={isSaving}
        />
      )}

      {/* Add Litter Modal */}
      {showAddLitterModal && (
        <AddLitterModal
          onClose={() => setShowAddLitterModal(false)}
          onSubmit={async (data) => {
            await createLitter(data)
            setShowAddLitterModal(false)
          }}
          isSaving={isSaving}
        />
      )}
    </>
  )
}

// Parent Selector Modal - shown when clicking empty parent slots
function ParentSelectorModal({
  type,
  dogs,
  onSelect,
  onClose,
  isSaving,
}: {
  type: 'sire' | 'dam'
  dogs: Dog[]
  onSelect: (dogId: string) => Promise<void>
  onClose: () => void
  isSaving: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)
  const isMale = type === 'sire'

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Filter dogs by search
  const filteredDogs = dogs.filter(dog =>
    !searchQuery || dog.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-2xl mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className={cn(
          'px-6 py-4 border-b',
          isMale ? 'bg-sky-50 border-sky-200' : 'bg-rose-50 border-rose-200'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMale ? (
                <GenderMale weight="bold" className="h-5 w-5 text-sky-500" />
              ) : (
                <GenderFemale weight="bold" className="h-5 w-5 text-rose-500" />
              )}
              <h2 className="text-lg font-bold text-neutral-900">
                Select {type === 'sire' ? 'Sire' : 'Dam'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            >
              <X weight="bold" className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-neutral-600 mt-1">
            Choose a {isMale ? 'male' : 'female'} dog to be the {type}
          </p>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-neutral-100">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder={`Search ${isMale ? 'males' : 'females'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              autoFocus
            />
          </div>
        </div>

        {/* Dogs List */}
        <div className="max-h-80 overflow-y-auto">
          {filteredDogs.length > 0 ? (
            filteredDogs.map(dog => (
              <button
                key={dog.id}
                onClick={() => onSelect(dog.id)}
                disabled={isSaving}
                className={cn(
                  'w-full flex items-center gap-4 px-4 py-3 text-left transition-colors border-b border-neutral-50 last:border-0',
                  isMale ? 'hover:bg-sky-50' : 'hover:bg-rose-50',
                  'disabled:opacity-50'
                )}
              >
                {/* Dog Photo */}
                <div className={cn(
                  'relative w-14 h-14 rounded-full overflow-hidden ring-3 ring-offset-2 shrink-0',
                  isMale ? 'ring-sky-300' : 'ring-rose-300'
                )}>
                  {dog.image_url ? (
                    <img src={dog.image_url} alt={dog.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={cn(
                      'w-full h-full flex items-center justify-center',
                      isMale ? 'bg-sky-50' : 'bg-rose-50'
                    )}>
                      {isMale ? (
                        <GenderMale className="h-6 w-6 text-sky-400" />
                      ) : (
                        <GenderFemale className="h-6 w-6 text-rose-400" />
                      )}
                    </div>
                  )}
                </div>
                {/* Dog Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">{dog.name}</p>
                  <p className="text-sm text-neutral-500 truncate">{dog.color}</p>
                </div>
                {/* Select indicator */}
                <div className={cn(
                  'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  isMale ? 'bg-sky-100 text-sky-500' : 'bg-rose-100 text-rose-500'
                )}>
                  <Plus weight="bold" className="h-4 w-4" />
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-12 text-center text-neutral-500">
              {searchQuery ? (
                <p>No {isMale ? 'males' : 'females'} found matching "{searchQuery}"</p>
              ) : (
                <p>No {isMale ? 'male' : 'female'} dogs available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AddDogModal({
  onClose,
  onSubmit,
  isSaving,
}: {
  onClose: () => void
  onSubmit: (data: NewDogFormData) => Promise<void>
  isSaving: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<NewDogFormData>({
    resolver: zodResolver(newDogSchema),
    defaultValues: {
      gender: 'male',
      status: 'breeding',
      name: '',
      slug: '',
      color: '',
    },
  })

  const name = watch('name')
  const generateSlug = () => {
    if (name) {
      setValue('slug', name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
        >
          <X weight="bold" className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-neutral-900 mb-4">Add New Dog</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
            <input
              {...register('name')}
              onBlur={generateSlug}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm',
                errors.name ? 'border-red-300' : 'border-neutral-300'
              )}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Slug (URL)</label>
            <input
              {...register('slug')}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm',
                errors.slug ? 'border-red-300' : 'border-neutral-300'
              )}
            />
            {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Gender</label>
              <select
                {...register('gender')}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="breeding">Breeding</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Color</label>
            <input
              {...register('color')}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm',
                errors.color ? 'border-red-300' : 'border-neutral-300'
              )}
            />
            {errors.color && <p className="mt-1 text-xs text-red-500">{errors.color.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" className="flex-1" disabled={isSaving}>
              <FloppyDisk weight="bold" className="mr-2 h-4 w-4" />
              {isSaving ? 'Creating...' : 'Create Dog'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddLitterModal({
  onClose,
  onSubmit,
  isSaving,
}: {
  onClose: () => void
  onSubmit: (data: NewLitterFormData) => Promise<void>
  isSaving: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewLitterFormData>({
    resolver: zodResolver(newLitterSchema),
    defaultValues: {
      status: 'expected',
      name: `Litter ${new Date().toLocaleDateString()}`,
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
        >
          <X weight="bold" className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-neutral-900 mb-4">Add New Litter</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
            <input
              {...register('name')}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm',
                errors.name ? 'border-red-300' : 'border-neutral-300'
              )}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="expected">Expected</option>
              <option value="born">Born</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Expected Date</label>
            <input
              type="date"
              {...register('expected_date')}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <p className="text-sm text-neutral-500">
            You can assign parents after creating the litter by dragging dogs to the parent slots.
          </p>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" className="flex-1" disabled={isSaving}>
              <FloppyDisk weight="bold" className="mr-2 h-4 w-4" />
              {isSaving ? 'Creating...' : 'Create Litter'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FloatingAdminButton() {
  return (
    <Link
      href="/admin/litters"
      className="fixed bottom-6 right-6 z-40"
    >
      <Button variant="primary" className="shadow-lg">
        <Gear weight="fill" className="mr-2 h-4 w-4" />
        Full Admin Panel
      </Button>
    </Link>
  )
}
