import React from "react";
import {
  Box,
  Button,
  Card,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
  Avatar,
  Chip
} from "@mui/material";
import dayjs from "dayjs";
import { CamelCase, isWithinSchedule } from "@/Utils/common";
import CandidateDocumentsSection from "./CandidateDocumentsSection";
import AssessmentForm from "../AssessmentForm/AssessmentForm";
import { useAssessmentFormSection } from "./useAssessmentFormSection";
import { ExpType } from "@/Types/object.types";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";
import { IAssignment } from "@/lib/models/Assignment.model";

interface AssessmentFormSectionProps {
  candidate: CandidateLead;
  assessAssign: IAssignment;
  isFoe: boolean;
  branchTitle: string;
}

const AssessmentFormSection: React.FC<AssessmentFormSectionProps> = ({
  candidate,
  assessAssign,
  isFoe,
  branchTitle
}) => {
  const {
    assessBasicForm,
    isPreLocked,
    setIsPreLocked,
    docStatus,
    setDocStatus,
    expStatus,
    setExpStatus,
    expType,
    setExpType,
    techStatus,
    setTechStatus,
    classifyExp,
    setClassifyExp,
    showRejectBox,
    setShowRejectBox,
    remarksText,
    setRemarksText,
    docReject,
    docVerify,
    docRequestTL,
    expRFT,
    expVerified,
    expRequestTech,
    showAssessmentForm,
    updateAssignmentStatus,
    handleSaveAll,
    updateDocumentStatus,
    updateExpStatus,
    canCall,
    canMarkNotResponded
  } = useAssessmentFormSection(candidate, assessAssign);
 
  const consultantId = assessAssign?.assignedTo as any;
  const consultantFullName = consultantId?.firstName
    ? `${consultantId.firstName} ${consultantId.lastName ?? ""}`.trim()
    : "Unassigned";

  const consultantProfilePic =
    typeof consultantId?.profilePic === "object" && consultantId?.profilePic !== null
      ? (consultantId.profilePic as any).path
      : typeof consultantId?.profilePic === "string"
        ? consultantId.profilePic
        : undefined;

  const consultantRating = Number(consultantId?.tacProfile?.rating) || 0;

  const scheduledDateObj = assessAssign?.schedule?.date
    ? dayjs(assessAssign.schedule.date)
    : null;
  const formattedDate = scheduledDateObj
    ? scheduledDateObj.format("DD MMM YYYY")
    : "—";
  const formattedDay = scheduledDateObj ? scheduledDateObj.format("dddd") : "";

  const formattedTimeSlot = assessAssign?.schedule?.from
    ? `${assessAssign.schedule.from} ${assessAssign.schedule.to ? "– " + assessAssign.schedule.to : ""}`
    : "—";

  const visitMethodLabel =
    assessAssign?.schedule?.method === "on" ? "Remote" : "In-Office";
  const visitMethodSub =
    assessAssign?.schedule?.method === "on" ? "Online Session" : "At Branch";

  const source = candidate?.source;

  const rawStatus = assessBasicForm.values.status || assessAssign?.status || "assigned";

  const statusDisplayMap: Record<string, { label: string; colorClass: string }> = {
    assigned: { label: "Scheduled", colorClass: " text-lg text-blue-500 " },
    contacted: { label: "Contacted", colorClass: "bg-amber-50 text-amber-700  " },
    queued: { label: "Queued", colorClass: "bg-purple-50 text-purple-700  " },
    completed: { label: "Completed", colorClass: "bg-green-500 text-white " },
    not_responded: { label: "Unattended", colorClass: "bg-rose-50 text-rose-700  " },
    rejected: { label: "Rejected", colorClass: "bg-gray-100 text-gray-700  " },
  };

  const currentStatusInfo = statusDisplayMap[rawStatus] || {
    label: CamelCase(rawStatus),
    colorClass: "  text-blue-700  ",
  };

  return (
    <Card className="p-5 md:p-8 rounded-3xl shadow-xl bg-[var(--mui-palette-background-paper)] mt-4">
      {/* ---------------- HEADER SECTION ---------------- */}
      <Box className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <Box className="flex items-center gap-3">
          <Box className="w-12 h-12 rounded-2xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 shadow-lg">
            <i className="ri-task-line text-2xl" />
          </Box>
          <Box>
            <Typography className="text-[18px] font-medium leading-tight">
              Assessment Details
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
 
      <Grid container spacing={3}>
      
        <Grid size={{ xs: 12, md: 4.5, lg: 4 }}>
          <Box className="h-full bg-[var(--mui-palette-background-default)] rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl gap-5">
            <Box className="w-full flex items-center justify-center">
              <Box className="bg-[var(--mui-palette-background-paper)] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm shrink-0">
                <i className="ri-calendar-todo-line text-[var(--mui-palette-primary-main)] text-sm shrink-0" />
                <Typography className="text-[12px] font-semibold text-[var(--mui-palette-warning-dark)] whitespace-nowrap">
                  Assigned Consultant
                </Typography>
              </Box>
            </Box>

            <Box className="relative my-1">
              <Avatar
                src={consultantProfilePic}
                alt={consultantFullName}
                className="w-24 h-24 border-4 border-[var(--mui-palette-background-paper)] shadow-xl mx-auto text-2xl !bg-[var(--mui-palette-primary-main)] font-bold text-white"
              >
                {consultantFullName.charAt(0)}
              </Avatar>
            </Box>

            <Box className="flex flex-col items-center gap-2 w-full">
              <Typography variant="h6" className="font-medium tracking-wide text-[var(--mui-palette-primary-main)] leading-snug truncate max-w-full">
                {consultantFullName}
              </Typography>

              {/* Rating Section */}
              <Box className="flex items-center justify-center gap-1 text-sm min-h-[22px]">
                {consultantRating > 0 ? (
                  <>
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                      const isFilled = starIndex <= Math.round(consultantRating);
                      return (
                        <i
                          key={starIndex}
                          className={
                            isFilled
                              ? "ri-star-fill text-amber-400"
                              : "ri-star-line text-gray-300 dark:text-gray-600"
                          }
                        />
                      );
                    })}
                    <Typography className="text-xs font-semibold text-[var(--mui-palette-text-secondary)] ml-1">
                      {consultantRating.toFixed(1)}
                    </Typography>
                  </>
                ) : (
                  <Box className="flex items-center gap-1 text-gray-400">
                    <i className="ri-star-line text-sm" />
                    <Typography className="text-xs font-medium text-[var(--mui-palette-text-secondary)]">
                      Not Rated
                    </Typography>
                  </Box>
                )}
              </Box>

              <Chip
                label="Certified Assessor"
                size="small"
                className="mt-1 bg-[var(--mui-palette-background-paper)] border border-[var(--mui-palette-divider)] text-[var(--mui-palette-text-primary)] font-medium text-[11px] shadow-sm"
              />
            </Box>
          </Box>
        </Grid>

         
        <Grid size={{ xs: 12, md: 7.5, lg: 8 }}>
          <Grid container spacing={2}>
          
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

         
            <Grid size={{ xs: 12 }} className="flex">
              <Box className="bg-[var(--mui-palette-background-default)] shadow-xl rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-colors w-full h-full">
                <Box className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 text-lg bg-[var(--mui-palette-primary-lightOpacity)]">
                  <i className="ri-time-line" />
                </Box>
                <Box className="min-w-0 flex-1">
                  <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] uppercase tracking-wider">
                    Scheduled Time
                  </Typography>
                  <Typography className="text-[14px] font-normal tracking-wide text-[var(--mui-palette-text-primary)] leading-snug mt-0.5 whitespace-normal break-words">
                    {formattedTimeSlot}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            
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
                    {branchTitle}
                  </Typography>
                </Box>
              </Box>
            </Grid>

    
            <Grid size={{ xs: 12, sm: 6 }} className="flex">
              <Box className="bg-[var(--mui-palette-background-default)] shadow-xl rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-colors w-full h-full">
                <Box className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 text-lg bg-[var(--mui-palette-primary-lightOpacity)]">
                  <i className="ri-map-pin-line" />
                </Box>
                <Box className="min-w-0 flex-1">
                  <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] uppercase tracking-wider">
                    Visit option
                  </Typography>
                  <Typography className="text-[14px] font-normal tracking-wide text-[var(--mui-palette-text-primary)] leading-tight mt-0.5">
                    {visitMethodLabel} <span className="text-[12px] text-[var(--mui-palette-text-disabled)]">({visitMethodSub})</span>
                  </Typography>
                </Box>
              </Box>
            </Grid>

          

            
            {assessAssign?.schedule?.method === "off" ? (
              <Grid size={{ xs: 12, sm: 6 }} className="flex">
                <Box className="bg-[var(--mui-palette-background-default)] shadow-xl rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-colors w-full h-full">
                  <Box className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 text-lg bg-[var(--mui-palette-primary-lightOpacity)]">
                    <i className="ri-group-line" />
                  </Box>
                  <Box className="min-w-0 flex-1">
                    <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] uppercase tracking-wider">
                      Token No.
                    </Typography>
                    <Typography className="text-[14px] font-normal tracking-wide text-[var(--mui-palette-text-primary)] truncate leading-tight mt-0.5">
                      {assessAssign?.token?.number || "—"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ) : (
              <Grid size={{ xs: 12, sm: 6 }} className="flex">
                <Box className="bg-[var(--mui-palette-background-default)] shadow-xl rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-colors w-full h-full">
                  <Box className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--mui-palette-primary-main)] shrink-0 text-lg bg-[var(--mui-palette-primary-lightOpacity)]">
                    <i className="ri-price-tag-3-line" />
                  </Box>
                  <Box className="min-w-0 flex-1">
                    <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] uppercase tracking-wider">
                      Referred By
                    </Typography>
                    <Typography className="text-[14px] font-normal tracking-wide text-[var(--mui-palette-text-primary)] truncate leading-tight mt-0.5">
                      {CamelCase(source?.refType ?? "") || "—"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

    
      <Box className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 mt-6 shadow-2xl rounded-2xl bg-[var(--mui-palette-background-default)]">
        <FormControl>
          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-[var(--mui-palette-text-secondary)] mb-2">
            Update Status
          </FormLabel>
          <RadioGroup
            row
            name="status"
            value={assessBasicForm.values.status}
            onChange={(e, value) => {
              setIsPreLocked(
                !(assessBasicForm.isSubmitting || isWithinSchedule(assessAssign)) &&
                (value === "completed" || value === "rejected" || value === "queued") &&
                assessAssign?.status !== "completed" &&
                assessAssign?.status !== "rejected" &&
                assessAssign?.status !== "queued"
              );
              return assessBasicForm.handleChange(e);
            }}
            className="gap-x-4 gap-y-2"
          >
            <FormControlLabel value="assigned" control={<Radio size="small" />} label="Scheduled" disabled={assessBasicForm.values.status !== "assigned"} className="mr-0" />
            {assessAssign?.schedule?.method === "on" && (
              <FormControlLabel value="contacted" control={<Radio readOnly size="small" />} label="Contacted" disabled className="mr-0" />
            )}
            {assessAssign?.schedule?.method === "off" && (
              <FormControlLabel value="queued" control={<Radio size="small" />} label="Queued" className="mr-0" />
            )}
            <FormControlLabel value="completed" control={<Radio size="small" />} label="Completed" disabled={assessAssign?.status === "rejected"} className="mr-0" />
            <FormControlLabel value="not_responded" control={<Radio readOnly size="small" />} label="Not Responded / Unattended" disabled className="mr-0" />
            <FormControlLabel value="rejected" control={<Radio size="small" />} label="Rejected" disabled={assessAssign?.status === "completed"} className="mr-0" />
          </RadioGroup>
        </FormControl>

        <Box className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--mui-palette-divider)]">
          {assessAssign && assessAssign.schedule?.method === "on" && (
            <>
              <Button
                variant="contained"
                className="!bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] !text-white !text-[13px] !font-bold !rounded-lg !normal-case shadow-none"
                disabled={!canMarkNotResponded}
                onClick={() => updateAssignmentStatus("not_responded")}
                startIcon={<i className="ri-user-unfollow-line text-base" />}
              >
                Not Responded
              </Button>
              <Button
                variant="contained"
                className="!bg-green-500 hover:!bg-green-600 !text-white !text-[13px] !font-bold !rounded-lg !normal-case shadow-none"
                disabled={!canCall}
                onClick={() => updateAssignmentStatus("contacted")}
                startIcon={<i className="ri-phone-line text-base" />}
              >
                Call
              </Button>
            </>
          )}

          {assessAssign && assessAssign.schedule?.method === "off" && (
            <Button
              variant="contained"
              className="!bg-orange-400 hover:!bg-orange-500 !text-white !text-[13px] !font-bold !rounded-lg !normal-case shadow-none w-full md:w-auto px-6 py-2"
              disabled={
                !(assessAssign.status === "assigned" && isWithinSchedule(assessAssign)) ||
                assessBasicForm.values.status === "queued" ||
                assessBasicForm.values.status === "completed" ||
                assessBasicForm.values.status === "rejected"
              }
              onClick={() => updateAssignmentStatus("queued")}
              startIcon={<i className="ri-group-line text-base" />}
            >
              Queue
            </Button>
          )}

          {assessBasicForm?.values?.status === "queued" && (
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

 
      {(assessBasicForm?.values?.status === "queued" ||
        assessBasicForm?.values?.status === "completed" ||
        assessBasicForm?.values?.status === "rejected" ||
        docStatus !== "uploaded") && (
        <>
         
          <Box className="shadow-2xl rounded-2xl p-6 mt-6 bg-[var(--mui-palette-primary)]">
            <Typography className="mb-4 font-bold text-[15px] text-[var(--mui-palette-text-primary)]">
              Documents Verification
            </Typography>
      <Grid container spacing={2} className="mb-4">
              
              {/* 1. Inquiry Position */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box className="bg-[var(--mui-palette-background-default)] p-3.5 rounded-xl shadow-lg">
                  <Typography className="text-[11px] font-bold text-[var(--mui-palette-text-secondary)] uppercase tracking-wider mb-1">
                    Inquiry Position
                  </Typography>
                  <Typography className="text-sm font-medium text-[var(--mui-palette-text-primary)] break-words">
                    {typeof candidate?.inqForPosition === "string"
                      ? candidate.inqForPosition
                      : (candidate?.inqForPosition as any)?.title || "N/A"}
                  </Typography>
                </Box>
              </Grid>

              {/* 2. Offered Position */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Box className="bg-[var(--mui-palette-background-default)] p-3.5 rounded-xl shadow-xl ">
                  <Typography className="text-[11px] font-bold text-[var(--mui-palette-text-secondary)] uppercase tracking-wider mb-1">
                    Offered Position
                  </Typography>
                  <Typography className="text-sm font-medium text-[var(--mui-palette-text-primary)] break-words">
                    {typeof candidate?.offeredPosition === "string"
                      ? candidate.offeredPosition
                      : (candidate?.offeredPosition as any)?.title || "N/A"}
                  </Typography>
                </Box>
              </Grid>

              
             <Grid size={{ xs: 12 }}>
                <Box className="bg-[var(--mui-palette-background-default)] p-3.5 rounded-xl shadow-xl ">
                  <Typography className="text-[11px] font-bold text-[var(--mui-palette-text-secondary)] uppercase tracking-wider mb-1">
                    Position Applied (Docs)
                  </Typography>
                  <Typography className="text-sm font-medium text-[var(--mui-palette-text-primary)] break-words">
                    {typeof candidate?.documents?.position === "string"
                      ? candidate.documents.position
                      : candidate?.documents?.position?.title || "N/A"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CandidateDocumentsSection candidate={candidate} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" className="mb-2 font-medium text-[var(--mui-palette-text-primary)]">
                  Verification Status
                </Typography>
                <RadioGroup row value={docStatus} onChange={(e) => setDocStatus(e.target.value)}>
                  <FormControlLabel value="uploaded" control={<Radio disabled size="small" />} label="Uploaded" />
                  <FormControlLabel value="verified" control={<Radio disabled size="small" />} label="Verified" />
                  <FormControlLabel value="rejected" control={<Radio disabled size="small" />} label="Rejected" />
                </RadioGroup>
                {candidate?.status === "doc_awaiting_approval" && (
                  <Typography variant="caption" className="block mt-2 text-[--mui-palette-warning-main] font-medium">
                    Documents have been reviewed and are currently awaiting approval from the Team Leader (TL).
                  </Typography>
                )}
              </Grid>
            </Grid>

            <Box className="flex justify-center md:justify-end gap-3 mt-4">
              <Button
                variant="contained"
                className="!bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] !text-[13px] !font-bold !rounded-lg !normal-case shadow-none"
                disabled={isPreLocked || !docReject}
                onClick={() => setShowRejectBox(!showRejectBox)}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                className="!bg-green-500 hover:!bg-green-600 !text-[13px] !font-bold !rounded-lg !normal-case shadow-none"
                disabled={isPreLocked || !docVerify}
                onClick={() => updateDocumentStatus(`verified`)}
              >
                Verify
              </Button>
              <Button
                variant="contained"
                className="!bg-[--mui-palette-warning-main] hover:!bg-[--mui-palette-warning-dark] !text-[13px] !font-bold !rounded-lg !normal-case shadow-none"
                disabled={isPreLocked || !docRequestTL}
                onClick={() => updateDocumentStatus(`awaiting_approval`)}
              >
                Request TL
              </Button>
            </Box>

            {showRejectBox && (
              <Box className="mt-4 p-5 rounded-2xl shadow-inner transition-all bg-[var(--mui-palette-background-default)]">
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Specify Rejection Reason *"
                  placeholder="Type here why you are rejecting these documents (e.g., Invalid ID, blurry image)..."
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  className="mb-3"
                  slotProps={{ input: { className: "text-[14px] rounded-xl" } }}
                />
                <Box className="flex justify-end gap-2">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => { setShowRejectBox(false); setRemarksText(""); }}
                    className="!rounded-lg !font-bold normal-case shadow-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    disabled={!remarksText.trim()}
                    onClick={() => { updateDocumentStatus("rejected", remarksText); setShowRejectBox(false); setRemarksText(""); }}
                    className="!rounded-lg !font-bold px-4 normal-case shadow-none"
                  >
                    Confirm Reject
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          {/* EXPERIENCE SECTION */}
          <Box className="shadow-2xl rounded-2xl p-6 mt-4 bg-[var(--mui-palette-secondary)]">
            <Typography className="mb-2 font-bold text-[15px] text-[var(--mui-palette-text-primary)]">
              Experience Details
            </Typography>
            <RadioGroup row value={expStatus} onChange={(e: any) => setExpStatus(e.target.value)}>
              <FormControlLabel value="selected" control={<Radio disabled size="small" />} label="Selected" />
              <FormControlLabel value="verified" control={<Radio disabled size="small" />} label="Verified" />
              <FormControlLabel value="request_technical" control={<Radio disabled size="small" />} label="Technical Requested" />
            </RadioGroup>
            <FormControl fullWidth className="mt-4 md:w-1/2">
              <InputLabel>Experience Type</InputLabel>
              <Select
                value={expType}
                label="Experience Type"
                onChange={(e) => setExpType(e.target.value as ExpType)}
                className="rounded-xl"
              >
                <MenuItem value="fresher">Fresher</MenuItem>
                <MenuItem value="domestic">Domestic</MenuItem>
                <MenuItem value="abroad">Abroad</MenuItem>
                <MenuItem value="free">Freelance</MenuItem>
              </Select>
            </FormControl>
            <Box className="flex justify-end gap-3 mt-6 mb-2">
              <Button
                variant="contained"
                className="!rounded-lg !font-bold text-[13px] !normal-case bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] shadow-none"
                disabled={isPreLocked || !expRFT}
                onClick={() => updateExpStatus(`request_technical`)}
              >
                Refer Technical
              </Button>
              <Button
                variant="contained"
                className="!bg-green-500 hover:!bg-green-600 !text-[13px] !font-bold !rounded-lg !normal-case shadow-none"
                disabled={isPreLocked || !expVerified}
                onClick={() => updateExpStatus(`verified`)}
              >
                Verify
              </Button>
            </Box>
          </Box>

          {/* TECHNICAL ROUND */}
          {expRequestTech && (
            <Box className="shadow-2xl rounded-2xl p-6 mt-4 bg-[var(--mui-palette-primary)]">
              <Typography className="mb-2 font-bold text-[15px] text-[var(--mui-palette-text-primary)]">
                Technical Round
              </Typography>
              <RadioGroup row value={techStatus} onChange={(e) => setTechStatus(e.target.value)}>
                <FormControlLabel value="refered" control={<Radio disabled={isFoe} size="small" />} label="Referred" />
                <FormControlLabel value="passed" control={<Radio disabled={isFoe} size="small" />} label="Passed" />
                <FormControlLabel value="failed" control={<Radio disabled={isFoe} size="small" />} label="Failed" />
              </RadioGroup>
              <FormControl fullWidth className="mt-4 md:w-1/2">
                <InputLabel>Classify Experience</InputLabel>
                <Select
                  value={classifyExp}
                  onChange={(e) => setClassifyExp(e.target.value)}
                  label="Classify Experience"
                  disabled
                  className="rounded-xl"
                >
                  <MenuItem value="fresher">Fresher</MenuItem>
                  <MenuItem value="domestic">Domestic</MenuItem>
                  <MenuItem value="abroad">Abroad</MenuItem>
                  <MenuItem value="free">Freelance</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {/* BASE REJECT BUTTON */}
          {!isFoe && !showAssessmentForm && assessBasicForm.values.status === "rejected" && (
            <Box className="flex justify-end mt-6">
              <Button
                variant="contained"
                onClick={handleSaveAll}
                className="bg-[--mui-palette-error-main] hover:bg-[--mui-palette-error-dark] !text-white !rounded-xl !px-10 !py-2.5 !normal-case shadow-none font-bold"
                disabled={isPreLocked}
              >
                Reject Final
              </Button>
            </Box>
          )}
        </>
      )}

      {/* ---------------- FINAL ASSESSMENT FORM MODULE ---------------- */}
      {showAssessmentForm && (
        <Box className="mt-6">
          <AssessmentForm
            selectedCandidate={candidate}
            assessAssign={assessAssign}
            assessBasicForm={assessBasicForm}
          />
        </Box>
      )}
    </Card>
  );
};

export default AssessmentFormSection;