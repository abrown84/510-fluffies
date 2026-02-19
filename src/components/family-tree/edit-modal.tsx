'use client'

import { useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, PencilSimple, ArrowSquareOut, Trash, FloppyDisk, XCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useFamilyTree, type LitterWithRelations } from './family-tree-context'
import { cn } from '@/lib/utils'
import type { Dog } from '@/types/database'

const dogSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: z.enum(['male', 'female']),
  color: z.string().min(1, 'Color is required'),
  status: z.enum(['available', 'reserved', 'sold', 'breeding', 'retired']),
  sire_id: z.string().nullable(),
  dam_id: z.string().nullable(),
  image_url: z.string().nullable(),
})

const litterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['expected', 'born', 'available', 'sold']),
  expected_date: z.string().nullable(),
  date_of_birth: z.string().nullable(),
  sire_id: z.string().nullable(),
  dam_id: z.string().nullable(),
  custom_sire_name: z.string().nullable(),
  custom_dam_name: z.string().nullable(),
})

type DogFormData = z.infer<typeof dogSchema>
type LitterFormData = z.infer<typeof litterSchema>

export function EditModal() {
  const { editingDog, editingLitter, isModalOpen, closeModal, error } = useFamilyTree()

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeModal()
  }, [closeModal])

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isModalOpen, handleEscape])

  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      />

      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
        >
          <X weight="bold" className="h-5 w-5" />
        </button>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {editingDog && <DogDetails dog={editingDog} />}
        {editingLitter && <LitterDetails litter={editingLitter} />}
      </div>
    </div>
  )
}

function DogDetails({ dog }: { dog: Dog }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { dogs, updateDog, deleteDog, isSaving } = useFamilyTree()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DogFormData>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: dog.name,
      gender: dog.gender,
      color: dog.color,
      status: dog.status,
      sire_id: dog.sire_id,
      dam_id: dog.dam_id,
      image_url: dog.image_url,
    },
  })

  const maleDogs = dogs.filter(d => d.gender === 'male' && d.id !== dog.id)
  const femaleDogs = dogs.filter(d => d.gender === 'female' && d.id !== dog.id)

  const onSubmit = async (data: DogFormData) => {
    await updateDog(dog.id, {
      name: data.name,
      gender: data.gender,
      color: data.color,
      status: data.status,
      sire_id: data.sire_id || null,
      dam_id: data.dam_id || null,
      image_url: data.image_url || null,
    })
  }

  const handleDelete = async () => {
    await deleteDog(dog.id)
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  if (showDeleteConfirm) {
    return (
      <div className="text-center py-4">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Delete {dog.name}?</h3>
        <p className="text-neutral-600 mb-6">
          This will remove the dog from all litters. This action can be undone.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSaving ? 'Deleting...' : 'Delete Dog'}
          </Button>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-xl font-bold text-neutral-900 pr-8 mb-4">Edit Dog</h2>

        <div className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Sire (Father)</label>
              <select
                {...register('sire_id')}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="">Unknown</option>
                {maleDogs.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Dam (Mother)</label>
              <select
                {...register('dam_id')}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="">Unknown</option>
                {femaleDogs.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Image URL</label>
            <input
              {...register('image_url')}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="submit" variant="primary" className="flex-1" disabled={isSaving}>
            <FloppyDisk weight="bold" className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
            <XCircle weight="bold" className="h-4 w-4" />
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 pr-8">{dog.name}</h2>

      <div className="mt-4 flex items-start gap-4">
        <div className={cn(
          'relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-2 ring-offset-2',
          dog.gender === 'male' ? 'ring-blue-400' : 'ring-pink-400'
        )}>
          {dog.image_url ? (
            <Image
              src={dog.image_url}
              alt={dog.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100">
              <span className="text-3xl">dog</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="font-medium text-neutral-500">Gender:</dt>
              <dd className="text-neutral-900 capitalize">{dog.gender}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-neutral-500">Color:</dt>
              <dd className="text-neutral-900">{dog.color}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-neutral-500">Status:</dt>
              <dd className="text-neutral-900 capitalize">{dog.status}</dd>
            </div>
            {dog.sire_id && (
              <div className="flex gap-2">
                <dt className="font-medium text-neutral-500">Sire:</dt>
                <dd className="text-neutral-900">
                  {dogs.find(d => d.id === dog.sire_id)?.name || 'Unknown'}
                </dd>
              </div>
            )}
            {dog.dam_id && (
              <div className="flex gap-2">
                <dt className="font-medium text-neutral-500">Dam:</dt>
                <dd className="text-neutral-900">
                  {dogs.find(d => d.id === dog.dam_id)?.name || 'Unknown'}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="primary" className="flex-1" onClick={() => setIsEditing(true)}>
          <PencilSimple weight="bold" className="mr-2 h-4 w-4" />
          Edit Dog
        </Button>
        <Link href={`/dogs/${dog.slug}`}>
          <Button variant="outline">
            <ArrowSquareOut weight="bold" className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-600 hover:bg-red-50"
        >
          <Trash weight="bold" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function LitterDetails({ litter }: { litter: LitterWithRelations }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { dogs, updateLitter, deleteLitter, isSaving } = useFamilyTree()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<LitterFormData>({
    resolver: zodResolver(litterSchema),
    defaultValues: {
      name: litter.name,
      status: litter.status,
      expected_date: litter.expected_date,
      date_of_birth: litter.date_of_birth,
      sire_id: litter.sire_id,
      dam_id: litter.dam_id,
      custom_sire_name: litter.custom_sire_name,
      custom_dam_name: litter.custom_dam_name,
    },
  })

  const sireId = watch('sire_id')
  const damId = watch('dam_id')
  const maleDogs = dogs.filter(d => d.gender === 'male')
  const femaleDogs = dogs.filter(d => d.gender === 'female')

  const onSubmit = async (data: LitterFormData) => {
    await updateLitter(litter.id, {
      name: data.name,
      status: data.status,
      expected_date: data.expected_date || null,
      date_of_birth: data.date_of_birth || null,
      sire_id: data.sire_id || null,
      dam_id: data.dam_id || null,
      custom_sire_name: data.custom_sire_name || null,
      custom_dam_name: data.custom_dam_name || null,
    })
  }

  const handleDelete = async () => {
    await deleteLitter(litter.id)
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  if (showDeleteConfirm) {
    return (
      <div className="text-center py-4">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Delete {litter.name}?</h3>
        <p className="text-neutral-600 mb-6">
          This will also delete all puppies in this litter. This action can be undone.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSaving ? 'Deleting...' : 'Delete Litter'}
          </Button>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-xl font-bold text-neutral-900 pr-8 mb-4">Edit Litter</h2>

        <div className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Expected Date</label>
              <input
                type="date"
                {...register('expected_date')}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Date of Birth</label>
              <input
                type="date"
                {...register('date_of_birth')}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Parents</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Sire (Father)</label>
                <select
                  {...register('sire_id')}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                >
                  <option value="">None / External</option>
                  {maleDogs.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {!sireId && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Custom Sire Name <span className="text-neutral-400">(for external studs)</span>
                  </label>
                  <input
                    {...register('custom_sire_name')}
                    placeholder="e.g., Champion Blue Moon"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Dam (Mother)</label>
                <select
                  {...register('dam_id')}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                >
                  <option value="">None / External</option>
                  {femaleDogs.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {!damId && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Custom Dam Name <span className="text-neutral-400">(for external dams)</span>
                  </label>
                  <input
                    {...register('custom_dam_name')}
                    placeholder="e.g., Princess Luna"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="submit" variant="primary" className="flex-1" disabled={isSaving}>
            <FloppyDisk weight="bold" className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
            <XCircle weight="bold" className="h-4 w-4" />
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 pr-8">{litter.name}</h2>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center gap-4">
          {(litter.sire || litter.custom_sire_name) && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-500">Sire:</span>
              <span className="text-neutral-900">
                {litter.sire?.name || litter.custom_sire_name}
                {!litter.sire && litter.custom_sire_name && (
                  <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">External</span>
                )}
              </span>
            </div>
          )}
          {(litter.dam || litter.custom_dam_name) && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-500">Dam:</span>
              <span className="text-neutral-900">
                {litter.dam?.name || litter.custom_dam_name}
                {!litter.dam && litter.custom_dam_name && (
                  <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">External</span>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <div className="flex gap-2">
            <span className="font-medium text-neutral-500">Status:</span>
            <span className="text-neutral-900 capitalize">{litter.status}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium text-neutral-500">Puppies:</span>
            <span className="text-neutral-900">{litter.puppies.length}</span>
          </div>
        </div>

        {litter.date_of_birth && (
          <div className="flex gap-2">
            <span className="font-medium text-neutral-500">Born:</span>
            <span className="text-neutral-900">
              {new Date(litter.date_of_birth).toLocaleDateString()}
            </span>
          </div>
        )}

        {litter.expected_date && !litter.date_of_birth && (
          <div className="flex gap-2">
            <span className="font-medium text-neutral-500">Expected:</span>
            <span className="text-neutral-900">
              {new Date(litter.expected_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="primary" className="flex-1" onClick={() => setIsEditing(true)}>
          <PencilSimple weight="bold" className="mr-2 h-4 w-4" />
          Edit Litter
        </Button>
        <Link href={`/admin/litters/${litter.id}/puppies`}>
          <Button variant="outline">
            Manage Puppies
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-600 hover:bg-red-50"
        >
          <Trash weight="bold" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
