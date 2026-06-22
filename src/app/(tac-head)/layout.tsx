 
import type { ChildrenType } from '@core/types'

 
import LayoutWrapper from '../../@layouts/LayoutWrapper'
import VerticalLayout from '../../@layouts/VerticalLayout'

 
import Providers from '../../Components_Theme/Providers'
import Navbar from '../../Components_Theme/layout/vertical/Navbar'
import VerticalFooter from '../../Components_Theme/layout/vertical/Footer'

 
import TacHeadNavigation from '@/Components_Theme/layout/vertical/TacHeadNavigation'

const Layout = async ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <Providers direction={direction}>
      <LayoutWrapper
        verticalLayout={
          <VerticalLayout 
            navigation={<TacHeadNavigation />} 
            navbar={<Navbar />} 
            footer={<VerticalFooter />}
          >
           
            {children}
          </VerticalLayout>
        }
      />
    </Providers>
  )
}

export default Layout