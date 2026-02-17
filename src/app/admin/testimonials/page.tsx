import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteTestimonialButton } from './delete-button'
import type { Testimonial } from '@/types/database'

async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true })
  return (data as Testimonial[]) || []
}

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials()

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Testimonials</h1>
          <p className="mt-1 text-neutral-600">
            Manage customer testimonials
          </p>
        </div>
        <Link href="/admin/testimonials/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>
        </Link>
      </div>

      {testimonials.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className={testimonial.featured ? 'ring-2 ring-amber-500' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {testimonial.customer_image_url ? (
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={testimonial.customer_image_url}
                        alt={testimonial.customer_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-semibold">
                      {testimonial.customer_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-neutral-900 truncate">
                      {testimonial.customer_name}
                    </h3>
                    {testimonial.customer_location && (
                      <p className="text-sm text-neutral-500">{testimonial.customer_location}</p>
                    )}
                  </div>
                  {testimonial.featured && (
                    <Badge variant="primary">Featured</Badge>
                  )}
                </div>

                {testimonial.rating && (
                  <div className="mt-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating!
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <h4 className="mt-3 font-medium text-neutral-900">{testimonial.title}</h4>
                <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{testimonial.content}</p>

                <div className="mt-3 flex items-center gap-2">
                  <Badge variant={testimonial.is_published ? 'success' : 'default'}>
                    {testimonial.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <span className="text-xs text-neutral-500">
                    Order: {testimonial.display_order}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href={`/admin/testimonials/${testimonial.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <DeleteTestimonialButton
                    testimonialId={testimonial.id}
                    testimonialName={testimonial.customer_name}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-neutral-500">No testimonials added yet</p>
            <Link href="/admin/testimonials/new" className="mt-4">
              <Button variant="primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Testimonial
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
