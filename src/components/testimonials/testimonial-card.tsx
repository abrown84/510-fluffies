'use client'

import Image from 'next/image'
import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Testimonial } from '@/types/database'

interface TestimonialCardProps {
  testimonial: Testimonial
  featured?: boolean
}

export function TestimonialCard({ testimonial, featured = false }: TestimonialCardProps) {
  return (
    <Card className={cn(
      'overflow-hidden transition-all duration-300 hover:shadow-lg',
      featured && 'ring-2 ring-amber-200'
    )}>
      <CardContent className="p-6">
        {/* Quote icon */}
        <Quote className="h-8 w-8 text-amber-200" />

        {/* Rating */}
        {testimonial.rating && (
          <div className="mt-4 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < testimonial.rating!
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-neutral-200'
                )}
              />
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="mt-4 text-lg font-semibold text-neutral-900">
          {testimonial.title}
        </h3>

        {/* Content */}
        <p className="mt-3 text-neutral-600 leading-relaxed">
          {testimonial.content}
        </p>

        {/* Author */}
        <div className="mt-6 flex items-center gap-3">
          {testimonial.customer_image_url ? (
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-neutral-100">
              <Image
                src={testimonial.customer_image_url}
                alt={testimonial.customer_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-semibold">
              {testimonial.customer_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-neutral-900">
              {testimonial.customer_name}
            </p>
            {testimonial.customer_location && (
              <p className="text-sm text-neutral-500">
                {testimonial.customer_location}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
