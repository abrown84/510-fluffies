'use server'

import { createClient } from '@/lib/supabase/server'
import type { ApplicationInsert } from '@/types/database'

interface ApplicationFormData {
  name: string
  email: string
  phone: string
  city: string
  state: string
  experience_level: 'first_time' | 'experienced' | 'breeder'
  living_situation: 'house' | 'apartment' | 'condo' | 'other'
  has_yard: string
  has_other_pets: string
  other_pets_description?: string
  has_children: string
  children_ages?: string
  household_description: string
  goals: string
  timeline: string
  budget_range: string
  preferred_sex: 'male' | 'female' | 'either'
  preferred_color?: string
  how_heard_about_us?: string
  additional_notes?: string
}

export async function submitApplication(data: ApplicationFormData) {
  try {
    const supabase = await createClient()

    const application: ApplicationInsert = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      city: data.city,
      state: data.state,
      experience_level: data.experience_level,
      living_situation: data.living_situation,
      has_yard: data.has_yard === 'yes',
      has_other_pets: data.has_other_pets === 'yes',
      other_pets_description: data.other_pets_description || null,
      has_children: data.has_children === 'yes',
      children_ages: data.children_ages || null,
      household_description: data.household_description,
      goals: data.goals,
      timeline: data.timeline,
      budget_range: data.budget_range,
      preferred_sex: data.preferred_sex,
      preferred_color: data.preferred_color || null,
      how_heard_about_us: data.how_heard_about_us || null,
      additional_notes: data.additional_notes || null,
      status: 'pending',
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('applications').insert(application)

    if (error) {
      console.error('Error submitting application:', error)
      return { success: false, error: 'Failed to submit application' }
    }

    // TODO: Send email notification to breeder
    // await sendApplicationNotification(application)

    // TODO: Send confirmation email to applicant
    // await sendConfirmationEmail(application.email, application.name)

    return { success: true }
  } catch (error) {
    console.error('Error submitting application:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
