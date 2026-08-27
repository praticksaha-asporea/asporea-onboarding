"use client";

import React, { Suspense } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Skeleton from "@mui/material/Skeleton";
import { CircularProgress, Chip, Dialog, DialogContent } from "@mui/material";
import { LoadCanvasTemplate } from "react-simple-captcha";

import {
  usePreCounselling,
  Branch,
} from "@/Module/Candidate_Dashboard/Pre-Counselling/usePreCounselling";
import { ProgressSidebar } from "@/Components/PreCounselling/ProgressSidebar";
import { NotificationChannels } from "@/Components/PreCounselling/NotificationChannels";
import { SuccessDialog } from "@/Components/PreCounselling/SuccessDialog";
import { CamelCase, formatToDDMMYY } from "@/Utils/common";

import TacProfileDialog from "@/Components/modals/TacProfileDialog";
import { preTACData } from "@/Types/object.types";

// ---- shared visual bits, kept local since this is meant to be one file ----

const SectionHeader = ({
  icon,
  step,
  title,
  description,
  accent = "var(--mui-palette-primary-main)",
}: {
  icon: string;
  step: string;
  title: string;
  description?: string;
  accent?: string;
}) => (
  <Box className="flex items-start gap-4 mb-5">
    <Box
      className="flex items-center justify-center rounded-2xl shrink-0"
      style={{
        width: 44,
        height: 44,
        background: `color-mix(in srgb, ${accent} 12%, transparent)`,
      }}
    >
      <i className={icon} style={{ fontSize: 22, color: accent }} />
    </Box>
    <Box className="min-w-0">
      <Typography
        variant="caption"
        className="font-bold tracking-widest uppercase"
        style={{ color: accent, letterSpacing: "0.08em" }}
      >
        {step}
      </Typography>
      <Typography variant="h6" className="font-bold leading-snug -mt-0.5">
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          className="text-[var(--mui-palette-text-secondary)] mt-0.5"
        >
          {description}
        </Typography>
      )}
    </Box>
  </Box>
);

const sectionCardClass =
  "p-5 sm:p-7 rounded-3xl  shadow-2xl bg-[var(--mui-palette-primary)] mb-6";

const todayStr = new Date().toISOString().split("T")[0];
const PreCounsellingContent = () => {
  const {
    leadId,
    isValidLead,
    isCompleted,
    existingBooking,

    locationDenied,
    branches,
    loadingBranches,
    selectedBranchId,
    setSelectedBranchId,

    mode,
    setMode,
    showScheduling,
    handleReschedule,
    canReschedule,

    // cvFile,
    // cvUploading,
    // cvError,
    // handleCvChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    onFileInputChange,
    resumeFile,
    isDragging,
    fileInputRef,
    previewUrl,
    isPreviewOpen,
    setIsPreviewOpen,
    isPdf,

    tacs,
    loadingTacs,
    // tacSearch,
    // setTacSearch,
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
    reduxUser
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
      <Card className={sectionCardClass}>
        <Box className="flex items-start justify-between gap-3">
          <Box className="flex items-center gap-2.5 mb-1 flex-wrap">
            <Typography variant="h4">
              Confirm Pre-Counselling Readiness
            </Typography>
<Chip label={`Inquiry #${displayInqNo}`} size="small" className=" shadow-2xl text-[var(--mui-palette-primary-main)]
" />
          </Box>
          <Chip
            label={mode === "online" ? "🌐 Online" : "🏢 In-Person"}
            className="font-bold text-white text-[13px] shrink-0"
            sx={{
              bgcolor:
                mode === "online"
                  ? "var(--mui-palette-primary-main)"
                  : "var(--mui-palette-secondary-main)",
            }}
          />
        </Box>
      </Card>

      {existingBooking && (
        <Card className={sectionCardClass}>
          <Box className="p-5 rounded-2xl  ,transparent)] shadow-2xl  ,transparent)] flex items-center gap-4">
            <Box
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background:
                  "color-mix(in srgb, var(--mui-palette-primary-main) 14%, transparent)",
              }}
            >
              <i className="ri-calendar-check-fill text-2xl text-[var(--mui-palette-primary-main)]" />
            </Box>
            <Box>
              <Typography variant="h6" className="font-bold mb-1">
                Session Scheduled
              </Typography>
              <Typography
                variant="body2"
                className="text-[var(--mui-palette-text-secondary)]"
              >
                Booked for{" "}
                <strong>
                  {formatToDDMMYY(existingBooking?.schedule?.date as string)}
                </strong>{" "}
                at{" "}
                <strong>
                  {existingBooking?.schedule?.from} -{" "}
                  {existingBooking?.schedule?.to}
                </strong>
                .
              </Typography>
            </Box>
          </Box>
          <Box className="flex justify-end gap-2 mt-6">
            <Button
              variant="outlined"
              size="small"
              onClick={handleReschedule}
              disabled={canReschedule}
              className="rounded-xl normal-case text-sm shadow-md px-8 font-semibold gap-1"
            >
              {!showScheduling ? "Reschedule" : "Leave as it is"}
              <i className="ri-calendar-check-fill" />
            </Button>

            <Button
              variant="contained"
              size="small"
              className="rounded-xl normal-case text-sm shadow-md px-8 font-semibold gap-1 bg-[var(--mui-palette-error-main)]"
              onClick={handleCancelReason}
            >
              Cancel
              <i className="ri-delete-bin-fill" />
            </Button>

            <Button
              variant="contained"
              size="small"
              href="/document-upload"
              className="rounded-xl normal-case text-sm shadow-md px-8 font-semibold"
            >
              Go to Documents
              <i className="ri-arrow-right-line" />
            </Button>
          </Box>
          {showCancel && (
            <Box
              className="
              mt-6
              p-5
              rounded-2xl
              shadow-2xl
              
              bg-[var(--mui-palette-primary)]
            "
            >
              <Box className="flex items-center gap-2 mb-4">
                <Box
                  className="
                  flex items-center justify-center
                  w-9 h-9
                  rounded-xl
                 
          text-[var(--mui-palette-error-main)]
                "
                >
                  <i className="ri-close-circle-line text-xl" />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle1"
                    className="font-medium text-[var(--mui-palette-error-main)] "
                  >
                    Cancellation Request
                  </Typography>

                  <Typography
                    variant="caption"
                    className="text-[var(--mui-palette-error-main)]"
                  >
                    Please provide a reason for cancelling this session.
                  </Typography>
                </Box>
              </Box>

              <TextField
                label="Reason"
                variant="outlined"
                fullWidth
                multiline
                minRows={4}
                placeholder="Enter your cancellation reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />

              <Box className="flex justify-end mt-4">
                <Button
                  variant="contained"
                  color="error"
                  onClick={cancellationRequest}
                  className="
                  rounded-xl
                  normal-case
                  px-7
                  font-semibold
                  gap-2
                "
                  startIcon={<i className="ri-send-plane-fill" />}
                >
                  Send Request
                </Button>
              </Box>
            </Box>
          )}
        </Card>
      )}
      {showScheduling && (
        <>
          <Card className={sectionCardClass}>
            <SectionHeader
              icon="ri-map-pin-2-line"
              step="Step 1"
              title="Choose Your Branch"
              description="Branches near you, based on your current location."
              accent="var(--mui-palette-secondary-main)"
            />

            {locationDenied && (
              <Box className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-[color-mix(in_srgb,#f59e0b_10%,transparent)]">
                <i className="ri-map-pin-off-line text-amber-600" />
                <Typography variant="caption" className="text-amber-700">
                  Couldn't access your location — showing default branches.
                </Typography>
              </Box>
            )}

            {loadingBranches ? (
              <Box className="flex gap-3 overflow-x-auto pb-1">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    width={200}
                    height={84}
                    className="rounded-2xl shrink-0"
                  />
                ))}
              </Box>
            ) : branches.length === 0 ? (
              <Typography
                variant="body2"
                className="text-[var(--mui-palette-text-secondary)]"
              >
                No branches found near your location.
              </Typography>
            ) : (
              <Box className="flex gap-3 overflow-x-auto pb-1">
                {branches.map((branch: Branch) => {
                  const isSelected = selectedBranchId === branch._id;
                  return (
                    <Box
                      key={branch._id}
                      onClick={() => handleBranchSelect(branch._id)}
                      className={`flex flex-col gap-1 p-4 rounded-2xl   cursor-pointer shrink-0 transition-all duration-200 ${
                        isSelected
                          ? "border-[var(--mui-palette-primary-main)] bg-[color-mix(in_srgb,var(--mui-palette-primary-main)_19%,transparent)]"
                          : "border-[var(--mui-palette-divider)] hover:border-[var(--mui-palette-primary-main)]/40"
                      }`}
                      style={{ minWidth: 200 }}
                    >
                      <Box className="flex items-center gap-2">
                        <i
                          className={
                            isSelected
                              ? "ri-checkbox-circle-fill text-[var(--mui-palette-primary-main)]"
                              : "ri-building-4-line text-[var(--mui-palette-text-secondary)]"
                          }
                        />
                        <Typography
                          variant="subtitle2"
                          className="font-medium tracking-wide text-[var(--mui-palette-primary)]
"
                        >
                          {branch.title}
                        </Typography>
                      </Box>
                      {branch.city && (
                        <Typography
                          variant="caption"
                          className="text-[var(--mui-palette-text-secondary)]"
                        >
                          {branch.city}
                        </Typography>
                      )}
                      {typeof branch.distanceKm === "number" && (
                        <Typography
                          variant="caption"
                          className="mt-1 text-[var(--mui-palette-info-main)]"
                        >
                          {branch.distanceKm.toFixed(1)} km away
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Card>

          <Card className={sectionCardClass}>
            <SectionHeader
              icon="ri-route-line"
              step="Step 2"
              title="Session Mode"
              description="How you'd like to connect with your TAC."
              accent="var(--mui-palette-secondary-main)"
            />
            <Box className="flex gap-2 p-1 rounded-2xl bg-[var(--mui-overlays-1,_rgba(0,0,0,0.03))] w-fit">
              {(["online", "offline"] as const).map((opt) => {
                const isActive = mode === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setMode(opt)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl tracking-wide text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[var(--mui-palette-primary-main)] shadow-[0px_4px_14px_-4px_rgba(15,23,42,0.25)] text-white"
                        : "text-[var(--mui-palette-text-primary)] hover:text-[var(--mui-palette-text-primary)]"
                    }`}
                  >
                    <i
                      className={
                        opt === "online"
                          ? "ri-vidicon-line"
                          : "ri-building-4-line"
                      }
                      style={{ fontSize: 17 }}
                    />
                    {opt === "online" ? "Online" : "In-Person"}
                  </button>
                );
              })}
            </Box>
          </Card>

          <Card className={sectionCardClass}>
            <SectionHeader
              icon="ri-file-upload-line"
              step="Step 3"
              title="Upload Your CV"
              description="Your TAC will review this ahead of the session."
              accent="var(--mui-palette-warning-main)"
            />

            <Grid container spacing={6}>
              <Grid size={{ xs: 12, md: 6 }} id="resumeFile">
                <Typography className="text-[12px] font-semibold mb-1.5">
                  Upload CV
                </Typography>
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={` shadow-2xl rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all h-[220px] ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-[--mui-palette-secondary-lightOpacity]"}`}
                >
                  <input
                    ref={fileInputRef}
                    hidden
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={onFileInputChange}
                  />
                  <i className="ri-upload-cloud-2-line text-4xl text-blue-500 mb-3" />
                  <Typography className="font-semibold text-sm">
                    Drag & Drop CV
                  </Typography>
                  <Typography className="text-xs text-gray-500 mt-1">
                    PDF, JPG, JPEG, PNG
                  </Typography>
                </Box>
              </Grid>
              {previewUrl && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography className="text-[12px] font-semibold mb-1.5">
                    CV Preview
                  </Typography>
                  <Box
                    onClick={() => setIsPreviewOpen(true)}
                    className="border rounded-xl h-[220px] bg-gray-50 overflow-hidden relative cursor-pointer group hover:border-blue-500 transition-all"
                  >
                    {isPdf ? (
                      <Box className="w-full h-full pointer-events-none relative">
                        <iframe
                          src={previewUrl}
                          className="w-full h-full border-0"
                        />
                        <Box className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <Box className="bg-white/90 text-blue-600 px-3 py-1.5 rounded-lg shadow-sm font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to view document
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box className="w-full h-full flex items-center justify-center bg-white relative">
                        <img
                          src={previewUrl}
                          alt="Resume Preview"
                          className="w-full h-full object-contain"
                        />
                        <Box className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <Box className="bg-white/90 text-blue-600 px-3 py-1.5 rounded-lg shadow-sm font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to view image
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Card>

          <Card className={sectionCardClass}>
            <SectionHeader
              icon="ri-user-star-line"
              step="Step 4"
              title="Choose Your Preferred TAC"
              description="Your dedicated point of contact for this session."
            />

            {!selectedBranchId ? (
              <Box className="flex flex-col items-center text-center gap-2 py-8">
                <i className="ri-map-pin-line text-3xl text-[var(--mui-palette-text-secondary)]" />
                <Typography
                  variant="body2"
                  className="text-[var(--mui-palette-text-secondary)]"
                >
                  Select a branch above to see available TACs.
                </Typography>
              </Box>
            ) : (
              <>
                {/* <TextField
              size="small"
              placeholder="Search TAC by name"
              value={tacSearch}
              onChange={(e) => setTacSearch(e.target.value)}
              className="mb-4 max-w-xs"
              InputProps={{
                className: "rounded-xl",
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="ri-search-line" style={{ fontSize: 16 }} />
                  </InputAdornment>
                ),
              }}
            /> */}

                {loadingTacs ? (
                  <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2].map((i) => (
                      <Box
                        key={i}
                        className="relative flex flex-col items-center text-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200"
                      >
                        <Skeleton variant="circular" width={52} height={52} />
                        <Box className="flex-1">
                          <Skeleton variant="text" width="40%" />
                          <Skeleton variant="text" width="60%" />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : tacs.length === 0 ? (
                  <Typography
                    variant="body2"
                    className="text-[var(--mui-palette-text-secondary)]"
                  >
                    No TAC available for this branch and mode yet.
                  </Typography>
                ) : (
                  <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tacs?.map((tac: preTACData) => {
                      const tacId = tac._id.toString();
                      const isSelected = selectedTacId === tacId;
                      const rating = tac?.tacProfile?.rating;

                      return (
                        <Box
                          key={tacId}
                          onClick={() =>
                            setSelectedTacId((prev) =>
                              prev === tacId ? "" : tacId,
                            )
                          }
                          className={`relative flex flex-col items-center text-center shadow-2xl p-5 rounded-2xl   cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "  bg-[color-mix(in_srgb,var(--mui-palette-primary-main)_16%,transparent)] shadow-2xl"
                              : "border-[var(--mui-palette-divider)] hover:border-[var(--mui-palette-primary-main)]/40 hover:shadow-sm"
                          }`}
                        >
                          {/* Selected indicator */}
                          {isSelected && (
                            <i className="ri-checkbox-circle-fill absolute top-3 right-3 text-xl text-[var(--mui-palette-primary-main)]" />
                          )}

                          {/* Profile Image */}
                          <Avatar
                            src={tac.profilePic as unknown as string}
                            sx={{
                              width: 72,
                              height: 72,
                              mb: 2,
                            }}
                          >
                            {tac.firstName?.charAt(0)}
                          </Avatar>

                          {/* Name */}
                          <Typography
                            variant="subtitle1"
                            className="font-bold leading-tight"
                          >
                            {tac.firstName} {tac.lastName}
                          </Typography>

                          {/* Rating */}
                          {typeof rating === "number" && (
                            <Box className="flex items-center justify-center gap-0.5 text-amber-500 mt-1.5">
                              {Array.from({ length: 5 }, (_, index) => {
                                const starValue = index + 1;

                                let icon = "ri-star-line";

                                if (rating >= starValue) {
                                  icon = "ri-star-fill";
                                } else if (rating >= starValue - 0.5) {
                                  icon = "ri-star-half-fill";
                                }

                                return (
                                  <i
                                    key={index}
                                    className={icon}
                                    style={{ fontSize: 14 }}
                                  />
                                );
                              })}

                              <Typography
                                variant="caption"
                                className="font-semibold ml-1"
                              >
                                {rating.toFixed(1)}
                              </Typography>
                            </Box>
                          )}

                          {/* Designation */}
                          <Typography
                            variant="body2"
                            className="text-[var(--mui-palette-text-secondary)] mt-2"
                          >
                            {CamelCase(tac?.tacProfile?.designation as string)}
                          </Typography>

                          {/* Experience */}
                          {tac?.experienceInMonths ? (
                            <Typography
                              variant="caption"
                              className="text-[var(--mui-palette-text-secondary)] mt-1"
                            >
                              {Number((tac.experienceInMonths / 12).toFixed(2))}{" "}
                              yrs experience
                            </Typography>
                          ) : null}

                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            startIcon={<i className="ri-user-line" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfileTac(tac);
                            }}
                            sx={{
                              mt: 3,
                              borderRadius: 2,
                              textTransform: "none",
                            }}
                          >
                            View Profile
                          </Button>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </>
            )}
          </Card>

          <Card className={sectionCardClass}>
            <SectionHeader
              icon="ri-calendar-schedule-line"
              step="Step 5"
              title="Pick a Date & Time Slot"
              accent="var(--mui-palette-secondary-main)"
            />

            {!selectedTacId ? (
              <Box className="flex flex-col items-center text-center gap-2 py-8">
                <i className="ri-user-search-line text-3xl text-[var(--mui-palette-text-secondary)]" />
                <Typography
                  variant="body2"
                  className="text-[var(--mui-palette-text-secondary)]"
                >
                  Select a TAC above to see their available slots.
                </Typography>
              </Box>
            ) : (
              <>
                <TextField
                  type="date"
                  size="small"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mb-5 max-w-[200px]"
                  InputProps={{ className: "rounded-xl" }}
                  inputProps={{ min: todayStr }}
                />

                {loadingSlots ? (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, 1fr)",
                        sm: "repeat(auto-fill, minmax(165px, 1fr))",
                      },
                      gap: 1.5,
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton
                        key={i}
                        variant="rectangular"
                        height={36.5}
                        sx={{ borderRadius: "20px", width: "100%" }}
                      />
                    ))}
                  </Box>
                ) : slots.length === 0 ? (
                  <Typography
                    variant="body2"
                    className="text-[var(--mui-palette-text-secondary)]"
                  >
                    No slots available for this date.
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, 1fr)",
                        sm: "repeat(auto-fill, minmax(165px, 1fr))",
                      },
                      gap: 1.5,
                    }}
                  >
                    {slots.map((slot, idx) => {
                      const isSelected = selectedSlot?.time === slot.time;
                      return (
                        <Button
                          key={idx}
                          disabled={!slot.available}
                          onClick={() => {
                            if (!slot.available) return;

                            setSelectedSlot((prev) =>
                              prev?.from === slot.from && prev?.to === slot.to
                                ? null
                                : slot,
                            );
                          }}
                          sx={{
                            width: "100%",
                            minWidth: 0,
                            height: "36.5px",
                            borderRadius: "20px",
                            fontSize: { xs: "11px", sm: "13px" },
                            px: { xs: 0.5, sm: 2 },
                            textTransform: "none",
                            fontWeight: 500,

                            transition:
                              "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, background-color 0.2s ease, border-color 0.2s ease",
                            willChange: "transform",

                            bgcolor: isSelected
                              ? "var(--mui-palette-primary-main)"
                              : "var(--mui-palette-background-paper)",

                            color: isSelected
                              ? "#ffffff"
                              : slot.available
                                ? "var(--mui-palette-text-primary)"
                                : "var(--mui-palette-text-disabled)",

                            boxShadow: isSelected
                              ? "0px 4px 14px rgba(18, 93, 163, 0.4)"
                              : "0px 4px 10px rgba(0, 0, 0, 0.2), inset 0px 1px 0px rgba(255, 255, 255, 0.08)",

                            "&:hover": {
                              zIndex: 2,
                              transform: slot.available
                                ? "translateY(-7px) scale(1.04)"
                                : "none",
                              boxShadow: isSelected
                                ? "0px 14px 28px rgba(18, 93, 163, 0.5)"
                                : slot.available
                                  ? "0px 14px 25px rgba(0, 0, 0, 0.35), 0px 6px 10px rgba(0, 0, 0, 0.2)"
                                  : "none",
                              borderColor: isSelected
                                ? "transparent"
                                : "var(--mui-palette-primary-main)",
                            },

                            "&:active": {
                              transform: slot.available
                                ? "translateY(-2px) scale(0.98)"
                                : "none",
                            },
                          }}
                        >
                          {slot.time || `${slot.from} - ${slot.to}`}
                        </Button>
                      );
                    })}
                  </Box>
                )}
              </>
            )}
          </Card>

          <Card className={sectionCardClass}>
            <SectionHeader
              icon="ri-shield-check-line"
              step="Step 6"
              title="Quick Verification"
              description="Confirm you're not a robot to finish up."
              accent="var(--mui-palette-success-main)"
            />
            <Box className="flex items-start gap-3 flex-wrap">
              <Box
                className="rounded-xl overflow-hidden shadow-[0px_2px_8px_rgba(15,23,42,0.08)] flex items-center justify-center shrink-0"
                sx={{
                  width: 100,
                  height: 40,
                  minWidth: 100,
                  minHeight: 40,
                  "& canvas": {
                    width: "100px !important",
                    height: "40px !important",
                    display: "block",
                  },
                }}
              >
                <LoadCanvasTemplate reloadText=" " reloadColor="#125da3" />
              </Box>
              <IconButton
                onClick={handleCaptchaRefresh}
                aria-label="Refresh captcha"
                className="rounded-xl"
                sx={{
                  bgcolor:
                    "color-mix(in srgb, var(--mui-palette-primary-main) 8%, transparent)",
                }}
              >
                <i className="ri-refresh-line text-lg" />
              </IconButton>
              <TextField
                size="small"
                placeholder="Enter the code above"
                value={captchaValue}
                onChange={(e) => handleCaptchaChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCaptchaVerify();
                  }
                }}
                error={captchaValue.length > 0 && !captchaVerified}
                helperText={
                  captchaValue.length > 0 && !captchaVerified
                    ? "Click Verify once you've typed the code"
                    : captchaVerified
                      ? "Verified"
                      : " "
                }
                className="max-w-xs"
                autoComplete="off"
                InputProps={{
                  className: "rounded-xl",
                  endAdornment:
                    captchaValue && captchaVerified ? (
                      <InputAdornment position="end">
                        <i
                          className="ri-checkbox-circle-fill text-[var(--mui-palette-success-main)]"
                          style={{ fontSize: 18 }}
                        />
                      </InputAdornment>
                    ) : undefined,
                }}
              />
              <button
                type="button"
                onClick={handleCaptchaVerify}
                className="px-4 py-2 rounded-xl bg-[#125da3] text-white text-sm font-medium hover:bg-[#0d4c88] transition-colors"
              >
                Verify
              </button>
            </Box>
          </Card>

          <Box
            className="flex justify-end gap-4 mt-2 py-4 sticky bottom-0 backdrop-blur-sm"
            style={{
              background:
                "color-mix(in srgb, var(--mui-palette-background-default, white) 85%, transparent)",
            }}
          >
            <Button
              variant="contained"
              size="large"
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="rounded-xl normal-case text-sm px-8 font-semibold"
              sx={{
                boxShadow: canConfirm
                  ? "0px 8px 20px -6px var(--mui-palette-primary-main)"
                  : "none",
              }}
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
          </Box>

          <SuccessDialog
            showConfirmPopup={showConfirmPopup}
            setShowConfirmPopup={setShowConfirmPopup}
            leadData={leadData}
            mode={mode}
          />
          <Dialog
            open={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              className: "rounded-[20px] relative overflow-hidden",
            }}
          >
            <Box className="flex items-center justify-between px-5 py-3 border-b border-[var(--mui-palette-divider)]">
              <Typography variant="subtitle1" className="font-bold">
                Resume Preview
              </Typography>
              <Box className="flex items-center gap-2">
                {previewUrl && (
                  <a
                    href={previewUrl}
                    download="Resume"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<i className="ri-download-2-line" />}
                    >
                      Download
                    </Button>
                  </a>
                )}
                <IconButton
                  size="small"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  <i className="ri-close-line text-xl" />
                </IconButton>
              </Box>
            </Box>
            <DialogContent className="p-0 bg-gray-50 flex items-center justify-center min-h-[60vh]">
              {previewUrl && isPdf ? (
                <iframe
                  src={previewUrl}
                  title="Resume PDF Preview"
                  className="w-full min-h-[75vh] border-0"
                />
              ) : (
                previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Resume Image Preview"
                    className="max-w-full max-h-[75vh] object-contain p-4"
                  />
                )
              )}
            </DialogContent>
          </Dialog>

          <TacProfileDialog
            open={Boolean(profileTac)}
            tac={profileTac}
            onClose={() => setProfileTac(null)}
          />
        </>
      )}
      {/* <Dialog
        open={Boolean(profileTac)}
        onClose={() => setProfileTac(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box className="flex items-center justify-between">
            <Typography variant="h6" className="font-bold">
              TAC Profile
            </Typography>

            <IconButton onClick={() => setProfileTac(null)}>
              <i className="ri-close-line text-xl" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {profileTac && (
            <Box className="flex flex-col gap-5">
              <Box className="flex items-center gap-4">
                <Avatar
                  src={profileTac.profilePic as unknown as string}
                  sx={{ width: 80, height: 80 }}
                >
                  {profileTac.firstName?.charAt(0)}
                </Avatar>

                <Box>
                  <Typography variant="h6" className="font-bold">
                    {profileTac.firstName} {profileTac.lastName}
                  </Typography>

                  <Typography
                    variant="body2"
                    className="text-[var(--mui-palette-text-secondary)]"
                  >
                    {CamelCase(profileTac.tacProfile?.designation as string)}
                  </Typography>

                  {typeof profileTac.tacProfile?.rating === "number" && (
                    <Box className="flex items-center gap-1 text-amber-500 mt-1">
                      <i className="ri-star-fill" />

                      <Typography variant="body2" className="font-semibold">
                        {profileTac.tacProfile.rating.toFixed(1)} / 5
                      </Typography>
                    </Box>
                  )}

                </Box>
              </Box>
              <Box>
                <Typography variant="h6" className="font-bold">
                  Available on:
                </Typography>
                <Typography variant="body2" >
                  {profileTac.tacProfile?.mode === "both" ? "🌐 Online & 🏢 In-Person" : profileTac.tacProfile?.mode === "online" ? "🌐 Online" : "🏢 In-Person"}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" className="font-bold mb-1">
                  Experience
                </Typography>

                <Typography variant="body2">
                  {profileTac.experienceInMonths
                    ? `${Number(
                      (profileTac.experienceInMonths / 12).toFixed(2)
                    )} Years`
                    : "Not specified"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" className="font-bold mb-2">
                  Areas of Expertise
                </Typography>

                <Box className="flex flex-wrap gap-2">
                  {profileTac.tacProfile?.areasOfExp?.length ? (
                    profileTac.tacProfile.areasOfExp.map((item, index) => (
                      <Chip
                        key={index}
                        label={CamelCase(item)}
                        size="small"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Not specified
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" className="font-bold mb-2">
                  Industry Expertise
                </Typography>

                <Box className="flex flex-wrap gap-2">
                  {profileTac.tacProfile?.industryExp?.length ? (
                    profileTac.tacProfile.industryExp.map((item, index) => (
                      <Chip
                        key={index}
                        label={CamelCase(item)}
                        size="small"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Not specified
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" className="font-bold mb-2">
                  Specialization
                </Typography>

                <Box className="flex flex-wrap gap-2">
                  {profileTac.tacProfile?.specialization?.length ? (
                    profileTac.tacProfile.specialization.map((item, index) => (
                      <Chip
                        key={index}
                        label={CamelCase(item)}
                        size="small"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Not specified
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" className="font-bold mb-2">
                  Languages Known
                </Typography>

                <Box className="flex flex-wrap gap-2">
                  {profileTac.tacProfile?.languagesKnown?.length ? (
                    profileTac.tacProfile.languagesKnown.map((language, index) => (
                      <Chip
                        key={index}
                        label={language}
                        size="small"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Not specified
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog> */}
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
