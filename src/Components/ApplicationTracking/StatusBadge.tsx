"use client";

import React from "react";
import Box from "@mui/material/Box";

export const StatusBadge = ({ status }: { status: string }) => {
  const normalized = status?.trim();

  const isSuccess = ["Completed", "Verified", "Done", "Passed"].includes(
    normalized,
  );

  const isInfo = ["Uploaded", "Filled", "Scheduled"].includes(normalized);

  const isWarning = [
    "Waiting For Approval",
    "Waiting for Technical Round",
  ].includes(normalized);

  const isError = ["Rejected", "Failed"].includes(normalized);

  return (
    <Box
      className={`text-[12px] font-bold capitalize tracking-[0.2px] whitespace-nowrap
        ${isSuccess ? "text-green-600" : ""}
        ${isInfo ? "text-[var(--mui-palette-secondary)]" : ""}
        ${isWarning ? "text-orange-500" : ""}
        ${isError ? "text-red-500" : ""}
        ${!isSuccess && !isInfo && !isWarning && !isError ? "text-[var(--mui-palette-text-secondary)]" : ""}
      `}
    >
      {status}
    </Box>
  );
};
