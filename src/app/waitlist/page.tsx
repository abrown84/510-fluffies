import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, Heart, Bell } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { WaitlistForm } from './waitlist-form'

export const metadata: Metadata = {
  title: 'Join Our Waitlist',
  description:
    'Join the 510 Fluffies waitlist to be notified when puppies become available. Be first in line for your perfect Fluffy French Bulldog companion.',
}

const benefits = [
  {
    icon: Bell,
    title: 'Early Notifications',
    description: 'Be the first to know when new litters are announced',
  },
  {
    icon: Heart,
    title: 'Priority Consideration',
    description: 'Waitlist members are considered before public announcements',
  },
  {
    icon: Clock,
    title: 'No Obligation',
    description: 'Join for free with no commitment required',
  },
]

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-[#fffbf5] pt-28 pb-12 sm:pt-32 sm:pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Join Our Waitlist
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
            Be the first to know when our next litter arrives. Join our waitlist
            to receive early notifications and get priority consideration.
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title}>
              <CardContent className="p-4 text-center">
                <div className="flex justify-center">
                  <benefit.icon className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="mt-3 font-semibold text-neutral-900">
                  {benefit.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Waitlist Form */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <WaitlistForm />
            </CardContent>
          </Card>
        </div>

        {/* Ready to Apply */}
        <div className="mt-8 text-center">
          <p className="text-neutral-600">
            Ready to apply for a puppy now?{' '}
            <Link href="/apply" className="text-amber-600 hover:text-amber-700 font-medium">
              Submit a full application
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
