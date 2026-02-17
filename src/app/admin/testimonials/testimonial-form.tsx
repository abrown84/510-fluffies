'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import type { Testimonial } from '@/types/database'

interface TestimonialFormProps {
  initialData?: Testimonial
}

export function TestimonialForm({ initialData }: TestimonialFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    customer_name: initialData?.customer_name || '',
    customer_location: initialData?.customer_location || '',
    customer_image_url: initialData?.customer_image_url || '',
    title: initialData?.title || '',
    content: initialData?.content || '',
    rating: initialData?.rating || 5,
    is_published: initialData?.is_published ?? false,
    featured: initialData?.featured ?? false,
    display_order: initialData?.display_order ?? 0,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const data = {
        ...formData,
        customer_location: formData.customer_location || null,
        customer_image_url: formData.customer_image_url || null,
      }

      if (initialData) {
        const { error } = await supabase
          .from('testimonials')
          .update(data)
          .eq('id', initialData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(data)

        if (error) throw error
      }

      router.push('/admin/testimonials')
      router.refresh()
    } catch (error) {
      console.error('Error saving testimonial:', error)
      alert('Failed to save testimonial')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="customer_name">Customer Name *</Label>
          <Input
            id="customer_name"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            placeholder="e.g., John & Sarah Smith"
            required
          />
        </div>

        <div>
          <Label htmlFor="customer_location">Location</Label>
          <Input
            id="customer_location"
            value={formData.customer_location}
            onChange={(e) => setFormData({ ...formData, customer_location: e.target.value })}
            placeholder="e.g., San Francisco, CA"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="customer_image_url">Customer Photo URL</Label>
        <Input
          id="customer_image_url"
          value={formData.customer_image_url}
          onChange={(e) => setFormData({ ...formData, customer_image_url: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Our little Bruno is perfect!"
          required
        />
      </div>

      <div>
        <Label htmlFor="content">Testimonial Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="What the customer said about their experience..."
          rows={5}
          required
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Input
            id="rating"
            type="number"
            min={1}
            max={5}
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
          />
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
            checked={formData.is_published}
            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
            className="h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm text-neutral-700">Published (visible on website)</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm text-neutral-700">Featured (highlighted testimonial)</span>
        </label>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/testimonials')}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Testimonial' : 'Create Testimonial'}
        </Button>
      </div>
    </form>
  )
}
