import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { BlogCard } from '@/components/blog/blog-card'
import type { BlogPost } from '@/types/database'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'News, tips, and stories from C.D. Certified Frenchies. Stay up to date with our breeding program and learn about Fluffy French Bulldog care.',
}

export const revalidate = 3600

async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
  return (data as BlogPost[]) || []
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  const featured = posts.filter(p => p.featured)
  const regular = posts.filter(p => !p.featured)

  return (
    <div className="min-h-screen bg-[#fffbf5]">
      {/* Hero with Bay Area Background */}
      <div className="relative pt-28 pb-16 sm:pt-32 sm:pb-20">
        {/* Background Image - SF Skyline Night */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/photos/sf-skyline-night.jpg)' }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1612]/80 via-[#1a1612]/70 to-[#fffbf5]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]">
              News & Updates
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Our Blog
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-200">
              News, tips, and stories from C.D. Certified Frenchies. Stay up to date with our
              breeding program and learn about Fluffy French Bulldog care.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">

        {/* Featured Posts */}
        {featured.length > 0 && (
          <section className="mt-16 relative overflow-hidden rounded-2xl p-8 sm:p-12">
            {/* Bay Area Background */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/photos/golden-gate-fog.jpg)' }}
            />
            <div className="absolute inset-0 bg-[#fffbf5]/92" />
            <div className="relative">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-8">
                Featured
              </h2>
              <div className="grid gap-8 md:grid-cols-2">
                {featured.map((post) => (
                  <BlogCard key={post.id} post={post} featured />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Posts */}
        {regular.length > 0 && (
          <section className="mt-8 relative overflow-hidden rounded-2xl p-8 sm:p-12">
            {/* Bay Area Background */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/photos/alcatraz-sf-skyline.jpg)' }}
            />
            <div className="absolute inset-0 bg-[#fffbf5]/92" />
            <div className="relative">
              {featured.length > 0 && (
                <h2 className="text-2xl font-semibold text-neutral-900 mb-8">
                  Latest Posts
                </h2>
              )}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {regular.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg text-neutral-500">
              No blog posts yet. Check back soon!
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-neutral-600 mb-4">
            Follow us for more updates and adorable puppy content!
          </p>
          <a
            href="https://www.instagram.com/cd.certifiedfrenchies/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="primary" size="lg">
              Follow on Instagram
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
