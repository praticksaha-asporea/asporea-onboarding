 "use client";

import React, { Suspense } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import { usePreCounselling } from "@/Module/Candidate_Dashboard/Pre-Counselling/usePreCounselling";
import { ProgressSidebar } from "@/Components/PreCounselling/ProgressSidebar";
import { NotificationChannels } from "@/Components/PreCounselling/NotificationChannels";
import { SuccessDialog } from "@/Components/PreCounselling/SuccessDialog";
import TacProfileDialog from "@/Components/modals/TacProfileDialog";
import { HeaderCard } from "@/Components/PreCounselling/HeaderCard";
import { ExistingBookingCard } from "@/Components/PreCounselling/ExistingBookingCard";
import { Step1BranchSelection } from "@/Components/PreCounselling/Step1BranchSelection";
import { Step2SessionMode } from "@/Components/PreCounselling/Step2SessionMode";
import { Step3CvUpload } from "@/Components/PreCounselling/Step3CvUpload";
import { Step4TacSelection } from "@/Components/PreCounselling/Step4TacSelection";
import { Step5SlotSelection } from "@/Components/PreCounselling/Step5SlotSelection";
import { Step6CaptchaVerification } from "@/Components/PreCounselling/Step6CaptchaVerification";
import { ResumePreviewDialog } from "@/Components/PreCounselling/ResumePreviewDialog";

const PreCounsellingContent = () => {
  const {
    isValidLead,
    isCompleted,
    existingBooking,

    locationDenied,
    branches,
    loadingBranches,
    selectedBranchId,

    mode,
    setMode,
    showScheduling,
    handleReschedule,
    canReschedule,

    handleDragOver,
    handleDragLeave,
    handleDrop,
    onFileInputChange,
    isDragging,
    fileInputRef,
    previewUrl,
    isPreviewOpen,
    setIsPreviewOpen,
    isPdf,

    tacs,
    loadingTacs,
    selectedTacId,
    setSelectedTacId,

    date,
    setDate,
    slots,
    loadingSlots,
    selectedSlot,
    setSelectedSlot,

    captchaValue,
    captchaVerified,
    handleCaptchaChange,
    handleCaptchaVerify,
    handleCaptchaRefresh,

    bookingLoading,
    showConfirmPopup,
    setShowConfirmPopup,
    canConfirm,
    handleConfirm,
    profileTac,
    setProfileTac,
    handleBranchSelect,
    cancellationRequest,
    showCancel,
    handleCancelReason,
    cancelReason,
    setCancelReason,
    leadData,
    reduxUser,
    todayStr,
  } = usePreCounselling();

  const displayInqNo =
    leadData?.inqNo ||
    (typeof existingBooking?.leadId === "object"
      ? (existingBooking?.leadId as any)?.inqNo
      : null) ||
    reduxUser?.inqNo ||
    reduxUser?.leadId?.inqNo ||
    reduxUser?.user?.leadId?.inqNo ||
    "N/A";

  if (!isValidLead) {
    return (
      <Card className="p-12 rounded-3xl border border-[var(--mui-palette-divider)] shadow-[0px_8px_24px_-12px_rgba(15,23,42,0.12)] text-center flex flex-col items-center justify-center min-h-[420px]">
        <Box
          className="flex items-center justify-center rounded-full mb-5"
          style={{
            width: 72,
            height: 72,
            background: "color-mix(in srgb, #ef4444 12%, transparent)",
          }}
        >
          <i className="ri-error-warning-fill text-4xl text-red-500" />
        </Box>
        <Typography variant="h5" className="font-bold mb-2">
          Application Not Found
        </Typography>
        <Typography
          variant="body2"
          className="text-[var(--mui-palette-text-secondary)] max-w-md"
        >
          The application or lead you are trying to access has been deleted or
          does not exist.
        </Typography>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card className="p-12 rounded-3xl text-center flex flex-col items-center justify-center min-h-[420px] border border-[var(--mui-palette-divider)] shadow-[0px_12px_32px_-16px_rgba(15,23,42,0.18)]">
        <Box
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background:
              "color-mix(in srgb, var(--mui-palette-success-main) 14%, transparent)",
          }}
        >
          <i className="ri-checkbox-circle-fill text-5xl text-[var(--mui-palette-success-main)]" />
        </Box>
        <Typography variant="h4" className="font-bold mb-2">
          Pre-Counselling Completed
        </Typography>
        <Typography
          variant="subtitle1"
          className="text-[var(--mui-palette-text-secondary)] max-w-md mx-auto"
        >
          Your pre-counselling session has been successfully completed. You can
          now proceed to upload your documents.
        </Typography>
        <Button
          variant="contained"
          href="/document-upload"
          className="mt-6 rounded-xl normal-case shadow-none px-8 py-2.5 font-semibold"
        >
          Proceed to Documents
          <i className="ri-arrow-right-line ml-1.5" />
        </Button>
      </Card>
    );
  }

  return (
    <>
      <HeaderCard displayInqNo={displayInqNo} mode={mode} />

      {existingBooking && (
        <ExistingBookingCard
          existingBooking={existingBooking}
          handleReschedule={handleReschedule}
          canReschedule={canReschedule}
          showScheduling={showScheduling}
          handleCancelReason={handleCancelReason}
          showCancel={showCancel}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          cancellationRequest={cancellationRequest}
        />
      )}

      {showScheduling && (
        <>
          <Step1BranchSelection
            locationDenied={locationDenied}
            loadingBranches={loadingBranches}
            branches={branches}
            selectedBranchId={selectedBranchId}
            handleBranchSelect={handleBranchSelect}
          />

          <Step2SessionMode mode={mode} setMode={setMode} />

          <Step3CvUpload
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            fileInputRef={fileInputRef}
            onFileInputChange={onFileInputChange}
            isDragging={isDragging}
            previewUrl={previewUrl}
            setIsPreviewOpen={setIsPreviewOpen}
            isPdf={isPdf}
          />

          <Step4TacSelection
            selectedBranchId={selectedBranchId}
            loadingTacs={loadingTacs}
            tacs={tacs}
            selectedTacId={selectedTacId}
            setSelectedTacId={setSelectedTacId}
            setProfileTac={setProfileTac}
          />

          <Step5SlotSelection
            selectedTacId={selectedTacId}
            date={date}
            setDate={setDate}
            todayStr={todayStr}
            loadingSlots={loadingSlots}
            slots={slots}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
          />

          <Step6CaptchaVerification
            handleCaptchaRefresh={handleCaptchaRefresh}
            captchaValue={captchaValue}
            handleCaptchaChange={handleCaptchaChange}
            handleCaptchaVerify={handleCaptchaVerify}
            captchaVerified={captchaVerified}
            canConfirm={canConfirm}
            handleConfirm={handleConfirm}
            bookingLoading={bookingLoading}
          />

          <SuccessDialog
            showConfirmPopup={showConfirmPopup}
            setShowConfirmPopup={setShowConfirmPopup}
            leadData={leadData}
            mode={mode}
          />

          <ResumePreviewDialog
            isPreviewOpen={isPreviewOpen}
            setIsPreviewOpen={setIsPreviewOpen}
            previewUrl={previewUrl}
            isPdf={isPdf}
          />

          <TacProfileDialog
            open={Boolean(profileTac)}
            tac={profileTac}
            onClose={() => setProfileTac(null)}
          />
        </>
      )}
    </>
  );
};

const PreCounselling = () => {
  const { reduxUser } = usePreCounselling();
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Suspense fallback={<CircularProgress />}>
          <PreCounsellingContent />
        </Suspense>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <ProgressSidebar activeStep={1} />
        <NotificationChannels reduxUser={reduxUser} />
      </Grid>
    </Grid>
  );
};

export default PreCounselling;