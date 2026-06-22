'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { styled, useTheme } from '@mui/material/styles'
import VerticalNav, { NavHeader } from '../../../@menu/vertical-menu'
import Logo from '../shared/Logo'
import useVerticalNav from '../../../@menu/hooks/useVerticalNav'
import navigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'

 
import TacHeadMenu from './TacHeadMenu'

const StyledBoxForShadow = styled('div')(({ theme }) => ({
  top: 60,
  left: -8,
  zIndex: 2,
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  width: 'calc(100% + 15px)',
  height: theme.mixins.toolbar.minHeight,
  transition: 'opacity .15s ease-in-out',
  background: `linear-gradient(var(--mui-palette-background-default) 5%, rgb(var(--mui-palette-background-defaultChannel) / 0.85) 30%, rgb(var(--mui-palette-background-defaultChannel) / 0.5) 65%, rgb(var(--mui-palette-background-defaultChannel) / 0.3) 75%, transparent)`,
  '&.scrolled': {
    opacity: 1
  }
}))

const TacHeadNavigation = () => {
  const theme = useTheme()
  const { isBreakpointReached, toggleVerticalNav } = useVerticalNav()
  const shadowRef = useRef(null)

  const scrollMenu = (container: any, isPerfectScrollbar: boolean) => {
    container = isBreakpointReached || !isPerfectScrollbar ? container.target : container
    if (shadowRef && container.scrollTop > 0) {
      // @ts-ignore
      if (!shadowRef.current.classList.contains('scrolled')) {
        // @ts-ignore
        shadowRef.current.classList.add('scrolled')
      }
    } else {
      // @ts-ignore
      shadowRef.current.classList.remove('scrolled')
    }
  }

  return (
    <VerticalNav customStyles={navigationCustomStyles(theme)}>
      <NavHeader>
        <Link href='/'>
          <Logo />
        </Link>
        {isBreakpointReached && <i className='ri-close-line text-xl' onClick={() => toggleVerticalNav(false)} />}
      </NavHeader>
      <StyledBoxForShadow ref={shadowRef} />
      
       
      <TacHeadMenu scrollMenu={scrollMenu} />
    </VerticalNav>
  )
}

export default TacHeadNavigation