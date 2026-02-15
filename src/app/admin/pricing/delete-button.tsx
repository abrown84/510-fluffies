'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface DeletePricingButtonProps {
  optionId: string
  optionName: string
}

export function DeletePricingButton({ optionId, optionName }: DeletePricingButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${optionName}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('pricing_options')
        .delete()
        .eq('id', optionId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error deleting pricing option:', error)
      alert('Failed to delete pricing option')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
