'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import type { BlogPost } from '@/types/database'

interface BlogFormProps {
  initialData?: BlogPost
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    featured_image_url: initialData?.featured_image_url || '',
    category: initialData?.category || '',
    is_published: initialData?.is_published ?? false,
    featured: initialData?.featured ?? false,
  })

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: initialData ? formData.slug : generateSlug(title),
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const data = {
        ...formData,
        excerpt: formData.excerpt || null,
        featured_image_url: formData.featured_image_url || null,
        category: formData.category || null,
        published_at: formData.is_published && !initialData?.published_at
          ? new Date().toISOString()
          : initialData?.published_at || null,
      }

      if (initialData) {
        const { error } = await supabase
          .from('blog_posts')
          // @ts-ignore - blog_posts table added via migration
          .update(data)
          .eq('id', initialData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('blog_posts')
          // @ts-ignore - blog_posts table added via migration
          .insert(data)

        if (error) throw error
      }

      router.push('/admin/blog')
      router.refresh()
    } catch (error) {
      console.error('Error saving blog post:', error)
      alert('Failed to save blog post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter post title"
          required
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="url-friendly-slug"
          required
        />
        <p className="mt-1 text-xs text-neutral-500">
          URL: /blog/{formData.slug || 'your-slug-here'}
        </p>
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          placeholder="Brief summary for previews..."
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Write your blog post content here..."
          rows={15}
          required
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="featured_image_url">Featured Image URL</Label>
          <Input
            id="featured_image_url"
            value={formData.featured_image_url}
            onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., News, Tips, Stories"
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
          <span className="text-sm text-neutral-700">Featured (highlighted post)</span>
        </label>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/blog')}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  )
}
