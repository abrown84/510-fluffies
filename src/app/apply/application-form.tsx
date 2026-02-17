'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { submitApplication } from './actions'

const applicationSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Phone number is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  experience_level: z.enum(['first_time', 'experienced', 'breeder']),
  living_situation: z.enum(['house', 'apartment', 'condo', 'other']),
  has_yard: z.string(),
  has_other_pets: z.string(),
  other_pets_description: z.string().optional(),
  has_children: z.string(),
  children_ages: z.string().optional(),
  household_description: z.string().min(20, 'Please describe your household'),
  goals: z.string().min(20, 'Please describe your goals'),
  timeline: z.string().min(1, 'Timeline is required'),
  budget_range: z.string().min(1, 'Budget range is required'),
  preferred_sex: z.enum(['male', 'female', 'either']),
  preferred_color: z.string().optional(),
  how_heard_about_us: z.string().optional(),
  additional_notes: z.string().optional(),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      experience_level: 'first_time',
      living_situation: 'house',
      preferred_sex: 'either',
    },
  })

  const hasOtherPets = watch('has_other_pets')
  const hasChildren = watch('has_children')

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await submitApplication(data)
      if (result.success) {
        setIsSuccess(true)
      } else {
        setError(result.error || 'Something went wrong')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-neutral-900">
          Application Submitted!
        </h2>
        <p className="mt-4 max-w-md text-neutral-600">
          Thank you for your interest in a C.D. Certified Frenchies puppy. We will review your
          application and get back to you within 48 hours.
        </p>
        <p className="mt-4 text-sm text-neutral-500">
          In the meantime, follow us on{' '}
          <a
            href="https://www.instagram.com/cd.certifiedfrenchies/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:underline"
          >
            Instagram
          </a>{' '}
          for updates!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Contact Information */}
      <section>
        <h3 className="text-lg font-semibold text-neutral-900">
          Contact Information
        </h3>
        <p className="mt-1 text-sm text-neutral-600">
          How can we reach you?
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Full Name *
            </label>
            <Input
              {...register('name')}
              error={errors.name?.message}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Email *
            </label>
            <Input
              type="email"
              {...register('email')}
              error={errors.email?.message}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Phone *
            </label>
            <Input
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                City *
              </label>
              <Input
                {...register('city')}
                error={errors.city?.message}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                State *
              </label>
              <Input
                {...register('state')}
                error={errors.state?.message}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section>
        <h3 className="text-lg font-semibold text-neutral-900">
          Your Experience
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Dog Ownership Experience *
            </label>
            <Select
              {...register('experience_level')}
              error={errors.experience_level?.message}
              className="mt-1"
            >
              <option value="first_time">First-time dog owner</option>
              <option value="experienced">Experienced dog owner</option>
              <option value="breeder">Breeder / Show exhibitor</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              How did you hear about us?
            </label>
            <Input
              {...register('how_heard_about_us')}
              placeholder="Instagram, referral, etc."
              className="mt-1"
            />
          </div>
        </div>
      </section>

      {/* Living Situation */}
      <section>
        <h3 className="text-lg font-semibold text-neutral-900">
          Living Situation
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Type of Home *
            </label>
            <Select
              {...register('living_situation')}
              error={errors.living_situation?.message}
              className="mt-1"
            >
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo/Townhouse</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Do you have a yard? *
            </label>
            <Select {...register('has_yard')} className="mt-1">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Do you have other pets? *
            </label>
            <Select {...register('has_other_pets')} className="mt-1">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </div>
          {hasOtherPets === 'yes' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Please describe your other pets
              </label>
              <Input
                {...register('other_pets_description')}
                placeholder="Species, breed, age, temperament"
                className="mt-1"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Do you have children? *
            </label>
            <Select {...register('has_children')} className="mt-1">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </div>
          {hasChildren === 'yes' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Ages of children
              </label>
              <Input
                {...register('children_ages')}
                placeholder="e.g., 5, 8, 12"
                className="mt-1"
              />
            </div>
          )}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-neutral-700">
            Describe your household and daily routine *
          </label>
          <Textarea
            {...register('household_description')}
            error={errors.household_description?.message}
            placeholder="Who lives in the home? Work schedules? Activity level? How much time will the puppy spend alone?"
            className="mt-1"
            rows={4}
          />
        </div>
      </section>

      {/* Goals and Preferences */}
      <section>
        <h3 className="text-lg font-semibold text-neutral-900">
          Goals & Preferences
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Why do you want a Fluffy French Bulldog? *
            </label>
            <Textarea
              {...register('goals')}
              error={errors.goals?.message}
              placeholder="What are you looking for in a companion? Any specific goals like showing, breeding, or pet only?"
              className="mt-1"
              rows={3}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Preferred Sex *
              </label>
              <Select {...register('preferred_sex')} className="mt-1">
                <option value="either">No preference</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Preferred Color
              </label>
              <Input
                {...register('preferred_color')}
                placeholder="e.g., cream, lilac, blue"
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Timeline *
              </label>
              <Select
                {...register('timeline')}
                error={errors.timeline?.message}
                className="mt-1"
              >
                <option value="">Select...</option>
                <option value="asap">As soon as possible</option>
                <option value="1-3months">1-3 months</option>
                <option value="3-6months">3-6 months</option>
                <option value="6-12months">6-12 months</option>
                <option value="flexible">Flexible / Waiting for right match</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Budget Range *
            </label>
            <Select
              {...register('budget_range')}
              error={errors.budget_range?.message}
              className="mt-1"
            >
              <option value="">Select...</option>
              <option value="5000-6000">$5,000 - $6,000</option>
              <option value="6000-8000">$6,000 - $8,000</option>
              <option value="8000-10000">$8,000 - $10,000</option>
              <option value="10000+">$10,000+</option>
            </Select>
          </div>
        </div>
      </section>

      {/* Additional Notes */}
      <section>
        <h3 className="text-lg font-semibold text-neutral-900">
          Anything Else?
        </h3>
        <div className="mt-4">
          <label className="block text-sm font-medium text-neutral-700">
            Additional notes or questions
          </label>
          <Textarea
            {...register('additional_notes')}
            placeholder="Anything else you&apos;d like us to know?"
            className="mt-1"
            rows={3}
          />
        </div>
      </section>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Submitting Application...
          </>
        ) : (
          'Submit Application'
        )}
      </Button>
    </form>
  )
}
