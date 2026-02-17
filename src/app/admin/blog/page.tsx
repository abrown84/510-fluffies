import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { DeleteBlogPostButton } from './delete-button'
import type { BlogPost } from '@/types/database'

async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as BlogPost[]) || []
}

export default async function AdminBlogPage() {
  const posts = await getBlogPosts()

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Blog Posts</h1>
          <p className="mt-1 text-neutral-600">
            Manage your blog content
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className={post.featured ? 'ring-2 ring-amber-500' : ''}>
              <div className="relative aspect-video bg-neutral-100">
                {post.featured_image_url ? (
                  <Image
                    src={post.featured_image_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                )}
                {post.featured && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="primary">Featured</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-neutral-900 line-clamp-2">
                  {post.title}
                </h3>

                {post.category && (
                  <Badge variant="default" className="mt-2">
                    {post.category}
                  </Badge>
                )}

                {post.published_at && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-neutral-500">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.published_at)}
                  </div>
                )}

                <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
                  {post.excerpt || 'No excerpt'}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <Badge variant={post.is_published ? 'success' : 'default'}>
                    {post.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href={`/admin/blog/${post.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <DeleteBlogPostButton postId={post.id} postTitle={post.title} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-neutral-500">No blog posts yet</p>
            <Link href="/admin/blog/new" className="mt-4">
              <Button variant="primary">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Post
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
