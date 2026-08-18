import { useTheme } from "@mui/material/styles";

import PerfectScrollbar from "react-perfect-scrollbar";
import { useSelector } from "react-redux";
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

const RenderExpandIcon = ({
  open,
  transitionDuration,
}: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon
    open={open}
    transitionDuration={transitionDuration}
  >
    <i className="ri-arrow-right-s-line" />
  </StyledVerticalNavExpandIcon>
);

const TacMenu = ({
  scrollMenu,
}: {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void;
}) => {
  // Hooks
  const theme = useTheme();
  const { isBreakpointReached, transitionDuration } = useVerticalNav();
  const currentUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const isFoe =
    currentUser?.role === "foe" || currentUser?.user?.role === "foe";
  const ScrollWrapper = isBreakpointReached ? "div" : PerfectScrollbar;

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
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
      {/* Vertical Menu */}
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => (
          <RenderExpandIcon
            open={open}
            transitionDuration={transitionDuration}
          />
        )}
        renderExpandedMenuItemIcon={{ icon: <i className="ri-circle-line" /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        <MenuItem href="/dashboard" icon={<i className="ri-dashboard-line" />}>
          Dashboard
        </MenuItem>
        {!isFoe && (
          <MenuItem
            href="/dashboard/schedules"
            icon={<i className="ri-calendar-schedule-line" />}
          >
            Schedules
          </MenuItem>
        )}
        {isFoe && (
          <MenuItem
            href="/dashboard/pending-tracking"
            icon={<i className="ri-time-line" />}
          >
            Follow Ups{" "}
          </MenuItem>
        )}
        {/* <MenuItem
          href="/inquiries"
          icon={<i className="ri-question-line" />}
        >
          Inquiries
        </MenuItem>
        <MenuItem
          href="/assigned-candidates"
          icon={<i className="ri-user-2-line" />}
        >
          Assigned Candidates
        </MenuItem>
        <MenuItem
          href="/todays-schedule"
          icon={<i className="ri-bar-chart-2-line" />}
        >
          TAC Workload
        </MenuItem>
        <MenuItem
          href="/todays-schedule"
          icon={<i className="ri-calendar-check-line" />}
        >
          Scheduling
        </MenuItem>
        <MenuItem
          href="/todays-schedule"
          icon={<i className="ri-calendar-schedule-line" />}
        >
          Today's Schedule
        </MenuItem>
        <MenuItem
          href="/escalations"
          icon={<i className="ri-alert-line" />}
        >
          Escalations
        </MenuItem> */}
      </Menu>
    </ScrollWrapper>
  );
};

export default TacMenu;
