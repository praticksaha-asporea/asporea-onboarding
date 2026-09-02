import React from "react";
import { Box, Chip } from "@mui/material";

interface FollowUpBadgeProps {
  show?: boolean;
}

export const FollowUpBadge: React.FC<FollowUpBadgeProps> = ({ show }) => {
  if (!show) return null;

  return (
    <Box className="absolute animate-blink top-3 right-3 z-10">
      <Chip
        label="Follow Up"
        size="small"
        sx={{ backgroundColor: "transparent !important" }}
        icon={<i className="ri-alarm-warning-fill text-xs text-red-500" />}
        className="text-[13px] h-[22px] font-medium text-[var(--mui-palette-error-main)]"
      />
    </Box>
  );
};

export default FollowUpBadge;
