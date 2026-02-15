'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface WeightFormProps {
  puppyId: string
  litterId: string
}

export function WeightForm({ puppyId, litterId }: WeightFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!weight) return

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const weightOz = parseFloat(weight)

      // Add weight record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: weightError } = await (supabase as any)
        .from('puppy_weights')
        .insert({
          puppy_id: puppyId,
          weight_oz: weightOz,
          notes: notes || null,
        })

      if (weightError) throw weightError

      // Update puppy's current weight
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: puppyError } = await (supabase as any)
        .from('puppies')
        .update({ current_weight_oz: weightOz })
        .eq('id', puppyId)

      if (puppyError) throw puppyError

      // Reset form
      setWeight('')
      setNotes('')
      router.refresh()
    } catch (error) {
      console.error('Failed to save weight:', error)
      alert('Failed to save weight')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <div className="w-32">
        <Label htmlFor="weight">Weight (oz) *</Label>
        <Input
          id="weight"
          type="number"
          step="0.01"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="24.5"
          required
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Before feeding, after bath"
        />
      </div>

      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Add Weight'}
      </Button>
    </form>
  )
}
