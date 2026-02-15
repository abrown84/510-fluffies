'use server'

import { createClient } from '@/lib/supabase/server'
import { sendStatusChangeEmail, type ApplicationStatus } from '@/lib/email'

interface UpdateStatusResult {
  success: boolean
  error?: string
  emailSent?: boolean
}

interface ApplicationData {
  email: string
  name: string
  status: string
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus
): Promise<UpdateStatusResult> {
  const supabase = await createClient()

  // Get the application to find the applicant's email
  const { data, error: fetchError } = await supabase
    .from('applications')
    .select('email, name, status')
    .eq('id', applicationId)
    .single()

  const application = data as ApplicationData | null

  if (fetchError || !application) {
    return { success: false, error: 'Application not found' }
  }

  // Don't send email if status hasn't changed
  if (application.status === newStatus) {
    return { success: true, emailSent: false }
  }

  // Update the status
  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: newStatus } as never)
    .eq('id', applicationId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Send status change email
  const emailResult = await sendStatusChangeEmail(
    application.email,
    application.name,
    newStatus
  )

  return {
    success: true,
    emailSent: emailResult.success,
  }
}
