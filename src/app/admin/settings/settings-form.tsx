'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface SiteInfo {
  name: string
  tagline: string
  description: string
  email: string
  phone: string
  location: string
}

interface SocialLinks {
  instagram: string
  facebook: string
  tiktok: string
  youtube: string
}

interface SEOSettings {
  meta_title: string
  meta_description: string
  og_image: string
}

interface NotificationSettings {
  email_new_applications: boolean
  email_new_messages: boolean
  notification_email: string
}

interface WaitlistSettings {
  enabled: boolean
  deposit_amount: number
  message: string
}

interface SettingsFormProps {
  initialSettings: {
    site_info: SiteInfo
    social_links: SocialLinks
    seo: SEOSettings
    notifications: NotificationSettings
    waitlist: WaitlistSettings
  }
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'site' | 'social' | 'seo' | 'notifications' | 'waitlist'>('site')

  const [siteInfo, setSiteInfo] = useState<SiteInfo>(initialSettings.site_info)
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(initialSettings.social_links)
  const [seo, setSeo] = useState<SEOSettings>(initialSettings.seo)
  const [notifications, setNotifications] = useState<NotificationSettings>(initialSettings.notifications)
  const [waitlist, setWaitlist] = useState<WaitlistSettings>(initialSettings.waitlist)

  async function handleSave() {
    setSaving(true)
    try {
      const supabase = createClient()

      const updates = [
        { key: 'site_info', value: siteInfo },
        { key: 'social_links', value: socialLinks },
        { key: 'seo', value: seo },
        { key: 'notifications', value: notifications },
        { key: 'waitlist', value: waitlist },
      ]

      for (const update of updates) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('site_settings')
          .update({ value: update.value })
          .eq('key', update.key)

        if (error) throw error
      }

      router.refresh()
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'site', label: 'Site Info' },
    { id: 'social', label: 'Social Media' },
    { id: 'seo', label: 'SEO' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'waitlist', label: 'Waitlist' },
  ] as const

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-neutral-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-100 text-amber-900 border-b-2 border-amber-500'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Site Info Tab */}
      {activeTab === 'site' && (
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>Basic information about your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Site Name</Label>
                <Input
                  id="name"
                  value={siteInfo.name}
                  onChange={(e) => setSiteInfo({ ...siteInfo, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={siteInfo.tagline}
                  onChange={(e) => setSiteInfo({ ...siteInfo, tagline: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={siteInfo.description}
                onChange={(e) => setSiteInfo({ ...siteInfo, description: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={siteInfo.email}
                  onChange={(e) => setSiteInfo({ ...siteInfo, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={siteInfo.phone}
                  onChange={(e) => setSiteInfo({ ...siteInfo, phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={siteInfo.location}
                onChange={(e) => setSiteInfo({ ...siteInfo, location: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>Connect your social media accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                placeholder="@username or full URL"
              />
            </div>
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                placeholder="Page URL"
              />
            </div>
            <div>
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                value={socialLinks.tiktok}
                onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                placeholder="@username or full URL"
              />
            </div>
            <div>
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={socialLinks.youtube}
                onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                placeholder="Channel URL"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Search engine optimization settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={seo.meta_title}
                onChange={(e) => setSeo({ ...seo, meta_title: e.target.value })}
              />
              <p className="mt-1 text-xs text-neutral-500">
                {seo.meta_title.length}/60 characters (recommended)
              </p>
            </div>
            <div>
              <Label htmlFor="meta_description">Meta Description</Label>
              <textarea
                id="meta_description"
                value={seo.meta_description}
                onChange={(e) => setSeo({ ...seo, meta_description: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="mt-1 text-xs text-neutral-500">
                {seo.meta_description.length}/160 characters (recommended)
              </p>
            </div>
            <div>
              <Label htmlFor="og_image">Open Graph Image URL</Label>
              <Input
                id="og_image"
                value={seo.og_image}
                onChange={(e) => setSeo({ ...seo, og_image: e.target.value })}
                placeholder="https://..."
              />
              <p className="mt-1 text-xs text-neutral-500">
                Image shown when sharing on social media (1200x630px recommended)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure email notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notification_email">Notification Email</Label>
              <Input
                id="notification_email"
                type="email"
                value={notifications.notification_email}
                onChange={(e) => setNotifications({ ...notifications, notification_email: e.target.value })}
              />
              <p className="mt-1 text-xs text-neutral-500">
                Email address to receive notifications
              </p>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notifications.email_new_applications}
                  onChange={(e) => setNotifications({ ...notifications, email_new_applications: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm">Email me when new applications are submitted</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notifications.email_new_messages}
                  onChange={(e) => setNotifications({ ...notifications, email_new_messages: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm">Email me when new contact messages are received</span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waitlist Tab */}
      {activeTab === 'waitlist' && (
        <Card>
          <CardHeader>
            <CardTitle>Waitlist Settings</CardTitle>
            <CardDescription>Configure waitlist and deposit settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={waitlist.enabled}
                onChange={(e) => setWaitlist({ ...waitlist, enabled: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-medium">Enable waitlist</span>
            </label>
            <div>
              <Label htmlFor="deposit_amount">Deposit Amount ($)</Label>
              <Input
                id="deposit_amount"
                type="number"
                value={waitlist.deposit_amount}
                onChange={(e) => setWaitlist({ ...waitlist, deposit_amount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="waitlist_message">Waitlist Message</Label>
              <textarea
                id="waitlist_message"
                value={waitlist.message}
                onChange={(e) => setWaitlist({ ...waitlist, message: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} variant="primary">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
