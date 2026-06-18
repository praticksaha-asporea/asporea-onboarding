"use client";

import React, { Suspense } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";

import { usePreCounselling } from "@/Module/Candidate_Dashboard/Pre-Counselling/usePreCounselling";
import { ReadinessChecklist } from "@/Components/PreCounselling/ReadinessChecklist";
import { SessionScheduler } from "@/Components/PreCounselling/SessionScheduler";
import { ProgressSidebar } from "@/Components/PreCounselling/ProgressSidebar";
import { NotificationChannels } from "@/Components/PreCounselling/NotificationChannels";
import { SuccessDialog } from "@/Components/PreCounselling/SuccessDialog";

const PreCounsellingContent = () => {
  const {
    leadId,
    consultantId,
    method,
    date,
    setDate,
    todayStr,
    slots,
    selectedSlot,
    setSelectedSlot,
    existingBooking,
    loadingSlots,
    bookingLoading,
    isReduxReady,
    showConfirmPopup,
    setShowConfirmPopup,
    checklist,
    setChecklist,
    isEditingChannels,
    setIsEditingChannels,
    preferences,
    handlePrefChange,
    handleSavePreferences,
    handleConfirm,
    isChecklistComplete,
    reduxUser,
    isValidLead,
    isCompleted
  } = usePreCounselling();

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
      <Grid size={{ xs: 12, md: 8 }}>
        
       
        {!isValidLead ? (
          <Card className="p-10 rounded-[15px] shadow-[0px_4px_18px_rgba(0,0,0,0.04)] text-center bg-var(--mui-overlays-1) flex flex-col items-center justify-center min-h-[400px]">
            <i className="ri-error-warning-fill text-6xl text-red-400 mb-4"></i>
            <Typography variant="h5" className="font-semibold text-[var(--mui-palette-text-primary)] mb-2">
              Application Not Found
            </Typography>
            <Typography variant="body2" className="text-[var(--mui-palette-text-secondary)] max-w-md">
              The application or lead you are trying to access has been deleted or does not exist.
            </Typography>
          </Card>
        ) : 

        
        isCompleted ? (
          <Card className="p-10 rounded-[15px] shadow-2xl text-center   bg-[var(--mui-palette-primary)] flex flex-col items-center justify-center min-h-[400px]">
            <Box className="w-20 h-20 bg-[var(--mui-palette-success-primary)] rounded-full flex items-center justify-center mb-6 mx-auto">
              <i className="ri-checkbox-circle-fill text-5xl text-[var(--mui-palette-success-main)]"></i>
            </Box>
            <Typography variant="h4" className="font-bold text-[var(--mui-palette-primary)] mb-2">
              Pre-Counselling Completed
            </Typography>
            <Typography variant="subtitle1" className="text-[var(--mui-palette-secondary)] max-w-md mx-auto">
              Your pre-counselling session has been successfully completed. You can now proceed to upload your documents.
            </Typography>
            <Button 
              variant="contained" 
              href="/document-upload" 
              className="mt-6 rounded-xl normal-case   shadow-none px-8 py-2.5"
            >
              Proceed to Documents
            </Button>
          </Card>
        ) : 

         
        !isReduxReady ? (
          <Card className="p-10 rounded-[15px] shadow-[0px_4px_18px_rgba(0,0,0,0.04)] text-center bg-var(--mui-overlays-1) flex flex-col items-center justify-center min-h-[400px]">
            <CircularProgress size={40} />
            <Typography className="mt-4 text-[var(--mui-palette-text-secondary)] font-medium">
              Fetching your details...
            </Typography>
          </Card>
        ) : !consultantId && !existingBooking ? (
          <Card className="p-10 rounded-[15px] text-center bg-var(--mui-overlays-1) shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center min-h-[400px]">
            <Box className="w-20 h-20 bg-var(--mui-overlays-1) rounded-full flex items-center justify-center mb-6">
              <i className="ri-user-unfollow-line text-4xl text-[var(--mui-palette-primary-main)]"></i>
            </Box>
            <Typography
              variant="h4"
              className="font-bold text-[var(--mui-palette-text-primary)] mb-2"
            >
              Sorry!
            </Typography>
            <Typography
              variant="subtitle1"
              className="text-[var(--mui-palette-text-primary)] max-w-md"
            >
              TAC (Talent Acquisition Consultant) not assigned yet. 
              <br />Please reach to the reception counter of <strong>{reduxUser?.branch?.title}</strong> branch.
              <br />Receptionist will assign a TAC for you.
            </Typography>
          </Card>
        ) : (
          <Card className="p-2 sm:p-6 rounded-[15px] shadow-[0px_4px_18px_rgba(0,0,0,0.04)]">
            <Typography variant="h4">
              Confirm Your Pre-Counselling Readiness
            </Typography>
            <Typography variant="subtitle1" className="pb-5">
              Please review the details below and confirm your availability and
              preparedness for the upcoming session via phone call.
            </Typography>

            {existingBooking && (
              <Box className="mb-8 p-4 rounded-xl border border-[#e0e0e0] bg-[var(--variant-outlinedBg)] flex items-center gap-4">
                <Box className="w-12 h-12 rounded-full bg-[var(--variant-outlinedBg)] flex items-center justify-center shrink-0">
                  <i className="ri-calendar-check-fill text-2xl text-[var(--mui-palette-text-primary)]"></i>
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    className="text-[var(--mui-palette-text-primary)] font-bold"
                  >
                    Session Already Scheduled
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-[var(--mui-palette-text-primary)]"
                  >
                    Your session is booked for{" "}
                  <strong>
                      
                      {formatToDDMMYY(existingBooking.schedule?.date || "")}
                    </strong>{" "}
                    at{" "}
                    <strong>
                      {existingBooking.schedule?.from} -{" "}
                      {existingBooking.schedule?.to}
                    </strong>{" "}
                    via{" "}
                    {existingBooking.schedule?.method === "on"
                      ? "Online Call"
                      : "Branch Visit"}
                    .
                  </Typography>
                </Box>
              </Box>
            )}

            <ReadinessChecklist
              checklist={checklist}
              setChecklist={setChecklist}
              method={method}
              existingBooking={existingBooking}
            />
            <SessionScheduler
              date={date}
              setDate={setDate}
              todayStr={todayStr}
              slots={slots}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              loadingSlots={loadingSlots}
              existingBooking={existingBooking}
            />

            <Box className="flex justify-end gap-4 mt-10">
              {existingBooking ? (
                <Button
                  variant="contained"
                  size="large"
                  href="/document-upload"
                  className="rounded-xl normal-case text-sm shadow-md bg-[var(--mui-palette-primary-main)] text-white px-8"
                >
                  Go to Documents
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  disabled={
                    !selectedSlot || bookingLoading || !isChecklistComplete
                  }
                  onClick={handleConfirm}
                  className="rounded-xl normal-case text-sm shadow-md px-8"
                >
                  {bookingLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Confirm Readiness"
                  )}
                </Button>
              )}
            </Box>
          </Card>
        )}
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <ProgressSidebar />
        <NotificationChannels
          isEditingChannels={isEditingChannels}
          setIsEditingChannels={setIsEditingChannels}
          preferences={preferences}
          handlePrefChange={handlePrefChange}
          handleSavePreferences={handleSavePreferences}
        />
      </Grid>

      <SuccessDialog
        showConfirmPopup={showConfirmPopup}
        setShowConfirmPopup={setShowConfirmPopup}
        leadId={leadId}
      />
    </Grid>
  );
};

const PreCounselling = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <PreCounsellingContent />
    </Suspense>
  );
};

export default PreCounselling;
