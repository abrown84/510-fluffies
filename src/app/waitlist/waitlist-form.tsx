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
import { submitWaitlist } from './actions'

const waitlistSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  preferred_sex: z.enum(['male', 'female', 'either']),
  preferred_color: z.string().optional(),
  timeline: z.string().min(1, 'Timeline is required'),
  how_heard_about_us: z.string().optional(),
  additional_notes: z.string().optional(),
})

type WaitlistFormData = z.infer<typeof waitlistSchema>

export function WaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      preferred_sex: 'either',
    },
  })

  const onSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await submitWaitlist(data)
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
          You&apos;re on the List!
        </h2>
        <p className="mt-4 max-w-md text-neutral-600">
          Thank you for joining our waitlist! We&apos;ll notify you as soon as
          new puppies become available.
        </p>
        <p className="mt-4 text-sm text-neutral-500">
          Follow us on{' '}
          <a
            href="https://www.instagram.com/510.fluffies/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:underline"
          >
            Instagram
          </a>{' '}
          for daily updates!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">
          Contact Information
        </h3>
        <p className="mt-1 text-sm text-neutral-600">
          We&apos;ll use this to notify you about available puppies.
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
              Phone (optional)
            </label>
            <Input
              type="tel"
              {...register('phone')}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                City
              </label>
              <Input {...register('city')} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                State
              </label>
              <Input {...register('state')} className="mt-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">
          Your Preferences
        </h3>
        <p className="mt-1 text-sm text-neutral-600">
          Help us match you with the perfect puppy.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Preferred Sex
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
              placeholder="e.g., cream, lilac"
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
      </div>

      {/* Additional Info */}
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

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Anything else you&apos;d like us to know?
        </label>
        <Textarea
          {...register('additional_notes')}
          placeholder="Tell us about yourself or any questions you have"
          className="mt-1"
          rows={3}
        />
      </div>

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
            Joining Waitlist...
          </>
        ) : (
          'Join Waitlist'
        )}
      </Button>
    </form>
  )
}
