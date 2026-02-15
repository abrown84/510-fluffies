import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-neutral-900">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-neutral-700">
        Page Not Found
      </h2>
      <p className="mt-2 text-neutral-600">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/">
          <Button variant="primary">Go Home</Button>
        </Link>
        <Link href="/dogs">
          <Button variant="outline">View Our Dogs</Button>
        </Link>
      </div>
    </div>
  )
}
