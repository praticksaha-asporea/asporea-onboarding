"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";

export const ProgressSidebar = () => {
  return (
    <Card className="rounded-[15px] mb-12 shadow-none">
      <CardContent className="p-6">
        <Typography variant="h6" fontWeight="bold" className="mb-3">
          Your Application Progress
        </Typography>
        <Typography variant="body2" className="mb-4">
          Pre-counselling: 2 of 6 steps complete
        </Typography>
        <LinearProgress
          variant="determinate" value={33}
          className="h-2.5 rounded-[5px] mb-4 bg-[#e0e0e0] [&_.MuiLinearProgress-bar]:bg-[#1976d2]"
        />
        <Typography variant="caption" className="text-[#1976d2] font-bold">
          You're almost there! Just few steps left.
        </Typography>
      </CardContent>
    </Card>
  );
};