'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import type { PricingOption } from '@/types/database'

const iconOptions = [
  { value: 'Heart', label: 'Heart' },
  { value: 'Crown', label: 'Crown' },
  { value: 'Handshake', label: 'Handshake' },
  { value: 'Star', label: 'Star' },
  { value: 'Shield', label: 'Shield' },
  { value: 'Certificate', label: 'Certificate' },
]

interface PricingFormProps {
  initialData?: PricingOption
}

export function PricingForm({ initialData }: PricingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [features, setFeatures] = useState<string[]>(initialData?.features || [])
  const [newFeature, setNewFeature] = useState('')

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    subtitle: initialData?.subtitle || '',
    price: initialData?.price || '',
    price_note: initialData?.price_note || '',
    description: initialData?.description || '',
    icon: initialData?.icon || 'Heart',
    featured: initialData?.featured || false,
    display_order: initialData?.display_order || 0,
    is_active: initialData?.is_active ?? true,
    option_type: initialData?.option_type || 'ownership',
  })

  function addFeature() {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature('')
    }
  }

  function removeFeature(index: number) {
    setFeatures(features.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const data = {
        ...formData,
        features,
        price_note: formData.price_note || null,
        description: formData.description || null,
      }

      if (initialData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('pricing_options')
          .update(data)
          .eq('id', initialData.id)

        if (error) throw error
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('pricing_options')
          .insert(data)

        if (error) throw error
      }

      router.push('/admin/pricing')
      router.refresh()
    } catch (error) {
      console.error('Error saving pricing option:', error)
      alert('Failed to save pricing option')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Full Ownership"
            required
          />
        </div>

        <div>
          <Label htmlFor="subtitle">Subtitle *</Label>
          <Input
            id="subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="e.g., Pet Home"
            required
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g., $5,500"
            required
          />
        </div>

        <div>
          <Label htmlFor="price_note">Price Note</Label>
          <Input
            id="price_note"
            value={formData.price_note}
            onChange={(e) => setFormData({ ...formData, price_note: e.target.value })}
            placeholder="e.g., Starting price"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this option..."
          rows={3}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <Label htmlFor="option_type">Type *</Label>
          <select
            id="option_type"
            value={formData.option_type}
            onChange={(e) => setFormData({ ...formData, option_type: e.target.value as 'ownership' | 'service' })}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ownership">Ownership Option</option>
            <option value="service">Additional Service</option>
          </select>
        </div>

        <div>
          <Label htmlFor="icon">Icon</Label>
          <select
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {iconOptions.map((icon) => (
              <option key={icon.value} value={icon.value}>
                {icon.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            min={0}
          />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm text-neutral-700">Featured (highlighted option)</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm text-neutral-700">Active (visible on website)</span>
        </label>
      </div>

      {/* Features (for ownership options) */}
      {formData.option_type === 'ownership' && (
        <div>
          <Label>Features</Label>
          <div className="mt-2 space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm">
                  {feature}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeFeature(index)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addFeature()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addFeature}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/pricing')}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Option' : 'Create Option'}
        </Button>
      </div>
    </form>
  )
}
