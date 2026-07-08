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

  const isDark = mode === 'dark'
  const logoBg = isDark ? '#f4f5fa' : '#f4f5fa'

  return (
    <>
      {/* <style>{`
        @keyframes slideDownLogo {
          0% {
            transform: translateY(-30px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .logo-container-animated {
          animation: slideDownLogo 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
        }
      `}</style> */}
      <div
        key={mode}
        className='logo-container-animated'
        style={{
          // background: logoBg,
          borderRadius: '15px 40px 15px 40px',
          // width: '90%'
        }}
      >
        <div className='flex items-center min-bs-[24px]'>
          <MaterioLogo className='text-[22px] text-primary' />
        </div>
      </div>
    </>
  )
}

export default Logo
