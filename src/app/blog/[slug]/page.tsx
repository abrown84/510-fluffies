import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { BlogPost } from '@/types/database'

export const revalidate = 3600

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data as BlogPost | null
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: post.title,
    description: post.excerpt || `Read "${post.title}" on the C.D. Certified Frenchies blog.`,
    openGraph: {
      title: `${post.title} | C.D. Certified Frenchies Blog`,
      description: post.excerpt || `Read "${post.title}" on the C.D. Certified Frenchies blog.`,
      images: post.featured_image_url ? [post.featured_image_url] : [],
      type: 'article',
      publishedTime: post.published_at || undefined,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#fffbf5] pt-28 pb-12 sm:pt-32 sm:pb-16">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center text-sm font-medium text-neutral-600 hover:text-amber-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mt-8">
          {post.category && (
            <Badge variant="primary" className="mb-4">
              {post.category}
            </Badge>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            {post.title}
          </h1>
          {post.published_at && (
            <div className="mt-4 flex items-center gap-2 text-neutral-500">
              <Calendar className="h-4 w-4" />
              {formatDate(post.published_at)}
            </div>
          )}
        </header>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="mt-8 relative aspect-video overflow-hidden rounded-2xl bg-neutral-100">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="mt-8 prose prose-lg prose-neutral max-w-none">
          {/* Render content - in a real app you'd use a markdown renderer */}
          <div className="whitespace-pre-wrap text-neutral-700 leading-relaxed">
            {post.content}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-lg bg-amber-50 p-6 text-center">
          <h3 className="text-lg font-semibold text-neutral-900">
            Interested in a C.D. Certified Frenchies puppy?
          </h3>
          <p className="mt-2 text-neutral-600">
            Start your application today and join our family.
          </p>
          <Link href="/apply" className="mt-4 inline-block">
            <Button variant="primary">
              Apply Now
            </Button>
          </Link>
        </div>
      </article>
    </div>
  )
}
