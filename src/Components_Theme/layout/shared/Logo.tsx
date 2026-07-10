'use client'

// React Imports
import { useSettings } from '@core/hooks/useSettings'

// Component Imports
import MaterioLogo from '@core/svg/Logo'

const Logo = () => {
  let mode = 'light'
  try {
    const { settings } = useSettings()
    mode = settings.mode || 'light'
  } catch (e) {
    // fallback if context is not available
  }

  return (
    <>
      <div
        key={mode}
        className='logo-container-animated'
      >
        <div className='flex items-center min-bs-[24px]'>
          <MaterioLogo className='text-[22px] text-primary' />
        </div>
      </div>
    </>
  )
}

export default Logo
