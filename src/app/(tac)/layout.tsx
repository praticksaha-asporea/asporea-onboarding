// Type Imports
import type { ChildrenType } from '@core/types'

// Layout Imports
import LayoutWrapper from '../../@layouts/LayoutWrapper'
import VerticalLayout from '../../@layouts/VerticalLayout'

// Component Imports
import Providers from '../../Components_Theme/Providers'
import Navbar from '../../Components_Theme/layout/vertical/Navbar'
import VerticalFooter from '../../Components_Theme/layout/vertical/Footer'
import TACNavigation from '@/Components_Theme/layout/vertical/TACNavigation'

const Layout = async ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <Providers direction={direction}>
      <LayoutWrapper
        verticalLayout={
          <VerticalLayout navigation={<TACNavigation />} navbar={<Navbar />} footer={<VerticalFooter />}>
            {children}
          </VerticalLayout>
        }
      />
    </Providers>
  )
}

export default Layout
