"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";

interface ProgressSidebarProps {
  activeStep: number;
}

export const ProgressSidebar = ({ activeStep }: ProgressSidebarProps) => {
   const steps = [
    "Inquiry",
    "Pre-Counselling",
    "Documents",
    "Experience Selection",
    "Assessment Status",
    "Technical Round",
  ];

  const totalSteps = steps.length;
 
  const safeActiveStep = Math.min(Math.max(activeStep, 0), totalSteps - 1);
  
  const currentStepName = steps[safeActiveStep];
  const progressValue = Math.round(((safeActiveStep + 1) / totalSteps) * 100);

  return (
    <Card className="rounded-[15px] mb-12 shadow-2xl  ">
      <CardContent className="p-6">
        <Typography variant="h6" fontWeight="bold" className="mb-3">
          Your Application Progress
        </Typography>
        <Typography variant="body2" className="mb-4">
          {currentStepName}: {safeActiveStep + 1} of {totalSteps} steps complete
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progressValue}
          className="h-2.5 rounded-[5px] mb-4 bg-[#e0e0e0] [&_.MuiLinearProgress-bar]:bg-[#1976d2]"
        />
        <Typography variant="caption" className="text-[#1976d2] font-bold">
          {progressValue === 100 
            ? "Application journey completed successfully!" 
            : "You're almost there! Just a few steps left."}
        </Typography>
      </CardContent>
    </Card>
  );
};