'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface DeleteTestimonialButtonProps {
  testimonialId: string
  testimonialName: string
}

export function DeleteTestimonialButton({ testimonialId, testimonialName }: DeleteTestimonialButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${testimonialName}'s testimonial?`)) {
      return
    }

    setIsDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', testimonialId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      alert('Failed to delete testimonial')
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
      className="text-red-600 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
