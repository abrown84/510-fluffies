'use client'

import Image from 'next/image'
import Link from 'next/link'
import { GenderMale, GenderFemale } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Dog } from '@/types/database'

interface TreeNodeProps {
  dog: Dog
  size?: 'sm' | 'md' | 'lg'
  showLink?: boolean
}

export function TreeNode({ dog, size = 'md', showLink = true }: TreeNodeProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }

  const nameSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const content = (
    <div className={cn(
      'group flex flex-col items-center transition-transform hover:scale-105',
      showLink && 'cursor-pointer'
    )}>
      {/* Avatar */}
      <div className={cn(
        'relative overflow-hidden rounded-full ring-2 ring-offset-2',
        dog.gender === 'male' ? 'ring-blue-400' : 'ring-pink-400',
        sizeClasses[size]
      )}>
        {dog.image_url ? (
          <Image
            src={dog.image_url}
            alt={dog.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-100">
            <span className="text-2xl">🐕</span>
          </div>
        )}
      </div>

      {/* Name and gender */}
      <div className="mt-2 text-center">
        <p className={cn(
          'font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors',
          nameSizeClasses[size]
        )}>
          {dog.name}
        </p>
        <div className="flex items-center justify-center gap-1">
          {dog.gender === 'male' ? (
            <GenderMale weight="bold" className="h-3 w-3 text-blue-500" />
          ) : (
            <GenderFemale weight="bold" className="h-3 w-3 text-pink-500" />
          )}
          <span className="text-xs text-neutral-500">{dog.color}</span>
        </div>
      </div>
    </div>
  )

  if (showLink) {
    return <Link href={`/dogs/${dog.slug}`}>{content}</Link>
  }

  return content
}
