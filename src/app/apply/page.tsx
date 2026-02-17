import type { Metadata } from 'next'
import { FileText, CheckCircle, Clock, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ApplicationForm } from './application-form'

export const metadata: Metadata = {
  title: 'Apply for a Puppy',
  description:
    'Submit your application for a Fluffy French Bulldog puppy from C.D. Certified Frenchies. Start your journey to bringing home your perfect companion.',
}

const steps = [
  {
    icon: FileText,
    title: 'Submit Application',
    description: 'Fill out our detailed application form below',
  },
  {
    icon: Clock,
    title: 'Application Review',
    description: 'We carefully review each application within 48 hours',
  },
  {
    icon: MessageSquare,
    title: 'Interview',
    description: 'Approved applicants are invited for a phone or video call',
  },
  {
    icon: CheckCircle,
    title: 'Approval & Deposit',
    description: 'Place your deposit to secure your spot on our waitlist',
  },
]

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-[#fffbf5]">
      {/* Hero with Bay Area Background */}
      <div className="relative pt-28 pb-16 sm:pt-32 sm:pb-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/photos/bay-bridge-road.jpg)' }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1612]/80 via-[#1a1612]/70 to-[#fffbf5]" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]">
              C.D. Certified Frenchies
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Puppy Application
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-200">
              Thank you for your interest in a C.D. Certified Frenchies puppy! Please complete the
              application below so we can learn more about you and your home.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">

        {/* Process Steps */}
        <div className="mt-12">
          <h2 className="text-center text-lg font-semibold text-neutral-900">
            Our Application Process
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <Card key={step.title} className="relative">
                <CardContent className="p-4 text-center">
                  <div className="absolute -top-2 left-4 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="flex justify-center">
                    <step.icon className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="mt-3 font-semibold text-neutral-900">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-600">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <ApplicationForm />
            </CardContent>
          </Card>
        </div>

        {/* Note */}
        <div className="mt-8 rounded-lg bg-amber-50 p-4 text-center text-sm text-amber-800">
          <strong>Note:</strong> Submitting an application does not guarantee a puppy.
          We carefully match each puppy with the best-suited family. All applications
          are reviewed in the order received.
        </div>
      </div>
    </div>
  )
}
