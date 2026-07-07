"use client";
import React, { useState } from "react";
import { Box } from "@mui/material";
import DashboardView from "./src/Module/TAC_Dashboard/components/DashboardView/DashboardView";

const TACDashboard = () => {
  const [currentView, setCurrentView] = useState<
    "dashboard" | "detail"
  >("dashboard");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  return (
    <Box>
      {currentView === "dashboard" && (
        <DashboardView
          setCurrentView={setCurrentView}
          setSelectedCandidate={setSelectedCandidate}
        />
      )}
    </Box>
  );
};

export default TACDashboard;
