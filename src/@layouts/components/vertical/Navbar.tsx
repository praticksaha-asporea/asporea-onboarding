'use client'

// Third-party Imports
import classnames from 'classnames'
import type { CSSObject } from '@emotion/styled'

// Type Imports
import type { ChildrenType } from '@core/types'

// Util Imports
import { verticalLayoutClasses } from '../../utils/layoutClasses'

// Styled Component Imports
import StyledHeader from '../../styles/vertical/StyledHeader'

type Props = ChildrenType & {
  overrideStyles?: CSSObject
}

const Navbar = (props: Props) => {
  const { children, overrideStyles } = props

  return (
    <StyledHeader
      overrideStyles={{
        position: 'sticky',
        top: '12px',
        zIndex: 1000,
        ...overrideStyles
      }}
      className={classnames(
        verticalLayoutClasses.header,
        verticalLayoutClasses.headerContentCompact,
        verticalLayoutClasses.headerDetached,
'sticky top-3 z-[1000] px-4 sm:px-6 w-full flex justify-between pointer-events-none'     )}
    >
      
    <div 
        className={classnames(
          verticalLayoutClasses.navbar, 
        'pointer-events-auto flex items-center justify-between w-full bg-transparent p-0'
        )}
      >
        {children}
      </div>
    </StyledHeader>
  )
}

export default Navbar