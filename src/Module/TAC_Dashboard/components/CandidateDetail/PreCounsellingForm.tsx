import React from "react";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogContent,
  IconButton,
  Chip,
  Avatar,
} from "@mui/material";
import { CamelCase, isWithinSchedule } from "@/Utils/common";
import { usePreCounselling } from "./usePreCounselling";
import {
  BranchType,
  CandidateLead,
  ConsultantType,
} from "@/Types/Frontend_Payload/Candidate.types";
import { IAssignment } from "@/lib/models/Assignment.model";
import { IBranch } from "@/lib/models/Branch.model";
import { IUser } from "@/lib/models/User.model";

interface PreCounsellingFormProps {
  candidate: CandidateLead;
  inqAssign: IAssignment;
  branchId: IBranch;
  consultantId: IUser;
  source: { type?: string; refType?: string; refName?: string };
  preferences?: {
    branchId?: BranchType | string;
    consultantId?: ConsultantType | string;
    visitType?: string;
  };
  candidatePhone: string;
}

const PreCounsellingForm: React.FC<PreCounsellingFormProps> = ({
  candidate: c,
  inqAssign,
  branchId,
  consultantId,
  source,
  preferences,
  candidatePhone,
}) => {
  const {
    preForm,
    isPreLocked,
    setIsPreLocked,
    previewUrl,
    isPreviewOpen,
    setIsPreviewOpen,
    isPdf,
    isDragging,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    onFileInputChange,
    updateAssignmentStatus,
  } = usePreCounselling(inqAssign, candidatePhone);

  const consultantFullName = consultantId?.firstName
    ? `${consultantId.firstName} ${consultantId.lastName ?? ""}`.trim()
    : "Unassigned";

  const scheduledDateObj = inqAssign?.schedule?.date
    ? dayjs(inqAssign.schedule.date)
    : null;
  const formattedDate = scheduledDateObj
    ? scheduledDateObj.format("DD MMM YYYY")
    : "—";
  const formattedDay = scheduledDateObj ? scheduledDateObj.format("dddd") : "";

  const formattedTimeSlot = inqAssign?.schedule?.from
    ? `${inqAssign.schedule.from} ${
        inqAssign.schedule.to ? "– " + inqAssign.schedule.to : ""
      }`
    : "—";

  const visitMethodLabel =
    inqAssign?.schedule?.method === "on" ? "Remote" : "In-Office";
  const visitMethodSub =
    inqAssign?.schedule?.method === "on" ? "Online Session" : "At Branch";

  const rawStatus = preForm.values.preStatus || inqAssign?.status || "assigned";

  const statusDisplayMap: Record<
    string,
    { label: string; colorClass: string }
  > = {
    assigned: { label: "Scheduled", colorClass: " text-lg text-blue-500 " },
    contacted: {
      label: "Contacted",
      colorClass: "bg-amber-50 text-amber-700  ",
    },
    queued: { label: "Queued", colorClass: "bg-purple-50 text-purple-700  " },
    completed: {
      label: "Completed",
      colorClass: "bg-green-500 text-white ",
    },
    not_responded: {
      label: "Unattended",
      colorClass: "bg-rose-50 text-rose-700  ",
    },
    rejected: { label: "Rejected", colorClass: "bg-gray-100 text-gray-700  " },
  };

  const currentStatusInfo = statusDisplayMap[rawStatus] || {
    label: CamelCase(rawStatus),
    colorClass: "  text-blue-700  ",
  };

  return (
    <Card className="p-5 md:p-8 rounded-3xl shadow-xl bg-[var(--mui-palette-background-paper)]">
      <form onSubmit={preForm.handleSubmit}>
        {/* HEADER SECTION */}
        <Box className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <Box className="flex items-center gap-3">
            <Box className="w-12 h-12 rounded-2xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 shadow-lg">
              <i className="ri-calendar-event-line text-2xl" />
            </Box>
            <Box>
              <Typography className="text-[18px] font-medium leading-tight">
                Pre-Counselling
              </Typography>
            </Box>
          </Box>

          <Box className="flex items-center gap-2">
            <Box
              className={`px-3 py-1.5 rounded-full shadow-xl dark:shadow-md dark:shadow-white/10 text-xs font-semibold flex items-center gap-2 ${currentStatusInfo.colorClass}`}
            >
              <span className="w-2 h-2 rounded-full bg-current inline-block" />
              {currentStatusInfo.label}
            </Box>
          </Box>
        </Box>

        <Stack spacing={4}>
          <Grid container spacing={3}>
            {/* ---------------- LEFT COLUMN: ASSIGNED CONSULTANT ---------------- */}
            <Grid size={{ xs: 12, md: 4.5, lg: 4 }}>
              <Box className="h-full bg-[var(--mui-palette-background-default)] rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl gap-5">
                {/* Top Header / Status Indicator (Green tick removed & centered) */}
                <Box className="w-full flex items-center justify-center">
                  <Box className="bg-[var(--mui-palette-background-paper)] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm shrink-0">
                    <i className="ri-calendar-todo-line text-[var(--mui-palette-primary-main)] text-sm shrink-0" />
                    <Typography className="text-[12px] font-semibold text-[var(--mui-palette-warning-dark)] whitespace-nowrap">
                      Assigned Consultant
                    </Typography>
                  </Box>
                </Box>

                {/* Avatar */}
                <Box className="relative my-1">
                  <Avatar
                    src={
                      consultantId?.profilePic
                        ? String(consultantId.profilePic)
                        : "/images/avatars/avatar.png"
                    }
                    alt={consultantFullName}
                    className="w-24 h-24 border-4 border-[var(--mui-palette-background-paper)] shadow-xl mx-auto text-2xl !bg-[var(--mui-palette-primary-main)] font-bold text-white"
                  >
                    {consultantFullName.charAt(0)}
                  </Avatar>
                </Box>

                {/* Consultant Details */}
                <Box className="flex flex-col items-center gap-2 w-full">
                  <Typography
                    variant="h6"
                    className="font-bold text-[var(--mui-palette-primary-main)] leading-snug truncate max-w-full"
                  >
                    {consultantFullName}
                  </Typography>

                  {/* Rating */}
                  <Box className="flex items-center justify-center gap-1 text-amber-400 text-sm">
                    <i className="ri-star-fill" />
                    <i className="ri-star-fill" />
                    <i className="ri-star-fill" />
                    <i className="ri-star-fill" />
                    <i className="ri-star-line" />
                    <Typography className="text-xs font-semibold text-[var(--mui-palette-text-secondary)] ml-1">
                      4.0
                    </Typography>
                  </Box>

                  {/* Experience Badge */}
                  <Chip
                    label="Certified Counsellor"
                    size="small"
                    className="mt-1 bg-[var(--mui-palette-background-paper)] border border-[var(--mui-palette-divider)] text-[var(--mui-palette-text-primary)] font-medium text-[11px] shadow-sm"
                  />
                </Box>
              </Box>
            </Grid>

            {/* ---------------- RIGHT COLUMN: MIXED GRID (FULL WIDTH + 2x2 TILES) ---------------- */}
            <Grid size={{ xs: 12, md: 7.5, lg: 8 }}>
              <Grid container spacing={2}>
                {/* 1. Scheduled Date (Full Width) */}
                <Grid size={{ xs: 12 }} className="flex">
                  <Box className="bg-[var(--mui-palette-background-default)] shadow-xl rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-colors w-full h-full">
                    <Box className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 text-lg bg-[var(--mui-palette-primary-lightOpacity)]">
                      <i className="ri-calendar-line" />
                    </Box>
                    <Box className="min-w-0 flex-1">
                      <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] uppercase tracking-wider">
                        Scheduled Date
                      </Typography>
                      <Typography className="text-[14px] font-normal tracking-wide text-[var(--mui-palette-text-primary)] leading-tight mt-0.5">
                        {formattedDate} {formattedDay ? `(${formattedDay})` : ""}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* 2. Time Slot (Full Width) */}
                <Grid size={{ xs: 12 }} className="flex">
                  <Box className="bg-[var(--mui-palette-background-default)] shadow-xl rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-colors w-full h-full">
                    <Box className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 text-lg bg-[var(--mui-palette-primary-lightOpacity)]">
                      <i className="ri-time-line" />
                    </Box>
                    <Box className="min-w-0 flex-1">
                      <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] uppercase tracking-wider">
                        Time Slot
                      </Typography>
                      <Typography className="text-[14px] font-normal tracking-wide text-[var(--mui-palette-text-primary)] leading-snug mt-0.5 whitespace-normal break-words">
                        {formattedTimeSlot}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* 3. Visit Method (Full Width) */}
                <Grid size={{ xs: 12 }} className="flex">
                  <Box className="bg-[var(--mui-palette-background-default)] shadow-xl rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-colors w-full h-full">
                    <Box className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 text-lg bg-[var(--mui-palette-primary-lightOpacity)]">
                      <i className="ri-map-pin-line" />
                    </Box>
                    <Box className="min-w-0 flex-1">
                      <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] uppercase tracking-wider">
                        Visit Method
                      </Typography>
                      <Typography className="text-[14px] font-normal tracking-wide text-[var(--mui-palette-text-primary)] leading-tight mt-0.5">
                        {visitMethodLabel} <span className="text-[12px] text-[var(--mui-palette-text-disabled)]">({visitMethodSub})</span>
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* 4. Branch (2x2 Grid) */}
                <Grid size={{ xs: 12, sm: 6 }} className="flex">
                  <Box className="bg-[var(--mui-palette-background-default)] shadow-xl rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-colors w-full h-full">
                    <Box className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 text-lg bg-[var(--mui-palette-primary-lightOpacity)]">
                      <i className="ri-building-line" />
                    </Box>
                    <Box className="min-w-0 flex-1">
                      <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] uppercase tracking-wider">
                        Branch
                      </Typography>
                      <Typography className="text-[14px] font-normal tracking-wide text-[var(--mui-palette-text-primary)] truncate leading-tight mt-0.5">
                        {branchId?.title ?? "—"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* 5. Source (2x2 Grid) */}
                <Grid size={{ xs: 12, sm: 6 }} className="flex">
                  <Box className="bg-[var(--mui-palette-background-default)] shadow-xl rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-colors w-full h-full">
                    <Box className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 text-lg bg-[var(--mui-palette-primary-lightOpacity)]">
                      <i className="ri-links-line" />
                    </Box>
                    <Box className="min-w-0 flex-1">
                      <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] uppercase tracking-wider">
                        Source
                      </Typography>
                      <Typography className="text-[14px] font-normal tracking-wide text-[var(--mui-palette-text-primary)] truncate leading-tight mt-0.5">
                        {CamelCase(source?.type ?? "") || "—"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* 6. Referred By Type (2x2 Grid) */}
                <Grid size={{ xs: 12, sm: 6 }} className="flex">
                  <Box className="bg-[var(--mui-palette-background-default)] shadow-xl rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-colors w-full h-full">
                    <Box className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 text-lg bg-[var(--mui-palette-primary-lightOpacity)]">
                      <i className="ri-price-tag-3-line" />
                    </Box>
                    <Box className="min-w-0 flex-1">
                      <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] uppercase tracking-wider">
                        Referred By (Type)
                      </Typography>
                      <Typography className="text-[14px] font-normal tracking-wide text-[var(--mui-palette-text-primary)] truncate leading-tight mt-0.5">
                        {CamelCase(source?.refType ?? "") || "—"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* 7. Referred By Name (2x2 Grid) */}
                <Grid size={{ xs: 12, sm: 6 }} className="flex">
                  <Box className="bg-[var(--mui-palette-background-default)] shadow-xl rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-colors w-full h-full">
                    <Box className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 text-lg bg-[var(--mui-palette-primary-lightOpacity)]">
                      <i className="ri-user-shared-line" />
                    </Box>
                    <Box className="min-w-0 flex-1">
                      <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] uppercase tracking-wider">
                        Referred By (Name)
                      </Typography>
                      <Typography className="text-[14px] font-normal tracking-wide text-[var(--mui-palette-text-primary)] truncate leading-tight mt-0.5">
                        {source?.refName || "—"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* 8. Queue Position / Token (Conditional 2x2 Grid) */}
                {preferences?.visitType === "offline" && (
                  <Grid size={{ xs: 12, sm: 6 }} className="flex">
                    <Box className="bg-[var(--mui-palette-background-default)] shadow-xl rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-colors w-full h-full">
                      <Box className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 text-lg bg-[var(--mui-palette-primary-lightOpacity)]">
                        <i className="ri-group-line" />
                      </Box>
                      <Box className="min-w-0 flex-1">
                        <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] uppercase tracking-wider">
                          Queue Position / Token
                        </Typography>
                        <Typography className="text-[14px] font-normal tracking-wide text-[var(--mui-palette-text-primary)] truncate leading-tight mt-0.5">
                          {inqAssign?.token?.number || "—"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* 9. Inquiry Created (Full Width) */}
                <Grid size={{ xs: 12 }} className="flex">
                  <Box className="bg-[var(--mui-palette-background-default)] shadow-xl rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-colors w-full h-full">
                    <Box className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 text-lg bg-[var(--mui-palette-primary-lightOpacity)]">
                      <i className="ri-history-line" />
                    </Box>
                    <Box className="min-w-0 flex-1">
                      <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] uppercase tracking-wider">
                        Inquiry Created
                      </Typography>
                      <Typography className="text-[14px] font-normal tracking-wide text-[var(--mui-palette-text-primary)] truncate leading-tight mt-0.5">
                        {c?.createdAt
                          ? dayjs(c.createdAt).format("DD MMM YYYY, hh:mm A")
                          : "—"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* ---------------- INTERACTIVE STATUS CONTROL BAR ---------------- */}
          <Box className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 shadow-2xl rounded-2xl bg-[var(--mui-palette-background-default)]">
            <FormControl>
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-[var(--mui-palette-text-secondary)] mb-2">
                Update Status
              </FormLabel>
              <RadioGroup
                row
                name="preStatus"
                value={preForm.values.preStatus}
                onChange={(e, value) => {
                  setIsPreLocked(
                    !(preForm.isSubmitting || isWithinSchedule(inqAssign)) &&
                      (value === "completed" ||
                        value === "rejected" ||
                        value === "queued") &&
                      inqAssign?.status !== "completed" &&
                      inqAssign?.status !== "rejected" &&
                      inqAssign?.status !== "queued",
                  );
                  return preForm.handleChange(e);
                }}
                className="gap-x-4 gap-y-2"
              >
                <FormControlLabel
                  value="assigned"
                  control={<Radio size="small" />}
                  label="Scheduled"
                  disabled={preForm.values.preStatus !== "assigned"}
                  className="mr-0"
                />
                {inqAssign?.schedule?.method === "on" && (
                  <FormControlLabel
                    value="contacted"
                    control={<Radio readOnly size="small" />}
                    label="Contacted"
                    disabled
                    className="mr-0"
                  />
                )}
                {inqAssign?.schedule?.method === "off" && (
                  <FormControlLabel
                    value="queued"
                    control={<Radio size="small" />}
                    label="Queued"
                    disabled={
                      preForm.values.preStatus === "rejected" ||
                      preForm.values.preStatus === "completed"
                    }
                    className="mr-0"
                  />
                )}
                <FormControlLabel
                  value="completed"
                  control={<Radio size="small" />}
                  label="Completed"
                  disabled={inqAssign?.status === "rejected"}
                  className="mr-0"
                />
                <FormControlLabel
                  value="not_responded"
                  control={<Radio readOnly size="small" />}
                  label="Not Responded / Unattended"
                  disabled
                  className="mr-0"
                />
                <FormControlLabel
                  value="rejected"
                  control={<Radio size="small" />}
                  label="Rejected"
                  disabled={inqAssign?.status === "completed"}
                  className="mr-0"
                />
              </RadioGroup>
            </FormControl>

            {/* ACTION BUTTONS */}
            <Box className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--mui-palette-divider)]">
              {inqAssign && inqAssign.schedule?.method === "on" && (
                <>
                  <Button
                    variant="contained"
                    className="!bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] !text-white !text-[13px] !font-bold !rounded-lg !normal-case shadow-none"
                    disabled={
                      (inqAssign.status !== "assigned" &&
                        preForm.values.preStatus !== "contacted") ||
                      !isWithinSchedule(inqAssign) ||
                      preForm.values.preStatus === "completed" ||
                      preForm.values.preStatus === "rejected"
                    }
                    onClick={() => updateAssignmentStatus("not_responded")}
                    startIcon={
                      <i className="ri-user-unfollow-line text-base" />
                    }
                  >
                    Not Responded
                  </Button>

                  <Button
                    variant="contained"
                    className="!bg-green-500 hover:!bg-green-600 !text-white !text-[13px] !font-bold !rounded-lg !normal-case shadow-none"
                    disabled={
                      (inqAssign.status !== "assigned" &&
                        preForm.values.preStatus !== "not_responded") ||
                      !isWithinSchedule(inqAssign) ||
                      preForm.values.preStatus === "completed" ||
                      preForm.values.preStatus === "rejected"
                    }
                    onClick={() => updateAssignmentStatus("contacted")}
                    startIcon={<i className="ri-phone-line text-base" />}
                  >
                    Call
                  </Button>
                </>
              )}

              {inqAssign && inqAssign.schedule?.method === "off" && (
                <Button
                  variant="contained"
                  className="!bg-orange-400 hover:!bg-orange-500 !text-white !text-[13px] !font-bold !rounded-lg !normal-case shadow-none w-full md:w-auto px-6 py-2"
                  disabled={
                    !(
                      inqAssign.status === "assigned" &&
                      isWithinSchedule(inqAssign)
                    ) ||
                    preForm.values.preStatus === "queued" ||
                    preForm.values.preStatus === "completed" ||
                    preForm.values.preStatus === "rejected"
                  }
                  onClick={() => updateAssignmentStatus("queued")}
                  startIcon={<i className="ri-group-line text-base" />}
                >
                  Queue
                </Button>
              )}

              {preForm?.values?.preStatus === "queued" && (
                <Button
                  variant="contained"
                  type="button"
                  className="!bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] !text-white !text-[13px] !font-bold !rounded-lg !normal-case shadow-none w-full md:w-auto px-6 py-2"
                  disabled={isPreLocked}
                  onClick={() => updateAssignmentStatus("not_responded")}
                  startIcon={<i className="ri-user-unfollow-line text-base" />}
                >
                  Absent
                </Button>
              )}
            </Box>
          </Box>

          {/* ---------------- CONDITIONAL FORM DETAILS ---------------- */}
          {["completed", "rejected", "queued"].includes(
            preForm?.values?.preStatus,
          ) && (
            <Stack spacing={3} className="pt-2">
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography className="text-xs font-semibold text-[var(--mui-palette-text-primary)] mb-2">
                    Additional Details of Candidate
                  </Typography>
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    name="additionalDetails"
                    value={preForm.values.additionalDetails}
                    onChange={preForm.handleChange}
                    onBlur={preForm.handleBlur}
                    error={
                      preForm.submitCount > 0 &&
                      Boolean(preForm.errors.additionalDetails)
                    }
                    helperText={
                      preForm.submitCount > 0
                        ? (preForm.errors.additionalDetails as string)
                        : undefined
                    }
                    slotProps={{
                      input: {
                        className:
                          "text-sm rounded-xl bg-[var(--mui-palette-background-default)]",
                      },
                    }}
                    disabled={isPreLocked}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography className="text-xs font-semibold text-[var(--mui-palette-text-primary)] mb-2">
                    Specific Notes (During Pre-Counselling)
                  </Typography>
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    name="specificNotes"
                    value={preForm.values.specificNotes}
                    onChange={preForm.handleChange}
                    onBlur={preForm.handleBlur}
                    slotProps={{
                      input: {
                        className:
                          "text-sm rounded-xl bg-[var(--mui-palette-background-default)]",
                      },
                    }}
                    disabled={isPreLocked}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography className="text-xs font-semibold text-[var(--mui-palette-text-primary)] mb-2">
                    Advice
                  </Typography>
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    name="advice"
                    value={preForm.values.advice}
                    onChange={preForm.handleChange}
                    onBlur={preForm.handleBlur}
                    slotProps={{
                      input: {
                        className:
                          "text-sm rounded-xl bg-[var(--mui-palette-background-default)]",
                      },
                    }}
                    disabled={isPreLocked}
                  />
                </Grid>

                {/* Resume Upload Box */}
                <Grid size={{ xs: 12, md: 6 }} id="resumeFile">
                  <Typography className="text-xs font-semibold text-[var(--mui-palette-text-primary)] mb-2">
                    Upload Resume
                  </Typography>
                  <Box
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={` shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all h-[200px] ${
                      isDragging
                        ? "border-[var(--mui-palette-primary-main)] bg-[var(--mui-palette-primary-lightOpacity)]"
                        : "border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-default)] hover:bg-[var(--mui-palette-action-hover)] hover:border-[var(--mui-palette-primary-main)]"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      hidden
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={onFileInputChange}
                      disabled={isPreLocked}
                    />
                    <Box className="w-12 h-12 rounded-2xl bg-[var(--mui-palette-primary-lightOpacity)] flex items-center justify-center text-[var(--mui-palette-primary-main)] mb-3">
                      <i className="ri-upload-cloud-2-line text-2xl" />
                    </Box>
                    <Typography className="font-bold text-sm text-[var(--mui-palette-text-primary)]">
                      Drag & Drop Resume
                    </Typography>
                    <Typography className="text-xs text-[var(--mui-palette-text-secondary)] mt-1">
                      PDF, JPG, JPEG, PNG
                    </Typography>
                  </Box>
                </Grid>

                {/* Resume Preview */}
                {previewUrl && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography className="text-xs font-semibold text-[var(--mui-palette-text-primary)] mb-2">
                      Resume Preview
                    </Typography>
                    <Box
                      onClick={() => setIsPreviewOpen(true)}
                      className="border border-[var(--mui-palette-divider)] rounded-2xl h-[200px] bg-[var(--mui-palette-background-default)] overflow-hidden relative cursor-pointer group hover:border-[var(--mui-palette-primary-main)] transition-all shadow-sm"
                    >
                      {isPdf ? (
                        <Box className="w-full h-full pointer-events-none relative">
                          <iframe
                            src={previewUrl}
                            className="w-full h-full border-0"
                          />
                          <Box className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Box className="bg-[var(--mui-palette-background-paper)] text-[var(--mui-palette-primary-main)] px-3.5 py-2 rounded-xl shadow-md font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                              <i className="ri-eye-line text-sm" />
                              View Document
                            </Box>
                          </Box>
                        </Box>
                      ) : (
                        <Box className="w-full h-full flex items-center justify-center bg-[var(--mui-palette-background-paper)] relative">
                          <img
                            src={previewUrl}
                            alt="Resume Preview"
                            className="w-full h-full object-contain"
                          />
                          <Box className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Box className="bg-[var(--mui-palette-background-paper)] text-[var(--mui-palette-primary-main)] px-3.5 py-2 rounded-xl shadow-md font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                              <i className="ri-eye-line text-sm" />
                              View Image
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Submit Action */}
              <Box className="flex justify-end pt-4">
                <Button
                  variant="contained"
                  type="submit"
                  disabled={
                    isPreLocked || preForm?.values?.preStatus === "queued"
                  }
                  className="!bg-[var(--mui-palette-primary-main)] hover:!bg-[var(--mui-palette-primary-dark)] !text-white !text-[13px] !font-bold !rounded-xl !normal-case py-2.5 px-6 shadow-none"
                >
                  {preForm.isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Send As Prescription"
                  )}
                </Button>
              </Box>
            </Stack>
          )}
        </Stack>
      </form>

      {/* ---------------- FULLSCREEN PREVIEW DIALOG ---------------- */}
      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className:
            "rounded-3xl relative overflow-hidden bg-[var(--mui-palette-background-paper)]",
        }}
      >
        <Box className="flex items-center justify-between px-6 py-4 border-b border-[var(--mui-palette-divider)]">
          <Typography
            variant="subtitle1"
            className="font-bold text-[var(--mui-palette-text-primary)]"
          >
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
                  variant="outlined"
                  className="rounded-xl normal-case font-semibold text-xs"
                  startIcon={<i className="ri-download-2-line" />}
                >
                  Download
                </Button>
              </a>
            )}
            <IconButton
              size="small"
              onClick={() => setIsPreviewOpen(false)}
              className="text-[var(--mui-palette-text-secondary)]"
            >
              <i className="ri-close-line text-xl" />
            </IconButton>
          </Box>
        </Box>
        <DialogContent className="p-0 bg-[var(--mui-palette-background-default)] flex items-center justify-center min-h-[60vh]">
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
    </Card>
  );
};

export default PreCounsellingForm;

// import React, { useState, useRef, useEffect } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import toast from "react-hot-toast";
// import dayjs from "dayjs";
// import {
//   Box, Button, Card, CircularProgress, FormControl, FormControlLabel,
//   FormLabel, Grid, Radio, RadioGroup, Stack, TextField, Typography,
//   Dialog, DialogContent, IconButton
// } from "@mui/material";
// import { CamelCase, isWithinSchedule } from "@/Utils/common";
// import { updateAssignmentAction } from "@/Services/APIs/tac/tac.actions";
// import { confirmToast } from "@/Utils/confirmToast";

// interface PreCounsellingFormProps {
//   candidate: any;
//   inqAssign: any;
//   branchId: any;
//   consultantId: any;
//   source: any;
//   preferences: any;
//   candidatePhone: string;
// }

// const PreCounsellingForm: React.FC<PreCounsellingFormProps> = ({
//   candidate: c, inqAssign, branchId, consultantId, source, preferences, candidatePhone
// }) => {
//   const [resumeFile, setResumeFile] = useState<File | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   // const [enablePreSubmit, setEnablePreSubmit] = useState(false);
//   const [isPreLocked, setIsPreLocked] = useState(true);
//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [isPreviewOpen, setIsPreviewOpen] = useState(false);

//   const existingResume = inqAssign?.pre?.initialCV?.path;

//   useEffect(() => {
//     let objectUrl: string | null = null;
//     if (resumeFile) {
//       objectUrl = URL.createObjectURL(resumeFile);
//       setPreviewUrl(objectUrl);
//     } else {
//       setPreviewUrl(existingResume ?? null);
//     }

//     return () => {
//       if (objectUrl) {
//         URL.revokeObjectURL(objectUrl);
//       }
//     };
//   }, [resumeFile, existingResume]);

//   const isPdf = resumeFile
//     ? resumeFile.type === "application/pdf"
//     : existingResume?.toLowerCase().includes(".pdf") ?? false;

//   useEffect(() => {
//     if (inqAssign?.status === "completed" || inqAssign?.status === "rejected") {
//       setIsPreLocked(true);
//     } else if (inqAssign?.status === "queued" && (isWithinSchedule(inqAssign) && inqAssign?.schedule?.from != "" && inqAssign?.schedule?.to != "")) {
//       setIsPreLocked(false);
//     }
//   }, [inqAssign]);

//   const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
//   const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault(); setIsDragging(false);
//     if (e.dataTransfer.files?.length) {
//       const file = e.dataTransfer.files[0];
//       setResumeFile(file);
//       preForm.setFieldValue("resumeFile", file);
//     }
//   };
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files?.length) {
//       const file = e.target.files[0];
//       setResumeFile(file);
//       preForm.setFieldValue("resumeFile", file);
//     }
//   };
//   // console.log(c.token,6666);

//   const preForm = useFormik({
//     initialValues: {
//       preStatus: inqAssign?.status ?? "na",
//       additionalDetails: inqAssign?.pre?.additionalDetails ?? "",
//       specificNotes: inqAssign?.pre?.specificNotes ?? "",
//       advice: inqAssign?.pre?.advice ?? "",
//       resumeFile: null as File | null,
//     },
//     enableReinitialize: true,
//     validationSchema: Yup.object({
//       preStatus: Yup.string().trim().required("Status is required"),
//       additionalDetails: Yup.string().trim().required("Additional details are required"),
//       specificNotes: Yup.string().trim().optional(),
//       advice: Yup.string().trim().optional(),
//       resumeFile: Yup.mixed<File>().nullable().optional(),
//     }),
//     onSubmit: async (values, { setSubmitting }) => {
//       if (!inqAssign?._id) { toast.error("No pre-counselling assignment found"); setSubmitting(false); return; }
//       if (values.preStatus === "completed") {
//         const confirmed = await confirmToast(`Are you sure Pre-Counselling is Completed!`);
//         if (!confirmed) { setSubmitting(false); return; }
//       }
//       if (values.preStatus === "rejected") {
//         const confirmed = await confirmToast(`Are you sure Candidate is Rejected!`);
//         if (!confirmed) { setSubmitting(false); return; }
//       }

//       try {
//         const formData = new FormData();
//         formData.append("assignmentId", inqAssign._id);
//         formData.append("status", values.preStatus);
//         formData.append("additionalDetails", values.additionalDetails);
//         formData.append("specificNotes", values.specificNotes);
//         formData.append("advice", values.advice);
//         if (values.resumeFile) formData.append("resume", values.resumeFile);

//         const preResult = await updateAssignmentAction(formData);
//         if (preResult?.data?.data?.status === "completed" || preResult?.data?.data?.status === "rejected") {
//           setIsPreLocked(true);
//         }
//         toast.success("Status Updated and will be sent to Candidate via Email");
//       } catch (err: any) {
//         toast.error(err?.response?.data?.message ?? "Save failed");
//       } finally {
//         setSubmitting(false);
//       }
//     }
//   });

//   useEffect(() => {
//     if (preForm.submitCount > 0 && Object.keys(preForm.errors).length > 0) {
//       const firstErrorField = Object.keys(preForm.errors)[0];
//       const errorElement = document.getElementsByName(firstErrorField)[0] || document.getElementById(firstErrorField);
//       if (errorElement) {
//         errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
//         errorElement.focus();
//       }
//     }
//   }, [preForm.submitCount]);

//   const updateAssignmentStatus = async (status: string) => {
//     if (!inqAssign?._id) return;
//     const textStatus =
//       status === "contacted"
//         ? `Are you sure?\nYou contacted ${candidatePhone}`
//         : status === "not_responded"
//           ? `You contacted ${candidatePhone},\nbut the candidate did not respond?`
//           : "Are you sure you are available to talk with this candidate now?";
//     const confirmed = await confirmToast(textStatus);
//     if (!confirmed) return;
//     try {
//       const formData = new FormData();
//       formData.append("assignmentId", inqAssign._id);
//       formData.append("status", status);

//       await updateAssignmentAction(formData);
//       toast.success(`Status updated to ${CamelCase(status)}`);
//       console.log(status, 5844);

//       preForm.setValues({ ...preForm.values, preStatus: status });
//       if (status === "queued") setIsPreLocked(false);
//     } catch (err: any) {
//       console.log(err?.response?.data?.message ?? "Update failed");
//     }
//   };

//   return (
//     <Card className="p-6 rounded-xl   shadow-xl">
//       <form onSubmit={preForm.handleSubmit}>
//         <Typography className="text-[20px] font-bold text-center mb-5">Pre-Counselling</Typography>
//         <Stack spacing={3}>
//           <Grid container spacing={5}>
//             <Grid size={{ xs: 12 }}>
//               <FormControl>
//                 <FormLabel>Status</FormLabel>
//                 <RadioGroup row name="preStatus" value={preForm.values.preStatus} onChange={(e, value) => {
//                   // setEnablePreSubmit(((preForm.isSubmitting || isWithinSchedule(inqAssign)) && (value === "completed" || value === "rejected") && (inqAssign?.status !== "completed" && inqAssign?.status !== "rejected")));
//                   setIsPreLocked(!(preForm.isSubmitting || isWithinSchedule(inqAssign)) && (value === "completed" || value === "rejected" || value === "queued") && (inqAssign?.status !== "completed" && inqAssign?.status !== "rejected" && inqAssign?.status !== "queued"));
//                   return preForm.handleChange(e);
//                 }}>
//                   <FormControlLabel value="assigned" control={<Radio />} label="Scheduled" disabled={preForm.values.preStatus !== 'assigned'} />
//                   {inqAssign?.schedule?.method === "on" && <FormControlLabel value="contacted" control={<Radio readOnly />} label="Contacted" disabled />}
//                   {inqAssign?.schedule?.method === "off" && <FormControlLabel value="queued" control={<Radio />} label="Queued" disabled={preForm.values.preStatus === 'rejected' || preForm.values.preStatus === 'completed'} />}
//                   <FormControlLabel value="completed" control={<Radio />} label="Completed" disabled={inqAssign?.status === "rejected"} />
//                   <FormControlLabel value="not_responded" control={<Radio readOnly />} label="Not Responded / Unattended" disabled />
//                   <FormControlLabel value="rejected" control={<Radio />} label="Rejected" disabled={inqAssign?.status === "completed"} />
//                 </RadioGroup>
//               </FormControl>
//             </Grid>

//             <Grid size={{ xs: 12, md: 6 }}>
//               <FormControl>
//                 <FormLabel>Visit Method</FormLabel>
//                 <RadioGroup row value={inqAssign?.schedule?.method === "on" ? "remote" : "office"}>
//                   <FormControlLabel value="office" control={<Radio />} label="In-Office" disabled={inqAssign?.schedule?.method === "on"} />
//                   <FormControlLabel value="remote" control={<Radio />} label="Remote" disabled={inqAssign?.schedule?.method === "off"} />
//                 </RadioGroup>
//               </FormControl>
//             </Grid>

//             <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Branch" disabled value={branchId.title ?? "—"} /></Grid>
//             <Grid size={{ xs: 12, md: 6 }}>
//               <TextField fullWidth label="Assigned Consultant" disabled value={consultantId.firstName ? `${consultantId.firstName} ${consultantId.lastName ?? ""}`.trim() : "—"} />
//             </Grid>
//             <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Source" disabled value={CamelCase(source.type ?? "")} /></Grid>

//             {source.refType && <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Referred By (Type)" disabled value={CamelCase(source.refType ?? "")} /></Grid>}
//             {source.refName && <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Referred By (Name)" disabled value={source.refName} /></Grid>}
//             {preferences.visitType === "offline" && <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Token No" value={inqAssign?.token?.number ?? "—"} disabled /></Grid>}

//             <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Inquiry Created" disabled value={c.lastActivity ? dayjs(c.lastActivity).format("DD/MM/YYYY hh:mm A") : "—"} /></Grid>
//             <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Scheduled Date" disabled value={inqAssign?.schedule?.date ? dayjs(inqAssign.schedule.date).format("DD/MM/YYYY") : "—"} /></Grid>
//             <Grid size={{ xs: 12, md: 6 }}>
//               <TextField fullWidth label="Scheduled Time" disabled value={inqAssign?.schedule?.from ? inqAssign.schedule.from + (inqAssign.schedule.to ? " – " + inqAssign.schedule.to : "") : "—"} />
//             </Grid>

//             <Grid size={{ xs: 12 }}>
//               <Box className="flex justify-end gap-3">
//                 {inqAssign && inqAssign.schedule?.method === "on" && (
//                   <>
//                     <Button variant="contained" className="!bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={(inqAssign.status !== "assigned" && preForm.values.preStatus !== "contacted") || !isWithinSchedule(inqAssign) || preForm.values.preStatus === "completed" || preForm.values.preStatus === "rejected"} onClick={() => updateAssignmentStatus("not_responded")}>Not Responded</Button>
//                     <Button variant="contained" className="!bg-green-500 hover:!bg-green-600 !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={(inqAssign.status !== "assigned" && preForm.values.preStatus !== "not_responded") || !isWithinSchedule(inqAssign) || preForm.values.preStatus === "completed" || preForm.values.preStatus === "rejected"} onClick={() => updateAssignmentStatus("contacted")}>Call</Button>
//                   </>
//                 )}
//                 {inqAssign && inqAssign.schedule?.method === "off" && (
//                   <Button variant="contained" className="!bg-orange-400 hover:!bg-orange-500 !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={!(inqAssign.status === "assigned" && isWithinSchedule(inqAssign)) || preForm.values.preStatus === "queued" || preForm.values.preStatus === "completed" || preForm.values.preStatus === "rejected"} onClick={() => updateAssignmentStatus("queued")}>Queue</Button>
//                 )}
//                 {preForm?.values?.preStatus == "queued" && (
//                   <Button variant="contained" type="button" className="bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={isPreLocked || preForm.values.preStatus === "completed" || preForm.values.preStatus === "rejected"} onClick={() => updateAssignmentStatus("not_responded")}>Absent</Button>
//                 )}
//               </Box>
//             </Grid>

//             {(preForm?.values?.preStatus == "completed" || preForm?.values?.preStatus == "rejected" || preForm?.values?.preStatus == "queued") && (
//               <>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Typography className="text-[13px] font-semibold mb-1.5">Additional Details of Candidate</Typography>
//                   <TextField multiline rows={3} fullWidth name="additionalDetails" value={preForm.values.additionalDetails} onChange={preForm.handleChange} onBlur={preForm.handleBlur} error={preForm.submitCount > 0 && Boolean(preForm.errors.additionalDetails)} helperText={preForm.submitCount > 0 ? preForm.errors.additionalDetails as string : undefined} slotProps={{ input: { className: "text-[14px]" } }} disabled={isPreLocked} />
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Typography className="text-[13px] font-semibold mb-1.5">Specific Notes (During Pre-Counselling)</Typography>
//                   <TextField multiline rows={3} fullWidth name="specificNotes" value={preForm.values.specificNotes} onChange={preForm.handleChange} onBlur={preForm.handleBlur} slotProps={{ input: { className: "text-[14px]" } }} disabled={isPreLocked} />
//                 </Grid>
//                 <Grid size={{ xs: 12 }}>
//                   <Typography className="text-[13px] font-semibold mb-1.5">Advice</Typography>
//                   <TextField multiline rows={3} fullWidth name="advice" value={preForm.values.advice} onChange={preForm.handleChange} onBlur={preForm.handleBlur} slotProps={{ input: { className: "text-[13px]" } }} disabled={isPreLocked} />
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 6 }} id="resumeFile">
//                   <Typography className="text-[12px] font-semibold mb-1.5">Upload Resume</Typography>
//                   <Box onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all h-[220px] ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-[--mui-palette-secondary-lightOpacity]"}`}>
//                     <input ref={fileInputRef} hidden type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} disabled={isPreLocked} />
//                     <i className="ri-upload-cloud-2-line text-4xl text-blue-500 mb-3" />
//                     <Typography className="font-semibold text-sm">Drag & Drop Resume</Typography>
//                     <Typography className="text-xs text-gray-500 mt-1">PDF, JPG, JPEG, PNG</Typography>
//                   </Box>
//                 </Grid>
//                 {previewUrl && (
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     <Typography className="text-[12px] font-semibold mb-1.5">Resume Preview</Typography>
//                     <Box
//                       onClick={() => setIsPreviewOpen(true)}
//                       className="border rounded-xl h-[220px] bg-gray-50 overflow-hidden relative cursor-pointer group hover:border-blue-500 transition-all"
//                     >
//                       {isPdf ? (
//                         <Box className="w-full h-full pointer-events-none relative">
//                           <iframe src={previewUrl} className="w-full h-full border-0" />
//                           <Box className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-colors flex items-center justify-center">
//                             <Box className="bg-white/90 text-blue-600 px-3 py-1.5 rounded-lg shadow-sm font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
//                               Click to view document
//                             </Box>
//                           </Box>
//                         </Box>
//                       ) : (
//                         <Box className="w-full h-full flex items-center justify-center bg-white relative">
//                           <img src={previewUrl} alt="Resume Preview" className="w-full h-full object-contain" />
//                           <Box className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-colors flex items-center justify-center">
//                             <Box className="bg-white/90 text-blue-600 px-3 py-1.5 rounded-lg shadow-sm font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
//                               Click to view image
//                             </Box>
//                           </Box>
//                         </Box>
//                       )}
//                     </Box>
//                   </Grid>
//                 )}
//               </>
//             )}
//           </Grid>
//           {(preForm?.values?.preStatus == "completed" || preForm?.values?.preStatus == "rejected" || preForm?.values?.preStatus == "queued") && (
//             <Box className="flex justify-end gap-3 mt-4 pt-6">
//               <Button variant="contained" type="submit" disabled={isPreLocked || preForm?.values?.preStatus === "queued"} className="!bg-blue-500 hover:!bg-blue-600 !text-white !text-[13px] !font-bold !rounded-lg !normal-case">
//                 {preForm.isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Send As Prescription"}
//               </Button>
//             </Box>
//           )}
//         </Stack>
//       </form>

//       {/* Resume Fullscreen Preview Dialog */}
//       <Dialog
//         open={isPreviewOpen}
//         onClose={() => setIsPreviewOpen(false)}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{ className: "rounded-[20px] relative overflow-hidden" }}
//       >
//         <Box className="flex items-center justify-between px-5 py-3 border-b border-[var(--mui-palette-divider)]">
//           <Typography variant="subtitle1" className="font-bold">
//             Resume Preview
//           </Typography>
//           <Box className="flex items-center gap-2">
//             {previewUrl && (
//               <a href={previewUrl} download="Resume" target="_blank" rel="noreferrer">
//                 <Button size="small" variant="text" startIcon={<i className="ri-download-2-line" />}>
//                   Download
//                 </Button>
//               </a>
//             )}
//             <IconButton size="small" onClick={() => setIsPreviewOpen(false)}>
//               <i className="ri-close-line text-xl" />
//             </IconButton>
//           </Box>
//         </Box>
//         <DialogContent className="p-0 bg-gray-50 flex items-center justify-center min-h-[60vh]">
//           {previewUrl && isPdf ? (
//             <iframe
//               src={previewUrl}
//               title="Resume PDF Preview"
//               className="w-full min-h-[75vh] border-0"
//             />
//           ) : (
//             previewUrl && (
//               <img
//                 src={previewUrl}
//                 alt="Resume Image Preview"
//                 className="max-w-full max-h-[75vh] object-contain p-4"
//               />
//             )
//           )}
//         </DialogContent>
//       </Dialog>
//     </Card>
//   );
// };

// export default PreCounsellingForm;
