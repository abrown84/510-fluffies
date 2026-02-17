'use server'

import { createClient } from '@/lib/supabase/server'
import type { ApplicationInsert } from '@/types/database'

interface WaitlistFormData {
  name: string
  email: string
  phone?: string
  city?: string
  state?: string
  preferred_sex: 'male' | 'female' | 'either'
  preferred_color?: string
  timeline: string
  how_heard_about_us?: string
  additional_notes?: string
}

export async function submitWaitlist(data: WaitlistFormData) {
  try {
    const supabase = await createClient()

    const application: ApplicationInsert = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      city: data.city || null,
      state: data.state || null,
      preferred_sex: data.preferred_sex,
      preferred_color: data.preferred_color || null,
      timeline: data.timeline,
      how_heard_about_us: data.how_heard_about_us || null,
      additional_notes: data.additional_notes || null,
      status: 'waitlisted',
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('applications').insert(application)

    if (error) {
      console.error('Error submitting waitlist:', error)
      return { success: false, error: 'Failed to join waitlist' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error submitting waitlist:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
