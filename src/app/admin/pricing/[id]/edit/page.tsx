import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { PricingForm } from '../../pricing-form'
import type { PricingOption } from '@/types/database'

interface EditPricingPageProps {
  params: Promise<{ id: string }>
}

async function getPricingOption(id: string): Promise<PricingOption | null> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('pricing_options')
    .select('*')
    .eq('id', id)
    .single()
  return data as PricingOption | null
}

export default async function EditPricingPage({ params }: EditPricingPageProps) {
  const { id } = await params
  const option = await getPricingOption(id)

  if (!option) {
    notFound()
  }

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
        <h1 className="text-2xl font-bold text-neutral-900">Edit Pricing Option</h1>
        <p className="mt-1 text-neutral-600">
          Update {option.name} - {option.subtitle}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <PricingForm initialData={option} />
        </CardContent>
      </Card>
    </div>
  )
}
