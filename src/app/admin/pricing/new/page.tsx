import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PricingForm } from '../pricing-form'

export default function NewPricingPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/pricing"
          className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pricing
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Add Pricing Option</h1>
        <p className="mt-1 text-neutral-600">
          Create a new ownership option or service
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <PricingForm />
        </CardContent>
      </Card>
    </div>
  )
}
