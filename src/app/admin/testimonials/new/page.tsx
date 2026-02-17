import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { TestimonialForm } from '../testimonial-form'

export default function NewTestimonialPage() {
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
        <h1 className="text-2xl font-bold text-neutral-900">Add Testimonial</h1>
        <p className="mt-1 text-neutral-600">
          Add a new customer testimonial
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <TestimonialForm />
        </CardContent>
      </Card>
    </div>
  )
}
