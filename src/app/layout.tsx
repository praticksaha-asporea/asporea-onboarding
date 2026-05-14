// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import './globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

import NextAuthProvider from '@/Components_Theme/NextAuthProvider'
import MainLayout from '@/Components/Layouts/MainLayout/MainLayout' 

export const metadata = {
  title: 'Asporea Candidate Onboarding',
  description:
    'Developed for future'
}

const RootLayout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
          <NextAuthProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </NextAuthProvider>
        </body>
    </html>
  )
}

export default RootLayout
