"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { setUserData, UserData } from "@/Redux/Auth/user.slice";
import { CircularProgress, Box, Typography } from "@mui/material";
import toast from "react-hot-toast";

export default function SocialCallbackPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session) {
      router.replace("/login");
      return;
    }

    const isNewUser = session.isNewUser;
    const userData = session.userData as any;

    if (isNewUser) {
      // ── New user: store temp data and go to complete-profile ─────────
      if (userData?.email) {
        localStorage.setItem("temp_register_email", userData.email);
      }
      // Generate a random placeholder password for the complete-profile flow
      const randomPassword =
        Math.random().toString(36).slice(2, 10) +
        Math.random().toString(36).slice(2, 10).toUpperCase() +
        "!1";
      localStorage.setItem("temp_register_password", randomPassword);

      // Store social profile data for pre-filling the form
      if (userData) {
        localStorage.setItem("temp_social_profile", JSON.stringify(userData));
      }

      router.replace("/complete-profile");
    } else {
      // ── Existing user: set cookies + Redux + redirect ─────────────────
      // console.log(session?.appUserRole,5844);

      if (session?.appUserRole != "user") {
        toast.error(`Sorry ! This feature only available for Candidates`);
        router.replace("/login");
        return;
      }
      if (session.appAccessToken) {
        Cookies.set("accessToken", session.appAccessToken, { sameSite: "lax" });
      }
      if (session.appRefreshToken) {
        Cookies.set("refreshToken", session.appRefreshToken, { sameSite: "lax" });
      }

      if (userData) {
        dispatch(
          setUserData({
            userData: {
              id: session.appUserId,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: session.appUserRole,
              ...userData,
            } as UserData,
          }),
        );
      }

      // const role = session.appUserRole;
      // router.replace(role === "tac" ? "/dashboard" : "/inquiry");
    }
  }, [status, session]);

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen gap-4">
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Signing you in...
      </Typography>
    </Box>
  );
}
