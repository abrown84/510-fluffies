import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from './settings-form'

// Default settings if database is empty
const defaultSettings = {
  site_info: {
    name: 'C.D. Certified Frenchies',
    tagline: 'Premium Fluffy French Bulldogs',
    description: "Bay Area's premier breeder of exceptional Fluffy French Bulldogs.",
    email: 'hello@cdcertifiedfrenchies.com',
    phone: '',
    location: 'Bay Area, California',
  },
  social_links: {
    instagram: '@cd.certifiedfrenchies',
    facebook: '',
    tiktok: '',
    youtube: '',
  },
  seo: {
    meta_title: 'C.D. Certified Frenchies | Premium Fluffy French Bulldogs',
    meta_description: "Bay Area's premier breeder of exceptional Fluffy French Bulldogs.",
    og_image: '',
  },
  notifications: {
    email_new_applications: true,
    email_new_messages: true,
    notification_email: 'hello@cdcertifiedfrenchies.com',
  },
  waitlist: {
    enabled: true,
    deposit_amount: 1000,
    message: 'Join our waitlist to be notified when new litters become available.',
  },
}

async function getSettings() {
  const supabase = await createClient()

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('site_settings')
      .select('key, value')

    if (error) {
      console.error('Error fetching settings:', error)
      return defaultSettings
    }

    if (!data || data.length === 0) {
      return defaultSettings
    }

    // Convert array of {key, value} to object
    const settings = { ...defaultSettings }
    for (const row of data) {
      if (row.key in settings) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (settings as any)[row.key] = row.value
      }
    }

    return settings
  } catch (error) {
    console.error('Error fetching settings:', error)
    return defaultSettings
  }
}

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
      <p className="mt-1 text-neutral-600">
        Manage your website settings and configuration
      </p>

      <div className="mt-8">
        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  )
}
