"use client";
import React, { useState } from "react";
import { Box } from "@mui/material";
import DashboardView from "./components/DashboardView/index";

const TACHeadDashboard = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "detail">("dashboard");

  return (
    <Box>
      {currentView === "dashboard" && (
        <DashboardView setCurrentView={setCurrentView} />
      )}
    
    </Box>
  );
};

export default TACHeadDashboard;