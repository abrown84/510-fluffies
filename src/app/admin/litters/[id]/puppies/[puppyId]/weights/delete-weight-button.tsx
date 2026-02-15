'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface DeleteWeightButtonProps {
  weightId: string
  puppyId: string
  litterId: string
}

export function DeleteWeightButton({ weightId, puppyId, litterId }: DeleteWeightButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this weight record?')) {
      return
    }

    setIsDeleting(true)

    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('puppy_weights')
        .delete()
        .eq('id', weightId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Failed to delete weight:', error)
      alert('Failed to delete weight record')
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
      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
