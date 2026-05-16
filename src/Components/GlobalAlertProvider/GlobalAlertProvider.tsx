"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";

export default function GlobalAlertProvider() {
  useEffect(() => {
    window.alert = (message: string) => {
      toast.error(message, {
        duration: 3000,
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    };
  }, []);

  return null;
}
