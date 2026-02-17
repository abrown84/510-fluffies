'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Calendar, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate } from '@/lib/utils'
import type { BlogPost } from '@/types/database'

interface BlogCardProps {
  post: BlogPost
  featured?: boolean
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <Link href={`/blog/${post.slug}`}>
      <article
        className={cn(
          'group luxury-card overflow-hidden rounded-sm transition-all duration-300 hover:shadow-lg',
          featured && 'ring-2 ring-amber-200'
        )}
      >
        {/* Image */}
        <div className={cn(
          'relative overflow-hidden bg-neutral-100',
          featured ? 'aspect-[16/9]' : 'aspect-video'
        )}>
          {post.featured_image_url ? (
            <>
              <Image
                src={post.featured_image_url}
                alt={post.title}
                fill
                className={cn(
                  'object-cover transition-all duration-700',
                  isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
                  'group-hover:scale-105'
                )}
                onLoad={() => setIsLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-6xl opacity-30">📝</span>
            </div>
          )}
          {post.category && (
            <div className="absolute top-4 left-4">
              <Badge variant="primary" className="backdrop-blur-sm">
                {post.category}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 bg-gradient-to-b from-white to-[#faf6f0]">
          {/* Date */}
          {post.published_at && (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Calendar className="h-4 w-4" />
              {formatDate(post.published_at)}
            </div>
          )}

          {/* Title */}
          <h3 className={cn(
            'mt-2 font-display font-medium text-neutral-900 group-hover:text-amber-600 transition-colors',
            featured ? 'text-2xl' : 'text-lg'
          )}>
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* Read more link */}
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Read more
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  )
}
