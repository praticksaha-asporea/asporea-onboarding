"use client";

import React from "react";
import Box from "@mui/material/Box";

export const StatusBadge = ({ status }: { status: string }) => {
  const isSuccess = ["Completed", "Verified", "Done", "Passed"].includes(status);
  const isInfo = ["Uploaded", "Filled", "Scheduled"].includes(status);

  return (
    <Box
      className={`text-[12px] font-bold capitalize tracking-[0.2px]
        ${isSuccess ? "text-[var(--mui-palette-primary)] " : ""}
        ${isInfo ? "text-[var(--mui-palette-secondary)]" : ""}
        ${!isSuccess && !isInfo ? "text-[var(--mui-palette-text-secondary)]" : ""}
      `}
    >
      {status}
    </Box>
  );
};