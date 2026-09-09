"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { updateUserData } from "@/Redux/Auth/user.slice";

let socket: Socket | null = null;

export const useSocketProfile = () => {
  const dispatch = useDispatch();
  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData
  );

  const userId = reduxUser?._id || reduxUser?.id;

  useEffect(() => {
    if (!userId) return;

    const initSocket = async () => {
       
      await fetch("/api/socket");

      if (!socket) {
        socket = io({
          path: "/api/socket",
        });
      }

      socket.on("connect", () => {
        socket?.emit("JOIN_USER_ROOM", userId);
      });

      
      socket.on("USER_PROFILE_UPDATED", (updatedUser) => {
        console.log("⚡ Real-time Profile Sync Received:", updatedUser);
        dispatch(updateUserData(updatedUser));
      });
    };

    initSocket();

    return () => {
      if (socket) {
        socket.off("USER_PROFILE_UPDATED");
      }
    };
  }, [userId, dispatch]);
};