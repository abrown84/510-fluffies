'use server'

import { createClient } from '@/lib/supabase/server'
import type { ContactMessageInsert } from '@/types/database'

interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}

export async function submitContactForm(data: ContactFormData) {
  try {
    const supabase = await createClient()

    const contactMessage: ContactMessageInsert = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('contact_messages')
      .insert(contactMessage)

    if (error) {
      console.error('Error submitting contact form:', error)
      return { success: false, error: 'Failed to submit message' }
    }

    // TODO: Send email notification
    // await sendNotificationEmail(contactMessage)

    return { success: true }
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
