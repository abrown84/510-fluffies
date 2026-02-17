import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { TestimonialForm } from '../../testimonial-form'
import type { Testimonial } from '@/types/database'

interface EditTestimonialPageProps {
  params: Promise<{ id: string }>
}

async function getTestimonial(id: string): Promise<Testimonial | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .single()
  return data as Testimonial | null
}

export default async function EditTestimonialPage({ params }: EditTestimonialPageProps) {
  const { id } = await params
  const testimonial = await getTestimonial(id)

  if (!testimonial) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/testimonials"
          className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Testimonials
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Edit Testimonial</h1>
        <p className="mt-1 text-neutral-600">
          Update testimonial from {testimonial.customer_name}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <TestimonialForm initialData={testimonial} />
        </CardContent>
      </Card>
    </div>
  )
}
