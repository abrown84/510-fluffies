'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface DeleteBlogPostButtonProps {
  postId: string
  postTitle: string
}

export function DeleteBlogPostButton({ postId, postTitle }: DeleteBlogPostButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      return
    }

    setIsDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('blog_posts')
        // @ts-ignore - blog_posts table added via migration
        .delete()
        .eq('id', postId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error deleting blog post:', error)
      alert('Failed to delete blog post')
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
