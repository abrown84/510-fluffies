'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface DeletePuppyButtonProps {
  puppyId: string
  litterId: string
}

export function DeletePuppyButton({ puppyId, litterId }: DeletePuppyButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this puppy? This cannot be undone.')) {
      return
    }

    setIsDeleting(true)

    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('puppies')
        .delete()
        .eq('id', puppyId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Failed to delete puppy:', error)
      alert('Failed to delete puppy')
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
