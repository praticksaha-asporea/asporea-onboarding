"use client";

import React, { Suspense, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { CircularProgress, Chip } from "@mui/material";

import { usePreCounselling } from "@/Module/Candidate_Dashboard/Pre-Counselling/usePreCounselling";
import { ReadinessChecklist } from "@/Components/PreCounselling/ReadinessChecklist";
import { SessionScheduler } from "@/Components/PreCounselling/SessionScheduler";
import { ProgressSidebar } from "@/Components/PreCounselling/ProgressSidebar";
import { NotificationChannels } from "@/Components/PreCounselling/NotificationChannels";
import { SuccessDialog } from "@/Components/PreCounselling/SuccessDialog";
import { ModeBranchSelector } from "@/Components/PreCounselling/ModeBranchSelector";
import { TACSelector } from "@/Components/PreCounselling/TACSelector";
import { CvUploader } from "@/Components/PreCounselling/CvUploader";
import { CaptchaField } from "@/Components/PreCounselling/CaptchaField";
import { SectionHeader } from "@/Components/PreCounselling/SectionHeader";
import { StepTabs, StepTabConfig } from "@/Components/PreCounselling/StepTabs";

const STEPS: StepTabConfig[] = [
  { id: "mode", label: "Center & Mode", icon: "ri-route-line", accent: "secondary" },
  { id: "tac", label: "TAC", icon: "ri-user-star-line", accent: "primary" },
  { id: "schedule", label: "Schedule", icon: "ri-calendar-schedule-line", accent: "secondary" },
  { id: "cv", label: "CV", icon: "ri-file-upload-line", accent: "warning" },
  { id: "readiness", label: "Readiness", icon: "ri-list-check-3", accent: "primary" },
  { id: "verify", label: "Verify", icon: "ri-shield-check-line", accent: "success" },
];

const PreCounsellingContent = () => {
  const {
    leadId,
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
    isValidLead,
    isCompleted,
    activeStepperStep,

    mode,
    setMode,
    branch,

    tacs,
    loadingTacs,
    selectedTacId,
    handleTacSelect,

    cvFile,
    cvUploading,
    cvError,
    handleCvChange,

    captchaVerified,
    setCaptchaVerified,

    canConfirm,
  } = usePreCounselling();

  // Captcha input is local UI state — react-simple-captcha validates against
  // its own canvas, the hook only cares about the resulting boolean.
  const [captchaValue, setCaptchaValue] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const formatToDDMMYY = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // ---- Dependency chain: mode/branch -> tac -> (date +) slot ----
  const hasBranch = !!branch?._id;
  const hasTac = !!selectedTacId;

  const completed = useMemo(
    () => [
      isChecklistComplete,
      true, // mode + branch always resolved (mode defaults, branch is assigned)
      hasTac,
      !!selectedSlot,
      !!cvFile && !cvUploading,
      captchaVerified,
    ],
    [isChecklistComplete, hasTac, selectedSlot, cvFile, cvUploading, captchaVerified],
  );

  const tabDisabled = useMemo(
    () => [
      false,
      false,
      !hasBranch, // TAC list depends on branch (+ mode)
      !hasTac, // slots depend on the selected TAC (+ date)
      false,
      false,
    ],
    [hasBranch, hasTac],
  );

  const tabDisabledReason = [
    undefined,
    undefined,
    "Waiting on your assigned branch",
    "Select a TAC first — available slots depend on who you pick",
    undefined,
    undefined,
  ];

  const goNext = () => setActiveTab((t) => Math.min(t + 1, STEPS.length - 1));
  const goBack = () => setActiveTab((t) => Math.max(t - 1, 0));

  const isLastTab = activeTab === STEPS.length - 1;

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 8 }}>
        {!isValidLead ? (
          <Card className="p-12 rounded-3xl border border-[var(--mui-palette-divider)] shadow-[0px_8px_24px_-12px_rgba(15,23,42,0.12)] text-center flex flex-col items-center justify-center min-h-[420px]">
            <Box
              className="flex items-center justify-center rounded-full mb-5"
              style={{ width: 72, height: 72, background: "color-mix(in srgb, #ef4444 12%, transparent)" }}
            >
              <i className="ri-error-warning-fill text-4xl text-red-500" />
            </Box>
            <Typography variant="h5" className="font-bold mb-2">
              Application Not Found
            </Typography>
            <Typography variant="body2" className="text-[var(--mui-palette-text-secondary)] max-w-md">
              The application or lead you are trying to access has been deleted or does not exist.
            </Typography>
          </Card>
        ) : isCompleted ? (
          <Card className="p-12 rounded-3xl text-center flex flex-col items-center justify-center min-h-[420px] border border-[var(--mui-palette-divider)] shadow-[0px_12px_32px_-16px_rgba(15,23,42,0.18)] relative overflow-hidden">
            <Box
              className="absolute inset-0 opacity-[0.06]"
              style={{ background: "radial-gradient(circle at 30% 20%, var(--mui-palette-success-main), transparent 60%)" }}
            />
            <Box
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6 relative"
              style={{ background: "color-mix(in srgb, var(--mui-palette-success-main) 14%, transparent)" }}
            >
              <i className="ri-checkbox-circle-fill text-5xl text-[var(--mui-palette-success-main)]" />
            </Box>
            <Typography variant="h4" className="font-bold mb-2 relative">
              Pre-Counselling Completed
            </Typography>
            <Typography variant="subtitle1" className="text-[var(--mui-palette-text-secondary)] max-w-md mx-auto relative">
              Your pre-counselling session has been successfully completed. You can now proceed to upload your documents.
            </Typography>
            <Button
              variant="contained"
              href="/document-upload"
              className="mt-6 rounded-xl normal-case shadow-none px-8 py-2.5 font-semibold relative"
            >
              Proceed to Documents
              <i className="ri-arrow-right-line ml-1.5" />
            </Button>
          </Card>
        ) : !isReduxReady ? (
          <Card className="p-12 rounded-3xl border border-[var(--mui-palette-divider)] shadow-[0px_8px_24px_-12px_rgba(15,23,42,0.12)] text-center flex flex-col items-center justify-center min-h-[420px]">
            <CircularProgress size={36} thickness={4} />
            <Typography className="mt-4 text-[var(--mui-palette-text-secondary)] font-medium">
              Fetching your details...
            </Typography>
          </Card>
        ) : (
          <>
            <Card className="p-5 sm:p-7 rounded-3xl border border-[var(--mui-palette-divider)] shadow-[0px_8px_24px_-12px_rgba(15,23,42,0.12)] mb-6">
              <Box className="flex items-start justify-between gap-3">
                <Box>
                  <Typography variant="h4" className="font-bold leading-tight">
                    Confirm Your Pre-Counselling Readiness
                  </Typography>
                  <Typography variant="body2" className="text-[var(--mui-palette-text-secondary)] mt-1.5 max-w-xl">
                    Review the details below and confirm your availability for the upcoming session.
                  </Typography>
                </Box>
                <Chip
                  label={mode === "on" ? "🌐 Online" : "🏢 In-Person"}
                  className="font-bold text-white text-[13px] shrink-0"
                  sx={{ bgcolor: mode === "on" ? "var(--mui-palette-primary-main)" : "var(--mui-palette-secondary-main)" }}
                />
              </Box>

              {existingBooking && (
                <Box className="mt-6 p-5 rounded-2xl bg-[color-mix(in_srgb,var(--mui-palette-primary-main)_5%,transparent)] border border-[color-mix(in_srgb,var(--mui-palette-primary-main)_20%,transparent)] flex items-center gap-4">
                  <Box
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: "color-mix(in srgb, var(--mui-palette-primary-main) 14%, transparent)" }}
                  >
                    <i className="ri-calendar-check-fill text-2xl text-[var(--mui-palette-primary-main)]" />
                  </Box>
                  <Box>
                    <Box className="flex items-center gap-2 mb-1 flex-wrap">
                      <Typography variant="h6" className="font-bold">
                        Session Already Scheduled
                      </Typography>
                      <Chip
                        label={existingBooking.schedule?.method === "on" ? "Online" : "In-Person"}
                        color={existingBooking.schedule?.method === "on" ? "primary" : "secondary"}
                        size="small"
                        className="font-medium text-xs"
                      />
                    </Box>
                    <Typography variant="body2" className="text-[var(--mui-palette-text-secondary)]">
                      Booked for <strong className="text-[var(--mui-palette-text-primary)]">{formatToDDMMYY(existingBooking.schedule?.date || "")}</strong>{" "}
                      at <strong className="text-[var(--mui-palette-text-primary)]">{existingBooking.schedule?.from} - {existingBooking.schedule?.to}</strong>{" "}
                      via {existingBooking.schedule?.method === "on" ? "Online Call" : "Branch Visit"}.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Card>

            {!existingBooking && (
              <>
                <StepTabs
                  steps={STEPS}
                  activeIndex={activeTab}
                  completed={completed}
                  disabled={tabDisabled}
                  disabledReason={tabDisabledReason}
                  onSelect={setActiveTab}
                />

                {activeTab === 0 && (
                  <Card className="p-5 sm:p-7 rounded-3xl border border-[var(--mui-palette-divider)] shadow-[0px_8px_24px_-12px_rgba(15,23,42,0.12)] mb-6">
                    <SectionHeader icon="ri-list-check-3" eyebrow="Step 1" title="Readiness Checklist" accentColor="primary" />
                    <ReadinessChecklist
                      checklist={checklist}
                      setChecklist={setChecklist}
                      method={mode}
                      existingBooking={existingBooking}
                    />
                  </Card>
                )}

                {activeTab === 1 && <ModeBranchSelector mode={mode} onModeChange={setMode} branch={branch} />}

                {activeTab === 2 && (
                  <TACSelector tacs={tacs} selectedTacId={selectedTacId} onSelect={handleTacSelect} loading={loadingTacs} />
                )}

                {activeTab === 3 && (
                  <Card className="p-5 sm:p-7 rounded-3xl border border-[var(--mui-palette-divider)] shadow-[0px_8px_24px_-12px_rgba(15,23,42,0.12)] mb-6">
                    <SectionHeader icon="ri-calendar-schedule-line" eyebrow="Step 4" title="Your Scheduled Session" accentColor="secondary" />
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
                  </Card>
                )}

                {activeTab === 4 && (
                  <CvUploader file={cvFile} onFileChange={handleCvChange} uploading={cvUploading} error={cvError} />
                )}

                {activeTab === 5 && (
                  <CaptchaField
                    value={captchaValue}
                    onChange={setCaptchaValue}
                    onVerifiedChange={setCaptchaVerified}
                    error={captchaValue.length > 0 && !captchaVerified}
                    helperText={
                      captchaValue.length > 0 && !captchaVerified
                        ? "Click Verify once you've typed the code"
                        : captchaVerified
                          ? "Verified"
                          : " "
                    }
                  />
                )}

                <Box className="flex items-center justify-between gap-4 mt-2 py-4 sticky bottom-0 backdrop-blur-sm" style={{ background: "color-mix(in srgb, var(--mui-palette-background-default, white) 85%, transparent)" }}>
                  <Button
                    variant="outlined"
                    size="large"
                    disabled={activeTab === 0}
                    onClick={goBack}
                    className="rounded-xl normal-case text-sm px-6 font-semibold"
                  >
                    <i className="ri-arrow-left-line mr-1.5" />
                    Back
                  </Button>

                  {isLastTab ? (
                    <Button
                      variant="contained"
                      size="large"
                      disabled={!canConfirm}
                      onClick={handleConfirm}
                      className="rounded-xl normal-case text-sm px-8 font-semibold"
                      sx={{ boxShadow: canConfirm ? "0px 8px 20px -6px var(--mui-palette-primary-main)" : "none" }}
                    >
                      {bookingLoading ? (
                        <CircularProgress size={22} color="inherit" />
                      ) : (
                        <>
                          Confirm Readiness
                          <i className="ri-check-line ml-1.5" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      disabled={!completed[activeTab] && activeTab !== 1}
                      onClick={goNext}
                      className="rounded-xl normal-case text-sm px-8 font-semibold"
                    >
                      Next
                      <i className="ri-arrow-right-line ml-1.5" />
                    </Button>
                  )}
                </Box>
              </>
            )}

            {existingBooking && (
              <Box className="flex justify-end gap-4 mt-2">
                <Button
                  variant="contained"
                  size="large"
                  href="/document-upload"
                  className="rounded-xl normal-case text-sm shadow-md px-8 font-semibold"
                >
                  Go to Documents
                  <i className="ri-arrow-right-line ml-1.5" />
                </Button>
              </Box>
            )}
          </>
        )}
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <ProgressSidebar activeStep={activeStepperStep} />
        <NotificationChannels
          isEditingChannels={isEditingChannels}
          setIsEditingChannels={setIsEditingChannels}
          preferences={preferences}
          handlePrefChange={handlePrefChange}
          handleSavePreferences={handleSavePreferences}
        />
      </Grid>

      <SuccessDialog showConfirmPopup={showConfirmPopup} setShowConfirmPopup={setShowConfirmPopup} leadId={leadId} />
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