"use client";
import React, { useState } from "react";
import { Box } from "@mui/material";
import DashboardView from "./components/DashboardView";
import CandidateDetail from "./components/CandidateDetail";
import AssessmentForm from "./components/AssessmentForm";

const TACDashboard = () => {
  const [currentView, setCurrentView] = useState<
    "dashboard" | "detail" | "assessment"
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

      {currentView === "detail" && selectedCandidate && (
        <CandidateDetail
          selectedCandidate={selectedCandidate}
          setSelectedCandidate={setSelectedCandidate}
          setCurrentView={setCurrentView}
        />
      )}

      {currentView === "assessment" && selectedCandidate && (
        <AssessmentForm
          selectedCandidate={selectedCandidate}
          setCurrentView={setCurrentView}
        />
      )}
    </Box>
  );
};

export default TACDashboard;
