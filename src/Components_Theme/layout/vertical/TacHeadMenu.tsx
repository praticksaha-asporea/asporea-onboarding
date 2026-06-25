import { useTheme } from "@mui/material/styles";
import PerfectScrollbar from "react-perfect-scrollbar";
import type { VerticalMenuContextProps } from "../../../@menu/components/vertical-menu/Menu";
import { Menu, MenuItem } from "../../../@menu/vertical-menu";

// Hook Imports
import useVerticalNav from "../../../@menu/hooks/useVerticalNav";

// Styled Component Imports
import StyledVerticalNavExpandIcon from "../../../@menu/styles/vertical/StyledVerticalNavExpandIcon";

// Style Imports
import menuItemStyles from "@core/styles/vertical/menuItemStyles";
import menuSectionStyles from "@core/styles/vertical/menuSectionStyles";

type RenderExpandIconProps = {
  open?: boolean;
  transitionDuration?: VerticalMenuContextProps["transitionDuration"];
};

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className="ri-arrow-right-s-line" />
  </StyledVerticalNavExpandIcon>
);

const TacHeadMenu = ({
  scrollMenu,
}: {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void;
}) => {
  const theme = useTheme();
  const { isBreakpointReached, transitionDuration } = useVerticalNav();

  const ScrollWrapper = isBreakpointReached ? "div" : PerfectScrollbar;

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: "bs-full overflow-y-auto overflow-x-hidden",
          onScroll: (container) => scrollMenu(container, false),
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: (container) => scrollMenu(container, true),
        })}
    >
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => (
          <RenderExpandIcon open={open} transitionDuration={transitionDuration} />
        )}
        renderExpandedMenuItemIcon={{ icon: <i className="ri-circle-line" /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >

        <MenuItem
          href="/tac-head/dashboard"
          icon={<i className="ri-shield-check-line" />}
        >
          Escalations
        </MenuItem>
        <MenuItem
          href="/tac-head/documents"
          icon={<i className="ri-file-text-line" />}
        >
          Documents
        </MenuItem>
        <MenuItem
          href="/tac-head/technicals"
          icon={<i className="ri-computer-line" />}
        >
          Technicals
        </MenuItem>
      </Menu>
    </ScrollWrapper>
  );
};

export default TacHeadMenu;