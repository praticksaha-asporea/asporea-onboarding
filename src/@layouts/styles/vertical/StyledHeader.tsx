// Third-party Imports
import styled from '@emotion/styled'
import type { CSSObject } from '@emotion/styled'

// Config Imports
import themeConfig from '../../../configs/themeConfig'

// Util Imports
import { verticalLayoutClasses } from '../../utils/layoutClasses'

type StyledHeaderProps = {
  overrideStyles?: CSSObject
}

const StyledHeader = styled.header<StyledHeaderProps>`
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
align-items: center !important;
justify-content: flex-end !important;
inline-size: 100% !important;
  flex-shrink: 0;
  min-block-size: var(--header-height);
  background-color: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;

  /* Template ki detached class ko override karo */
  &.${verticalLayoutClasses.headerDetached} {
    background-color: transparent !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
  }

  .${verticalLayoutClasses.navbar} {
    position: relative;
    padding-block: 10px;
    padding-inline: ${themeConfig.layoutPadding}px;
    inline-size: 100%;
    margin-inline: auto;
    max-inline-size: ${themeConfig.compactContentWidth}px;
    margin-inline-start: auto !important; 
    margin-inline-end: 0 !important;
  }

  ${({ overrideStyles }) => overrideStyles}
`

export default StyledHeader