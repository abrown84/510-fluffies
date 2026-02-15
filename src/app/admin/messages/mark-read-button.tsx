'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MarkAsReadButtonProps {
  messageId: string
}

export function MarkAsReadButton({ messageId }: MarkAsReadButtonProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleMarkAsRead = async () => {
    setIsUpdating(true)

    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', messageId)

      if (error) {
        alert('Failed to mark as read')
        return
      }

      router.refresh()
    } catch {
      alert('An error occurred')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <button
      onClick={handleMarkAsRead}
      disabled={isUpdating}
      className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
    >
      {isUpdating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Check className="h-4 w-4" />
      )}
      Mark as Read
    </button>
  )
}
