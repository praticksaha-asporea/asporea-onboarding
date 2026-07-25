"use client";

// React Imports
import { useRef, useState } from "react";
import type { MouseEvent } from "react";

// Next Imports
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
// MUI Imports
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Popper from "@mui/material/Popper";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { useSelector } from "react-redux";
import { CamelCase } from "@/Utils/common";
import ChangePasswordModal from "@/Components/modals/ChangePasswordModal";

// Styled component for badge content
const BadgeContentSpan = styled("span")({
  width: 8,
  height: 8,
  borderRadius: "50%",
  cursor: "pointer",
  backgroundColor: "var(--mui-palette-success-main)",
  boxShadow: "0 0 0 2px var(--mui-palette-background-paper)",
});

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );

  const avatarSrc = reduxUser?.profilePic?.path || "/images/avatars/avatar";
  // Refs
  const anchorRef = useRef<HTMLDivElement>(null);

  // Hooks
  const router = useRouter();

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false);
  };

  const handleDropdownClose = (
    event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent),
    url?: string,
  ) => {
    if (url) {
      router.push(url);
    }

    if (
      anchorRef.current &&
      anchorRef.current.contains(event?.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

 
const handleUserLogout = async () => {
    try {
    
      const currentUserRole = reduxUser?.role || "";
       
      const remIdentity = localStorage.getItem("asporea_rem_identity");
      const remPass = localStorage.getItem("asporea_rem_pass");

      
      localStorage.clear();

   
      if (remIdentity) localStorage.setItem("asporea_rem_identity", remIdentity);
      if (remPass) localStorage.setItem("asporea_rem_pass", remPass);

      
      const allCookies = Cookies.get();
      Object.keys(allCookies).forEach((cookieName) => {
        if (cookieName !== 'remEmail' && cookieName !== 'remPass') {
          Cookies.remove(cookieName);
          Cookies.remove(cookieName, { path: '/' });
        }
      });

      await signOut({ redirect: false });

      
      if (["tac", "foe", "tac_head"].includes(currentUserRole)) {
        window.location.href = '/tac-login';
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout Error:', error);
      window.location.href = '/login';
    }
  };

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap="circular"
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        className="mis-2"
      >
        <Avatar
          ref={anchorRef}
          alt={`${reduxUser?.firstName ?? ""} ${reduxUser?.lastName ?? ""}`}
          src={avatarSrc}
          onClick={handleDropdownOpen}
          className="cursor-pointer bs-[38px] is-[38px] border-[3px] border-divider"
          
        />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement="bottom-end"
        anchorEl={anchorRef.current}
        className="min-is-[240px] !mbs-4 z-[1]"
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom-end" ? "right top" : "left top",
            }}
          >
            <Paper className="shadow-lg">
              <ClickAwayListener
                onClickAway={(e) =>
                  handleDropdownClose(e as MouseEvent | TouchEvent)
                }
              >
                <MenuList>
                  <div
                    className="flex items-center plb-2 pli-4 gap-2"
                    tabIndex={-1}
                  >
                    <Avatar
                      alt={`${reduxUser?.firstName ?? ""} ${reduxUser?.lastName ?? ""}`}
                      src={avatarSrc}
                      className="border border-divider shadow-xs"
                      sx={{
                        boxShadow:
                          "0px 4px 12px rgba(0, 0, 0, 0.08), 0px 1px 3px rgba(0, 0, 0, 0.04)",
                      }}
                    />
                    <div className="flex items-start flex-col">
                      <Typography className="font-medium" color="text.primary">
                        {`${reduxUser?.firstName ?? ""} ${reduxUser?.lastName ?? ""}`}
                      </Typography>
                      <Typography variant="caption">
                        {CamelCase(reduxUser?.role)}
                      </Typography>
                    </div>
                  </div>
                  <Divider className="mlb-1" />
                  <MenuItem
                    className="gap-3"
                    onClick={(e) => {
                      console.log(reduxUser?.role, 414);
                      if (reduxUser?.role == "user") {
                        handleDropdownClose(e, "/profile");
                      } else if (["tac", "foe"].includes(reduxUser?.role)) {
                        handleDropdownClose(e, "/my-profile");
                      } else if (["tac_head"].includes(reduxUser?.role)) {
                        handleDropdownClose(e, "/my-profile");
                      }
                    }}
                  >
                    <i className="ri-user-3-line" />
                    <Typography color="text.primary">My Profile</Typography>
                  </MenuItem>
                  {!reduxUser?.isSocialLogin && (
                    <MenuItem
                      className="gap-3"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen(false);
                        setPasswordModalOpen(true);
                      }}
                    >
                      <i className="ri-lock-password-line" />
                      <Typography color="text.primary">
                        Change Password
                      </Typography>
                    </MenuItem>
                  )}
                  {/* <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/profile')}>
                    <i className='ri-settings-4-line' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem> */}
                  <div className="flex items-center plb-2 pli-4">
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      size="small"
                      endIcon={<i className="ri-logout-box-r-line" />}
                      onClick={handleUserLogout}
                      sx={{
                        "& .MuiButton-endIcon": { marginInlineStart: 1.5 },
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
};

export default UserDropdown;
