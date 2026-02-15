'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select } from '@/components/ui/select'
import { updateApplicationStatus } from './actions'
import type { ApplicationStatus } from '@/lib/email'

interface ApplicationStatusSelectProps {
  applicationId: string
  currentStatus: string
}

export function ApplicationStatusSelect({
  applicationId,
  currentStatus,
}: ApplicationStatusSelectProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [showEmailSent, setShowEmailSent] = useState(false)

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ApplicationStatus
    if (newStatus === currentStatus) return

    setIsUpdating(true)
    setShowEmailSent(false)

    try {
      const result = await updateApplicationStatus(applicationId, newStatus)

      if (!result.success) {
        alert(result.error || 'Failed to update status')
        return
      }

      if (result.emailSent) {
        setShowEmailSent(true)
        setTimeout(() => setShowEmailSent(false), 3000)
      }

      router.refresh()
    } catch {
      alert('An error occurred')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="relative">
      <Select
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={isUpdating}
        className="w-32 text-xs"
      >
        <option value="pending">Pending</option>
        <option value="reviewing">Reviewing</option>
        <option value="approved">Approved</option>
        <option value="waitlisted">Waitlisted</option>
        <option value="declined">Declined</option>
      </Select>
      {showEmailSent && (
        <span className="absolute -bottom-5 left-0 text-xs text-green-600">
          ✓ Email sent
        </span>
      )}
      {isUpdating && (
        <span className="absolute -bottom-5 left-0 text-xs text-neutral-500">
          Updating...
        </span>
      )}
    </div>
  )
}
