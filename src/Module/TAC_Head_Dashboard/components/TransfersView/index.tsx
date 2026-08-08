"use client";

import React, { Suspense } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import TransfersView from "./TransfersView";

interface EscalationsViewWrapperProps {
  setCurrentView: (view: "dashboard" | "detail") => void;
}

const EscalationsViewIndex: React.FC<EscalationsViewWrapperProps> = ({
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
      <TransfersView />
    </Suspense>
  );
};

export default EscalationsViewIndex;
