'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import type { Dog } from '@/types/database'

const dogSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  gender: z.enum(['male', 'female']),
  color: z.string().min(1, 'Color is required'),
  date_of_birth: z.string().optional(),
  status: z.enum(['available', 'reserved', 'sold', 'breeding', 'retired']),
  ownership_type: z.enum(['owned', 'external', 'stud_service', 'co_owned']),
  owner_name: z.string().optional(),
  is_fluffy: z.boolean(),
  bio: z.string().optional(),
  health_testing: z.string().optional(),
  image_url: z.string().optional(),
})

type DogFormData = z.infer<typeof dogSchema>

interface DogFormProps {
  dog?: Dog
}

export function DogForm({ dog }: DogFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DogFormData>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: dog?.name || '',
      slug: dog?.slug || '',
      gender: (dog?.gender as 'male' | 'female') || 'female',
      color: dog?.color || '',
      date_of_birth: dog?.date_of_birth || '',
      status: (dog?.status as DogFormData['status']) || 'available',
      ownership_type: (dog?.ownership_type as DogFormData['ownership_type']) || 'owned',
      owner_name: dog?.owner_name || '',
      is_fluffy: dog?.is_fluffy ?? true,
      bio: dog?.bio || '',
      health_testing: dog?.health_testing || '',
      image_url: dog?.image_url || '',
    },
  })

  const imageUrl = watch('image_url')
  const ownershipType = watch('ownership_type')

  const name = watch('name')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setValue('name', newName)
    if (!dog) {
      setValue('slug', slugify(newName))
    }
  }

  const onSubmit = async (data: DogFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      const dogData = {
        ...data,
        date_of_birth: data.date_of_birth || null,
        bio: data.bio || null,
        health_testing: data.health_testing || null,
        image_url: data.image_url || null,
        owner_name: data.owner_name || null,
      }

      if (dog) {
        // Update existing dog
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
          .from('dogs')
          .update(dogData)
          .eq('id', dog.id)

        if (updateError) {
          setError(updateError.message)
          return
        }
      } else {
        // Create new dog
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any).from('dogs').insert(dogData)

        if (insertError) {
          setError(insertError.message)
          return
        }
      }

      router.push('/admin/dogs')
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Name *
          </label>
          <Input
            {...register('name')}
            onChange={handleNameChange}
            error={errors.name?.message}
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Slug *
          </label>
          <Input
            {...register('slug')}
            error={errors.slug?.message}
            className="mt-1"
            placeholder="url-friendly-name"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Gender *
          </label>
          <Select {...register('gender')} className="mt-1">
            <option value="female">Female</option>
            <option value="male">Male</option>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Color *
          </label>
          <Input
            {...register('color')}
            error={errors.color?.message}
            className="mt-1"
            placeholder="e.g., Blue, Lilac Merle"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Status *
          </label>
          <Select {...register('status')} className="mt-1">
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
            <option value="breeding">Breeding</option>
            <option value="retired">Retired</option>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Ownership *
          </label>
          <Select {...register('ownership_type')} className="mt-1">
            <option value="owned">Owned</option>
            <option value="co_owned">Co-owned</option>
            <option value="external">External</option>
            <option value="stud_service">Stud Service</option>
          </Select>
          <p className="mt-1 text-xs text-neutral-500">
            External dogs won&apos;t appear in public listings
          </p>
        </div>
      </div>

      {/* Owner Name - shown for non-owned dogs or co-owned */}
      {ownershipType && ownershipType !== 'owned' && (
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Owner / Kennel Name
          </label>
          <Input
            {...register('owner_name')}
            className="mt-1 max-w-md"
            placeholder={ownershipType === 'co_owned' ? 'Co-owner name' : 'e.g., Smith Kennels'}
          />
          <p className="mt-1 text-xs text-neutral-500">
            {ownershipType === 'stud_service' && 'Name of the stud service provider'}
            {ownershipType === 'external' && 'Name of the external owner or kennel'}
            {ownershipType === 'co_owned' && 'Name of the co-owner'}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Date of Birth
        </label>
        <Input
          type="date"
          {...register('date_of_birth')}
          className="mt-1 max-w-xs"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Photo
        </label>
        <ImageUpload
          value={imageUrl}
          onChange={(url) => setValue('image_url', url)}
          bucket="dogs"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Bio
        </label>
        <Textarea
          {...register('bio')}
          className="mt-1"
          rows={3}
          placeholder="Tell us about this dog's personality and characteristics..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Health Testing
        </label>
        <Textarea
          {...register('health_testing')}
          className="mt-1"
          rows={2}
          placeholder="DNA testing, certifications, health clearances..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_fluffy"
          {...register('is_fluffy')}
          className="h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
        />
        <label htmlFor="is_fluffy" className="text-sm text-neutral-700">
          Fluffy coat
        </label>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : dog ? (
            'Update Dog'
          ) : (
            'Add Dog'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
