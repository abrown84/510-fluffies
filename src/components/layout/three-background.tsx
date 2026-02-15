'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// Declare Vanta on window
declare global {
  interface Window {
    VANTA: {
      FOG: (options: Record<string, unknown>) => { destroy: () => void }
    }
  }
}

export function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const vantaEffect = useRef<{ destroy: () => void } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !containerRef.current) return

    // Dynamically import Vanta fog effect
    const loadVanta = async () => {
      try {
        // @ts-expect-error - Vanta doesn't have proper types
        const FOG = (await import('vanta/dist/vanta.fog.min')).default

        if (containerRef.current && !vantaEffect.current) {
          vantaEffect.current = FOG({
            el: containerRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            // Subtle amber/cream color scheme
            highlightColor: 0xc9a227, // Gold
            midtoneColor: 0x8b6914,   // Dark gold
            lowlightColor: 0x2d2926,  // Dark brown
            baseColor: 0x1a1612,      // Very dark brown (matches hero)
            blurFactor: 0.6,
            speed: 0.8,               // Slower, more subtle
            zoom: 0.8,
          })
        }
      } catch (error) {
        console.error('Failed to load Vanta effect:', error)
      }
    }

    loadVanta()

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
        vantaEffect.current = null
      }
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, #1a1612 0%, #2d2926 50%, #1a1612 100%)'
      }}
      aria-hidden="true"
    />
  )
}
