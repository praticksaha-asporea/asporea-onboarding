'use client'

// Next Imports
import Image from 'next/image'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Type Imports
import type { SVGAttributes } from 'react'

const Logo = (props: SVGAttributes<SVGElement>) => {
  let mode = 'light'

  try {
    const { settings } = useSettings()

    mode = settings.mode || 'light'
  } catch {
    // fallback if context is not available
  }

  const src = mode === 'dark' ? '/images/static/logo-dark.svg' : '/images/static/logo.svg'

  return (
    <Image
      src={src}
      alt="Logo"
      width={270}
      height={75}
      priority
      className={props.className}
    />
  )
}

export default Logo
