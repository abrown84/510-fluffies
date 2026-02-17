import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { BlogForm } from '../../blog-form'
import type { BlogPost } from '@/types/database'

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>
}

async function getBlogPost(id: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()
  return data as BlogPost | null
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params
  const post = await getBlogPost(id)

  if (!post) {
    notFound()
  }

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
        <h1 className="text-2xl font-bold text-neutral-900">Edit Blog Post</h1>
        <p className="mt-1 text-neutral-600">
          Update &quot;{post.title}&quot;
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <BlogForm initialData={post} />
        </CardContent>
      </Card>
    </div>
  )
}
