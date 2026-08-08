// Third-party Imports
import styled from '@emotion/styled'

// Type Imports
import type { VerticalNavProps } from '../../components/vertical-menu/VerticalNav'

type StyledVerticalNavContainerProps = Pick<VerticalNavProps, 'width' | 'transitionDuration'>

const StyledVerticalNavContainer = styled.div<StyledVerticalNavContainerProps>`
  position: relative;
  block-size: 100%;
  inline-size: 100%;
  border-right: 1px solid var(--mui-palette-divider, #e2e8f0);
  /* Transition */
  transition-property: inline-size, inset-inline-start;
  transition-duration: ${({ transitionDuration }) => `${transitionDuration}ms`};
  transition-timing-function: ease-in-out;
`

export default StyledVerticalNavContainer
