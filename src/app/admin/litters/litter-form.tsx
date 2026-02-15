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
import type { Litter } from '@/types/database'

const litterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sire_id: z.string().optional(),
  dam_id: z.string().optional(),
  status: z.enum(['expected', 'born', 'available', 'sold']),
  expected_date: z.string().optional(),
  date_of_birth: z.string().optional(),
  description: z.string().optional(),
  puppy_count: z.string().optional(),
  available_count: z.string().optional(),
  image_url: z.string().optional(),
})

type LitterFormData = z.infer<typeof litterSchema>

interface Dog {
  id: string
  name: string
  gender: 'male' | 'female'
}

interface LitterFormProps {
  litter?: Litter
  males: Dog[]
  females: Dog[]
}

export function LitterForm({ litter, males, females }: LitterFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LitterFormData>({
    resolver: zodResolver(litterSchema),
    defaultValues: {
      name: litter?.name || '',
      sire_id: litter?.sire_id || '',
      dam_id: litter?.dam_id || '',
      status: (litter?.status as LitterFormData['status']) || 'expected',
      expected_date: litter?.expected_date || '',
      date_of_birth: litter?.date_of_birth || '',
      description: litter?.description || '',
      puppy_count: litter?.puppy_count?.toString() || '',
      available_count: litter?.available_count?.toString() || '',
      image_url: litter?.image_url || '',
    },
  })

  const imageUrl = watch('image_url')

  const onSubmit = async (data: LitterFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      const litterData = {
        name: data.name,
        sire_id: data.sire_id || null,
        dam_id: data.dam_id || null,
        status: data.status,
        expected_date: data.expected_date || null,
        date_of_birth: data.date_of_birth || null,
        description: data.description || null,
        puppy_count: data.puppy_count ? parseInt(data.puppy_count, 10) : null,
        available_count: data.available_count ? parseInt(data.available_count, 10) : null,
        image_url: data.image_url || null,
      }

      if (litter) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
          .from('litters')
          .update(litterData)
          .eq('id', litter.id)

        if (updateError) {
          setError(updateError.message)
          return
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any)
          .from('litters')
          .insert(litterData)

        if (insertError) {
          setError(insertError.message)
          return
        }
      }

      router.push('/admin/litters')
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Litter Name *
        </label>
        <Input
          {...register('name')}
          error={errors.name?.message}
          className="mt-1"
          placeholder="e.g., Spring 2026 Litter"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Sire (Father)
          </label>
          <Select {...register('sire_id')} className="mt-1">
            <option value="">Select sire...</option>
            {males.map((dog) => (
              <option key={dog.id} value={dog.id}>
                {dog.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Dam (Mother)
          </label>
          <Select {...register('dam_id')} className="mt-1">
            <option value="">Select dam...</option>
            {females.map((dog) => (
              <option key={dog.id} value={dog.id}>
                {dog.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Status *
          </label>
          <Select {...register('status')} className="mt-1">
            <option value="expected">Expected</option>
            <option value="born">Born</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Expected Date
          </label>
          <Input type="date" {...register('expected_date')} className="mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Date of Birth
          </label>
          <Input type="date" {...register('date_of_birth')} className="mt-1" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Total Puppies
          </label>
          <Input
            type="number"
            {...register('puppy_count')}
            className="mt-1"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Available Puppies
          </label>
          <Input
            type="number"
            {...register('available_count')}
            className="mt-1"
            min={0}
          />
        </div>
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
          Description
        </label>
        <Textarea
          {...register('description')}
          className="mt-1"
          rows={3}
          placeholder="Information about this litter..."
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : litter ? (
            'Update Litter'
          ) : (
            'Add Litter'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
