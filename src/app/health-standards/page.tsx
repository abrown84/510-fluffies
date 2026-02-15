import type { Metadata } from 'next'
import { Check, Shield, Heart, FileText, Stethoscope, Dna } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Health Standards',
  description:
    'Our commitment to health testing and responsible breeding practices for Fluffy French Bulldogs.',
}

const healthTests = [
  {
    name: 'DNA Panel',
    description:
      'Comprehensive genetic testing for over 200 conditions including DM, JHC, CMR1, and color genetics.',
    icon: Dna,
  },
  {
    name: 'OFA Hip Evaluation',
    description:
      'X-ray evaluation of hip joint conformation to screen for hip dysplasia.',
    icon: Stethoscope,
  },
  {
    name: 'OFA Patella',
    description:
      'Physical examination to check for luxating patellas (slipping kneecaps).',
    icon: Stethoscope,
  },
  {
    name: 'Cardiac Evaluation',
    description:
      'Heart examination by a veterinary cardiologist to rule out congenital defects.',
    icon: Heart,
  },
  {
    name: 'BOAS Assessment',
    description:
      'Brachycephalic Obstructive Airway Syndrome evaluation for breathing quality.',
    icon: Stethoscope,
  },
  {
    name: 'Spine Evaluation',
    description:
      'X-ray screening for vertebral abnormalities common in French Bulldogs.',
    icon: Stethoscope,
  },
]

const commitments = [
  'All breeding dogs are health tested before breeding',
  'Puppies receive age-appropriate vaccinations',
  'Puppies are dewormed on a regular schedule',
  'Puppies receive a full veterinary health check',
  'Two-year genetic health guarantee included',
  'Lifetime breeder support for all families',
  'Microchipping before going home',
  'Early neurological stimulation (ENS) protocols',
]

export default function HealthStandardsPage() {
  return (
    <div className="pt-28 pb-12 sm:pt-32 sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Health Standards
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
            We are committed to producing healthy, happy puppies. Our breeding program
            prioritizes health testing and responsible practices above all else.
          </p>
        </div>

        {/* Health Testing Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Required Health Testing
          </h2>
          <p className="mt-2 text-neutral-600">
            All our breeding dogs undergo the following evaluations
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {healthTests.map((test) => (
              <Card key={test.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                      <test.icon className="h-5 w-5 text-amber-600" />
                    </div>
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">{test.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Our Commitments */}
        <section className="mt-16">
          <div className="rounded-2xl bg-neutral-50 p-8 sm:p-12">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-amber-600" />
              <h2 className="text-2xl font-semibold text-neutral-900">
                Our Commitments
              </h2>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {commitments.map((commitment) => (
                <div key={commitment} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-neutral-700">{commitment}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Health Guarantee */}
        <section className="mt-16">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-8 sm:p-12">
              <h2 className="text-2xl font-semibold text-neutral-900">
                Health Guarantee
              </h2>
              <div className="mt-4 space-y-4 text-neutral-700">
                <p>
                  Every puppy from 510 Fluffies comes with a comprehensive two-year
                  genetic health guarantee. This covers any hereditary or congenital
                  conditions that may arise.
                </p>
                <p>
                  We believe in our breeding program and stand behind every puppy we produce.
                  If any covered health issue is discovered, we work with our families
                  to find the best solution, whether that&apos;s veterinary support or
                  replacement.
                </p>
                <p>
                  Our health guarantee requires that puppies be kept on a quality diet,
                  maintain regular veterinary care, and are not bred without explicit
                  written permission.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Why It Matters */}
        <section className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Why Health Testing Matters
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-neutral-600">
            French Bulldogs, especially fluffy varieties, can be prone to certain
            health conditions. By thoroughly testing our breeding dogs before any
            breeding takes place, we significantly reduce the risk of producing
            puppies with genetic health problems. This means healthier puppies,
            lower veterinary costs for families, and happier lives for our dogs.
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-neutral-600">
            We only breed dogs that have passed all required health evaluations.
            No exceptions. This commitment to health is what sets responsible
            breeders apart and ensures our puppies have the best start in life.
          </p>
        </section>
      </div>
    </div>
  )
}
