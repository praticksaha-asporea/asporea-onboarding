"use client";

import React, { Suspense } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import DashboardView from "./DashboardView";

interface DashboardViewWrapperProps {
  setCurrentView: (view: "dashboard" | "detail") => void;
}

const DashboardViewIndex: React.FC<DashboardViewWrapperProps> = ({
  setCurrentView,
}) => {
  return (
    <Suspense
      fallback={
        <Box className="p-10 flex justify-center w-full">
          <CircularProgress size={32} />
        </Box>
      }
    >
      <DashboardView setCurrentView={setCurrentView} />
    </Suspense>
  );
};

export default DashboardViewIndex;
