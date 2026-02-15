'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import type { Puppy } from '@/types/database'

const puppySchema = z.object({
  name: z.string().optional(),
  collar_color: z.string().optional(),
  gender: z.enum(['male', 'female']),
  color: z.string().optional(),
  status: z.enum(['available', 'reserved', 'deposit', 'sold']),
  price: z.string().optional(),
  birth_weight_oz: z.string().optional(),
  current_weight_oz: z.string().optional(),
  buyer_name: z.string().optional(),
  buyer_email: z.string().email().optional().or(z.literal('')),
  buyer_phone: z.string().optional(),
  deposit_amount: z.string().optional(),
  notes: z.string().optional(),
  image_url: z.string().optional(),
})

type PuppyFormData = z.infer<typeof puppySchema>

interface PuppyFormProps {
  litterId: string
  puppy?: Puppy
}

export function PuppyForm({ litterId, puppy }: PuppyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState(puppy?.image_url || '')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PuppyFormData>({
    resolver: zodResolver(puppySchema),
    defaultValues: {
      name: puppy?.name || '',
      collar_color: puppy?.collar_color || '',
      gender: puppy?.gender || 'male',
      color: puppy?.color || '',
      status: puppy?.status || 'available',
      price: puppy?.price?.toString() || '',
      birth_weight_oz: puppy?.birth_weight_oz?.toString() || '',
      current_weight_oz: puppy?.current_weight_oz?.toString() || '',
      buyer_name: puppy?.buyer_name || '',
      buyer_email: puppy?.buyer_email || '',
      buyer_phone: puppy?.buyer_phone || '',
      deposit_amount: puppy?.deposit_amount?.toString() || '',
      notes: puppy?.notes || '',
      image_url: puppy?.image_url || '',
    },
  })

  const status = watch('status')
  const showBuyerFields = status === 'reserved' || status === 'deposit' || status === 'sold'

  const onSubmit = async (data: PuppyFormData) => {
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const puppyData = {
        litter_id: litterId,
        name: data.name || null,
        collar_color: data.collar_color || null,
        gender: data.gender,
        color: data.color || null,
        status: data.status,
        price: data.price ? parseFloat(data.price) : null,
        birth_weight_oz: data.birth_weight_oz ? parseFloat(data.birth_weight_oz) : null,
        current_weight_oz: data.current_weight_oz ? parseFloat(data.current_weight_oz) : null,
        buyer_name: data.buyer_name || null,
        buyer_email: data.buyer_email || null,
        buyer_phone: data.buyer_phone || null,
        deposit_amount: data.deposit_amount ? parseFloat(data.deposit_amount) : null,
        deposit_paid_at: data.status === 'deposit' && data.deposit_amount ? new Date().toISOString() : null,
        sold_at: data.status === 'sold' ? new Date().toISOString() : null,
        notes: data.notes || null,
        image_url: imageUrl || null,
      }

      if (puppy) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('puppies')
          .update(puppyData)
          .eq('id', puppy.id)

        if (error) throw error
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('puppies')
          .insert(puppyData)

        if (error) throw error

        // Reset form after successful creation
        reset()
        setImageUrl('')
      }

      router.refresh()
    } catch (error) {
      console.error('Failed to save puppy:', error)
      alert('Failed to save puppy')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Basic Info */}
        <div>
          <Label htmlFor="name">Name (optional)</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g., Luna"
          />
        </div>

        <div>
          <Label htmlFor="collar_color">Collar Color</Label>
          <Input
            id="collar_color"
            {...register('collar_color')}
            placeholder="e.g., Pink, Blue"
          />
        </div>

        <div>
          <Label htmlFor="gender">Gender *</Label>
          <Select id="gender" {...register('gender')}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            {...register('color')}
            placeholder="e.g., Cream, Blue Fawn"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register('status')}>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="deposit">Deposit Paid</option>
            <option value="sold">Sold</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price')}
            placeholder="5500"
          />
        </div>

        <div>
          <Label htmlFor="birth_weight_oz">Birth Weight (oz)</Label>
          <Input
            id="birth_weight_oz"
            type="number"
            step="0.01"
            {...register('birth_weight_oz')}
            placeholder="8.5"
          />
        </div>

        <div>
          <Label htmlFor="current_weight_oz">Current Weight (oz)</Label>
          <Input
            id="current_weight_oz"
            type="number"
            step="0.01"
            {...register('current_weight_oz')}
            placeholder="24"
          />
        </div>
      </div>

      {/* Buyer Info - only show when relevant */}
      {showBuyerFields && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h4 className="mb-4 font-medium text-neutral-900">Buyer Information</h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="buyer_name">Buyer Name</Label>
              <Input
                id="buyer_name"
                {...register('buyer_name')}
                placeholder="John Smith"
              />
            </div>

            <div>
              <Label htmlFor="buyer_email">Buyer Email</Label>
              <Input
                id="buyer_email"
                type="email"
                {...register('buyer_email')}
                placeholder="john@example.com"
              />
              {errors.buyer_email && (
                <p className="mt-1 text-sm text-red-500">{errors.buyer_email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="buyer_phone">Buyer Phone</Label>
              <Input
                id="buyer_phone"
                {...register('buyer_phone')}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="deposit_amount">Deposit Amount ($)</Label>
              <Input
                id="deposit_amount"
                type="number"
                step="0.01"
                {...register('deposit_amount')}
                placeholder="1000"
              />
            </div>
          </div>
        </div>
      )}

      {/* Notes and Image */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            rows={3}
            placeholder="Any additional notes about this puppy..."
          />
        </div>

        <div>
          <Label>Photo</Label>
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            bucket="litters"
          />
        </div>
      </div>

      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : puppy ? 'Update Puppy' : 'Add Puppy'}
      </Button>
    </form>
  )
}
