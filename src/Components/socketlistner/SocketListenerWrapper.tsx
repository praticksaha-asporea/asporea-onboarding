"use client";

import { useSocketProfile } from "@/sockethook/useSocketProfile";
export default function SocketListenerWrapper() {
  useSocketProfile(); 
  return null;  
}