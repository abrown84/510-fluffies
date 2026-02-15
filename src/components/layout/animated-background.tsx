'use client'

import { useEffect, useState } from 'react'

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="animated-bg" aria-hidden="true">
      {/* Mesh gradient overlay */}
      <div className="mesh-gradient" />

      {/* Subtle grid pattern */}
      <div className="grid-pattern" />

      {/* Floating orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-orb bg-orb-4" />
      <div className="bg-orb bg-orb-5" />

      {/* Floating paw prints */}
      <div className="floating-paws">
        <span className="paw paw-1">🐾</span>
        <span className="paw paw-2">🐾</span>
        <span className="paw paw-3">🐾</span>
        <span className="paw paw-4">🐾</span>
        <span className="paw paw-5">🐾</span>
        <span className="paw paw-6">🐾</span>
        <span className="paw paw-7">🐾</span>
        <span className="paw paw-8">🐾</span>
      </div>
    </div>
  )
}
