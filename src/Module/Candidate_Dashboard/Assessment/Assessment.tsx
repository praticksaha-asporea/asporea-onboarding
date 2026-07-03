"use client";

import React, { Suspense } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";

import { useAssessment } from "@/Module/Candidate_Dashboard/Assessment/useAssessment";
import { ReadinessChecklist } from "@/Components/Assessment/ReadinessChecklist";
import { SessionScheduler } from "@/Components/Assessment/SessionScheduler";
import { TechnicalResult } from "@/Components/Assessment/TechnicalResult";
import { NotificationChannels } from "@/Components/Assessment/NotificationChannels";
import { SuccessDialog } from "@/Components/Assessment/SuccessDialog";

const AssessmentContent = () => {
  const {
    router,
    isBookingMode,
    isAssessmentResult,
    isTechnicalResult,
    techData,
    loadingTech,
    date,
    setDate,
    todayStr,
    selectedSlot,
    setSelectedSlot,
    visitMethod,
    setVisitMethod,
    isSubmitting,
    checklist,
    setChecklist,
    isChecklistComplete,
    slots,
    loadingSlots,
    showConfirmPopup,
    setShowConfirmPopup,
    isEditingChannels,
    setIsEditingChannels,
    channels,
    handleChannelChange,
    statusCardRef,
    handleScheduleAssessment,
    isAlreadyScheduled,
    scheduledDetails,
    checkingStatus,
    handleSavePreferences,
    resultData,
    isAssessmentCompleted
  } = useAssessment();

  if (checkingStatus) {
    return (
      <Box className="w-full flex justify-center p-10 mt-10">
        <CircularProgress />
      </Box>
    );
  }


  const formatToDDMMYY = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";  

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);  
    return `${day}/${month}/${year}`;
  };

  return (
   <Grid container spacing={6}>
      {/* LEFT COLUMN */}
      <Grid size={{ xs: 12, md: (isBookingMode && !isAlreadyScheduled && !isAssessmentCompleted) ? 8 : 12 }}>
        {(isBookingMode || isAssessmentResult) && (
          <Card className="p-4 sm:p-12 rounded-[15px] shadow-2xl mb-6  bg-[var(--mui-palette-primary)]">
            {isBookingMode && isAssessmentCompleted ? (
              <Box className="p-4 text-center bg-[var(--mui-palette-primary)] rounded-xl flex flex-col items-center justify-center min-h-[350px]">
                <Box className="w-20 h-20 bg-[var(--mui-palette-primary)] rounded-full flex items-center justify-center mb-5 mx-auto">
                  <i className="ri-checkbox-circle-fill text-5xl bg-[var(--mui-palette-success-main)]"></i>
                </Box>
                <Typography variant="h4" className="font-bold text-[var(--mui-palette-text-primary)] mb-2">
                  Assessment Session Completed
                </Typography>
                <Typography variant="subtitle1" className="text-[var(--mui-palette-text-secondary)] max-w-md mx-auto mb-4">
                  Your assessment evaluation is done and captured successfully! Our operations team is processing the next steps of your journey.
                </Typography>

                <Button 
                  variant="contained" 
                  href="/applicationtracking"
                  className="mt-6 rounded-xl normal-case shadow-none px-8 py-2.5"
                >
                  Track Recruitment Progress
                </Button>
              </Box>
            ) :
           
            isBookingMode && isAlreadyScheduled ? (
              <Box className="p-4 text-center bg-[var(--mui-palette-primary)] rounded-xl flex flex-col items-center justify-center min-h-[350px]">
                <Box className="w-20 h-20 bg-[var(--mui-palette-primary)] rounded-full flex items-center justify-center mb-5 mx-auto">
                  <i className="ri-calendar-check-fill text-5xl text-blue-600"></i>
                </Box>
                <Typography variant="h4" className="font-bold text-[var(--mui-palette-primary)] mb-2">
                  Assessment Already Scheduled
                </Typography>
                <Typography variant="subtitle1" className="text-[var(--mui-palette-secondary)] max-w-md mx-auto mb-4">
                  Your assessment is locked and scheduled successfully. Please ensure you are ready before the scheduled time.
                </Typography>

                {scheduledDetails?.date && (
                  <Box className="p-3 bg-[var(--mui-palette-primary)]   rounded-xl inline-block shadow-sm px-6">
                    <Typography variant="body2" className="text-[var(--mui-palette-primary)] font-medium">
                      📅 Date: : <strong>{formatToDDMMYY(scheduledDetails.date)}</strong>
                    </Typography>
                  </Box>
                )}

                <Button 
                  variant="contained" 
                  onClick={() => router.push("/application-tracking")} 
                     href="/applicationtracking"
                  className="mt-8 rounded-xl normal-case  shadow-none px-8 py-2.5"
                >
                  Track Application Status
                </Button>
              </Box>
            ) : isBookingMode ? (
               
              <>
                <Typography variant="h4">
                  Confirm Your Assessment Readiness
                </Typography>
                <Typography variant="subtitle1" className="pb-5">
                  Please review the details below and confirm your availability
                  and preparedness for the upcoming session.
                </Typography>

                <ReadinessChecklist
                  checklist={checklist}
                  setChecklist={setChecklist}
                  visitMethod={visitMethod}
                />
                <SessionScheduler
                  visitMethod={visitMethod}
                  setVisitMethod={setVisitMethod}
                  date={date}
                  setDate={setDate}
                  todayStr={todayStr}
                  loadingSlots={loadingSlots}
                  slots={slots}
                  selectedSlot={selectedSlot}
                  setSelectedSlot={setSelectedSlot}
                />

                <Box className="flex justify-end gap-4 mt-8">
                  <Button
                    variant="contained"
                    size="large"
                    disabled={
                      isSubmitting || !selectedSlot || !isChecklistComplete
                    }
                    onClick={handleScheduleAssessment}
                    className="rounded-xl normal-case text-sm shadow-md hover:bg-blue-700 px-8 py-2.5"
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Confirm Readiness & Book"
                    )}
                  </Button>
                </Box>
              </>
            ) : null}

            {/* 🔹 RESULT VIEW */}
            {isAssessmentResult && (
              <Box
                ref={statusCardRef}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 mb-4 gap-6"
              >
                <Box>
                  <Typography
                    variant="h5"
                    className="text-[1.6rem] font-semibold mb-6"
                  >
                    Applicant Assessment Tool
                  </Typography>
                  <Typography variant="body2" className="text-[0.8rem]">
                    Evaluate the candidate based on standard scoring rubrics for
                    technical and soft skills.
                  </Typography>
                </Box>
                <Box className="border-2 border-[#e0f2fe] rounded-[12px] px-6 py-3 flex flex-col items-center bg-white shadow-[0_4px_14px_rgba(0,0,0,0.03)] min-w-[120px]">
                  <Typography className="text-[#9ca3af] text-[10px] font-bold tracking-[1.2px] uppercase mb-1">
                    Total Score
                  </Typography>
                  <Box className="flex items-baseline">
                    <Typography className="text-[34px] font-black text-[#1877F2] leading-none">
                      {resultData?.scores?.achieved}
                    </Typography>
                    <Typography className="text-[16px] font-semibold text-[#6b7280] ml-1">
                      /{resultData?.scores?.total}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Card>
        )}

        {isTechnicalResult && (
          <Box ref={statusCardRef} className="w-full">
            <TechnicalResult techData={techData} loadingTech={loadingTech} />
          </Box>
        )}
      </Grid>

       
      {isBookingMode && !isAlreadyScheduled && !isAssessmentCompleted && (
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="rounded-[15px] mb-12 border border-[#e0e0e0] shadow-none">
            <CardContent className="p-6">
              <Typography variant="h6" fontWeight="bold" className="mb-3">
                Your Application Progress
              </Typography>
              <Typography variant="body2" className="mb-4">
                Assessment: 5 of 6 steps complete
              </Typography>
              <LinearProgress
                variant="determinate"
                value={85}
                className="h-2.5 rounded-[5px] mb-4 bg-[#e0e0e0] [&_.MuiLinearProgress-bar]:bg-[#1976d2]"
              />
              <Typography
                variant="caption"
                className="text-[#1976d2] font-bold"
              >
                You're almost there!
              </Typography>
            </CardContent>
          </Card>
          <NotificationChannels
            isEditingChannels={isEditingChannels}
            setIsEditingChannels={setIsEditingChannels}
            channels={channels}
            handleChannelChange={handleChannelChange}
            handleSavePreferences={handleSavePreferences}  
          />
        </Grid>
      )}

      <SuccessDialog
        showConfirmPopup={showConfirmPopup}
        setShowConfirmPopup={setShowConfirmPopup}
        router={router}
      />
    </Grid>
  )}

const Assessment = () => {
  return (
    <Suspense
      fallback={
        <Box className="p-10 flex justify-center">
          <CircularProgress />
        </Box>
      }
    >
      <AssessmentContent />
    </Suspense>
  );
};

export default Assessment;
