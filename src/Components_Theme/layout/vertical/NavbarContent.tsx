
// MUI Imports
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import ModeDropdown from '../../../Components_Theme/layout/shared/ModeDropdown'
import UserDropdown from '../../../Components_Theme/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '../../../@layouts/utils/layoutClasses'

const NavbarContent = () => {
  return (
   <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between w-full')}>
      {/* 🟢 LEFT: Plain Toggle Icon (Mobile Only - No capsule, no bg) */}
      <div className='flex items-center lg:hidden'>
        <NavToggle />
      </div>

      {/* 🟢 RIGHT: Capsule Pill (Sirf DarkMode + Profile icon ke liye) */}
      <div className='flex items-center gap-1.5 rounded-full px-2.5 py-1.5 ml-auto bg-[var(--mui-palette-background-paper)] border border-[var(--mui-palette-divider)] shadow-md'>
        <ModeDropdown />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
