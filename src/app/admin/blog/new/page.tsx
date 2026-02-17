import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { BlogForm } from '../blog-form'

export default function NewBlogPostPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/blog"
          className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">New Blog Post</h1>
        <p className="mt-1 text-neutral-600">
          Create a new blog post
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <BlogForm />
        </CardContent>
      </Card>
    </div>
  )
}
