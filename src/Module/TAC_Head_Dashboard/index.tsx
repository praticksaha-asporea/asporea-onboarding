"use client";
import React, { useState } from "react";
import { Box } from "@mui/material";
import DashboardView from "./components/DashboardView/DashboardView";

const TACHeadDashboard = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "detail">("dashboard");

  return (
    <Box>
      {currentView === "dashboard" && (
        <DashboardView setCurrentView={setCurrentView} />
      )}
      {/* Aage chal kar hum yahan detail view bhi add kar sakte hain */}
    </Box>
  );
};

export default TACHeadDashboard;