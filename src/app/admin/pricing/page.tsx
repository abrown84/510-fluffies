import Link from 'next/link'
import { Plus, Edit, Trash2, Star, Crown, Heart, Handshake, Shield, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeletePricingButton } from './delete-button'
import type { PricingOption } from '@/types/database'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Crown,
  Handshake,
  Star,
  Shield,
  Certificate: Award,
}

async function getPricingOptions(): Promise<PricingOption[]> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('pricing_options')
    .select('*')
    .order('display_order', { ascending: true })
  return (data as PricingOption[]) || []
}

export default async function AdminPricingPage() {
  const options = await getPricingOptions()
  const ownershipOptions = options.filter((o) => o.option_type === 'ownership')
  const serviceOptions = options.filter((o) => o.option_type === 'service')

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pricing Options</h1>
          <p className="mt-1 text-neutral-600">
            Manage ownership and service pricing
          </p>
        </div>
        <Link href="/admin/pricing/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Option
          </Button>
        </Link>
      </div>

      {/* Ownership Options */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-neutral-900">Ownership Options</h2>
        {ownershipOptions.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ownershipOptions.map((option) => {
              const Icon = iconMap[option.icon] || Heart
              return (
                <Card key={option.id} className={option.featured ? 'ring-2 ring-amber-500' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                          <Icon className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">{option.name}</h3>
                          <p className="text-sm text-amber-600">{option.subtitle}</p>
                        </div>
                      </div>
                      {option.featured && (
                        <Badge variant="primary">Featured</Badge>
                      )}
                    </div>
                    <div className="mt-3">
                      <span className="text-2xl font-bold text-neutral-900">{option.price}</span>
                      {option.price_note && (
                        <span className="ml-2 text-sm text-neutral-500">{option.price_note}</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-neutral-600 line-clamp-2">{option.description}</p>
                    <div className="mt-2 text-xs text-neutral-500">
                      {option.features.length} features • Order: {option.display_order}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge variant={option.is_active ? 'success' : 'default'}>
                        {option.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/admin/pricing/${option.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <DeletePricingButton optionId={option.id} optionName={option.name} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-neutral-500">No ownership options added</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Service Options */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-neutral-900">Additional Services</h2>
        {serviceOptions.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceOptions.map((option) => {
              const Icon = iconMap[option.icon] || Star
              return (
                <Card key={option.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                        <Icon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{option.name}</h3>
                        <span className="text-lg font-bold text-amber-600">{option.price}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-neutral-600">{option.description}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge variant={option.is_active ? 'success' : 'default'}>
                        {option.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/admin/pricing/${option.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <DeletePricingButton optionId={option.id} optionName={option.name} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-neutral-500">No additional services added</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
