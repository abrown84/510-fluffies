'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ProfessionalImageProps {
  src: string
  alt: string
  fill?: boolean
  priority?: boolean
  className?: string
  containerClassName?: string
  variant?: 'hero' | 'card' | 'gallery' | 'portrait'
  showSparkles?: boolean
  parallax?: boolean
}

export function ProfessionalImage({
  src,
  alt,
  fill = true,
  priority = false,
  className,
  containerClassName,
  variant = 'card',
  showSparkles = false,
  parallax = false,
}: ProfessionalImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!parallax || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePosition({ x, y })
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 })
  }

  const variantStyles = {
    hero: 'pro-image-hero',
    card: 'pro-image-card',
    gallery: 'pro-image-gallery',
    portrait: 'pro-image-portrait',
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'pro-image-container relative overflow-hidden',
        variantStyles[variant],
        containerClassName
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated background gradient */}
      <div className="pro-image-bg-gradient absolute inset-0 z-0" />

      {/* Main image with parallax */}
      <div
        className="pro-image-wrapper absolute inset-0"
        style={
          parallax
            ? {
                transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px) scale(1.05)`,
                transition: 'transform 0.3s ease-out',
              }
            : undefined
        }
      >
        <Image
          src={src}
          alt={alt}
          fill={fill}
          priority={priority}
          className={cn(
            'pro-image object-cover transition-all duration-700',
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
            className
          )}
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      {/* Professional lighting overlay */}
      <div className="pro-image-lighting absolute inset-0 z-10 pointer-events-none" />

      {/* Vignette effect */}
      <div className="pro-image-vignette absolute inset-0 z-10 pointer-events-none" />

      {/* Soft glow border */}
      <div className="pro-image-glow absolute inset-0 z-10 pointer-events-none" />

      {/* Sparkle effects */}
      {showSparkles && (
        <div className="pro-sparkles absolute inset-0 z-20 pointer-events-none">
          <div className="sparkle sparkle-1" />
          <div className="sparkle sparkle-2" />
          <div className="sparkle sparkle-3" />
          <div className="sparkle sparkle-4" />
        </div>
      )}

      {/* Hover shine effect */}
      <div className="pro-image-shine absolute inset-0 z-20 pointer-events-none" />
    </div>
  )
}

// Animated floating image for hero sections
export function FloatingImage({
  src,
  alt,
  className,
  delay = 0,
}: {
  src: string
  alt: string
  className?: string
  delay?: number
}) {
  return (
    <div
      className={cn('floating-image-container', className)}
      style={{ animationDelay: `${delay}s` }}
    >
      <ProfessionalImage
        src={src}
        alt={alt}
        variant="hero"
        parallax
        showSparkles
      />
    </div>
  )
}
