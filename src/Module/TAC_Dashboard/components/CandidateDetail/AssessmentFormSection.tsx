import React from "react";
import { Box, Button, Card, FormControl, FormControlLabel, FormLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import { isWithinSchedule } from "@/Utils/common";
import CandidateDocumentsSection from "./CandidateDocumentsSection";
import AssessmentForm from "../AssessmentForm/AssessmentForm";
import { useAssessmentFormSection } from "./useAssessmentFormSection";
import { ExpType } from "@/Types/object.types";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";
import { IAssignment } from "@/lib/models/Assignment.model";

interface AssessmentFormSectionProps { candidate: CandidateLead; assessAssign: IAssignment; isFoe: boolean; branchTitle: string; }// setCurrentView: (view: "dashboard" | "detail") => void; 

const AssessmentFormSection: React.FC<AssessmentFormSectionProps> = ({ candidate, assessAssign, isFoe, branchTitle }) => {
  const { assessBasicForm, isPreLocked, setIsPreLocked, docStatus, setDocStatus, expStatus, setExpStatus, expType, setExpType, techStatus, setTechStatus, classifyExp, setClassifyExp, showRejectBox, setShowRejectBox, remarksText, setRemarksText, docReject, docVerify, docRequestTL, expRFT, expVerified, expRequestTech, showAssessmentForm, updateAssignmentStatus, handleSaveAll, updateDocumentStatus, updateExpStatus, canCall, canMarkNotResponded } = useAssessmentFormSection(candidate, assessAssign);

  return (
    <Card className="p-6 rounded-xl shadow-xl mt-4">
      <Typography className="text-[24px] text-center font-semibold mb-5 text-[var(--mui-palette-text-primary)]">Assessment</Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <FormControl>
            <FormLabel className="font-semibold text-[var(--mui-palette-text-primary)]">Assessment Status</FormLabel>
            <RadioGroup row name="status" value={assessBasicForm.values.status} onChange={(e, value) => {
              setIsPreLocked(!(assessBasicForm.isSubmitting || isWithinSchedule(assessAssign)) && (value === "completed" || value === "rejected" || value === "queued") && assessAssign?.status !== "completed" && assessAssign?.status !== "rejected" && assessAssign?.status !== "queued");
              return assessBasicForm.handleChange(e);
            }}>
              <FormControlLabel value="assigned" control={<Radio />} label="Scheduled" disabled={assessBasicForm.values.status !== "assigned"} />
              {assessAssign?.schedule?.method === "on" && <FormControlLabel value="contacted" control={<Radio readOnly />} label="Contacted" disabled />}
              {assessAssign?.schedule?.method === "off" && <FormControlLabel value="queued" control={<Radio />} label="Queued" />}
              <FormControlLabel value="completed" control={<Radio />} label="Completed" disabled={assessAssign?.status === "rejected"} />
              <FormControlLabel value="not_responded" control={<Radio readOnly />} label="Not Responded / Unattended" disabled />
              <FormControlLabel value="rejected" control={<Radio />} label="Rejected" disabled={assessAssign?.status === "completed"} />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}><FormControl><FormLabel className="font-semibold text-[var(--mui-palette-text-primary)]">Visit Option</FormLabel><RadioGroup row value={assessAssign?.schedule?.method === "on" ? "remote" : "office"}><FormControlLabel value="office" control={<Radio />} label="In-Office" disabled={assessAssign?.schedule?.method === "on"} /><FormControlLabel value="remote" control={<Radio />} label="Remote" disabled={assessAssign?.schedule?.method === "off"} /></RadioGroup></FormControl></Grid>
        <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Branch" disabled value={branchTitle} /></Grid>
        {assessAssign?.schedule.method === "off" && <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Token No" disabled value={assessAssign?.token?.number || "—"} /></Grid>}
        <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Scheduled Date" disabled value={assessAssign?.schedule?.date ? dayjs(assessAssign.schedule.date).format("DD/MM/YYYY") : "—"} /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Scheduled Time" disabled value={assessAssign?.schedule?.from ? assessAssign.schedule.from + (assessAssign.schedule.to ? " – " + assessAssign.schedule.to : "") : "—"} /></Grid>
        <Grid size={{ xs: 12 }}>
          <Box className="flex justify-center md:justify-end gap-3 mt-2">
            {assessAssign && assessAssign.schedule?.method === "on" && (
              <><Button variant="contained" className="!bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={!canMarkNotResponded} onClick={() => updateAssignmentStatus("not_responded")}>Not Responded</Button><Button variant="contained" className="!bg-green-500 hover:!bg-green-600 !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={!canCall} onClick={() => updateAssignmentStatus("contacted")}>Call</Button></>
            )}
            {assessAssign && assessAssign.schedule?.method === "off" && (
              <Button variant="contained" className="!bg-orange-400 hover:!bg-orange-500 !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={!(assessAssign.status === "assigned" && isWithinSchedule(assessAssign)) || assessBasicForm.values.status === "queued" || assessBasicForm.values.status === "completed" || assessBasicForm.values.status === "rejected"} onClick={() => updateAssignmentStatus("queued")}>Queue</Button>
            )}
            {assessBasicForm?.values?.status == "queued" && (
              <Button variant="contained" type="button" className="bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={isPreLocked} onClick={() => updateAssignmentStatus("not_responded")}>Absent</Button>
            )}
          </Box>
        </Grid>
      </Grid>
      {assessBasicForm?.values?.status === "queued" || assessBasicForm?.values?.status === "completed" || assessBasicForm?.values?.status === "rejected" || docStatus !== "uploaded" ? (
        <>
          <Box className="shadow-2xl rounded-xl p-5 mt-6 bg-[var(--mui-palette-primary)]">
            <Typography className="mb-4 font-bold text-[15px] text-[var(--mui-palette-text-primary)]">Documents Verification</Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Position Applied" disabled value={
                typeof candidate?.documents?.position === "string"
                  ? candidate.documents.position
                  : candidate?.documents?.position?.title || ""
              } /></Grid>
              <Grid size={{ xs: 12 }}><CandidateDocumentsSection candidate={candidate} /></Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" className="mb-2 font-medium text-[var(--mui-palette-text-primary)]">Verification Status</Typography>
                <RadioGroup row value={docStatus} onChange={(e) => setDocStatus(e.target.value)}>
                  <FormControlLabel value="uploaded" control={<Radio disabled />} label="Uploaded" />
                  <FormControlLabel value="verified" control={<Radio disabled />} label="Verified" />
                  <FormControlLabel value="rejected" control={<Radio disabled />} label="Rejected" />
                </RadioGroup>
                {candidate?.status === "doc_awaiting_approval" && (
                  <Typography variant="caption" className="block mt-2 text-[--mui-palette-warning-main] font-medium">Documents have been reviewed and are currently awaiting approval from the Team Leader (TL).</Typography>
                )}
              </Grid>
            </Grid>
            <Box className="flex justify-center md:justify-end gap-3 mt-2">
              <Button variant="contained" className="!bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] !text-[13px] !font-bold !rounded-lg !normal-case" disabled={isPreLocked || !docReject} onClick={() => setShowRejectBox(!showRejectBox)}>Reject</Button>
              <Button variant="contained" className="!bg-green-500 hover:!bg-green-600 !text-[13px] !font-bold !rounded-lg !normal-case" disabled={isPreLocked || !docVerify} onClick={() => updateDocumentStatus(`verified`)}>Verify</Button>
              <Button variant="contained" className="!bg-[--mui-palette-warning-main] hover:!bg-[--mui-palette-warning-dark] !text-[13px] !font-bold !rounded-lg !normal-case" disabled={isPreLocked || !docRequestTL} onClick={() => updateDocumentStatus(`awaiting_approval`)}>Request TL</Button>
            </Box>
            {showRejectBox && (
              <Box className="mt-4 p-4 rounded-xl shadow-inner transition-all">
                <TextField fullWidth multiline rows={3} label="Specify Rejection Reason *" placeholder="Type here why you are rejecting these documents (e.g., Invalid ID, blurry image)..." value={remarksText} onChange={(e) => setRemarksText(e.target.value)} className="mb-3" slotProps={{ input: { className: "text-[14px]" } }} />
                <Box className="flex justify-end gap-2">
                  <Button variant="contained" size="small" onClick={() => { setShowRejectBox(false); setRemarksText(""); }}>Cancel</Button>
                  <Button size="small" variant="contained" color="error" disabled={!remarksText.trim()} onClick={() => { updateDocumentStatus("rejected", remarksText); setShowRejectBox(false); setRemarksText(""); }} className="!rounded-lg !font-bold px-4 normal-case shadow-sm">Confirm Reject</Button>
                </Box>
              </Box>
            )}
          </Box>
          <Box className="shadow-2xl rounded-xl p-5 mt-4 bg-[var(--mui-palette-secondary)]">
            <Typography className="mb-2 font-bold text-[15px] text-[var(--mui-palette-text-primary)]">Experience</Typography>
            <RadioGroup row value={expStatus} onChange={(e: any) => setExpStatus(e.target.value)}>
              <FormControlLabel value="selected" control={<Radio disabled />} label="Selected" />
              <FormControlLabel value="verified" control={<Radio disabled />} label="Verified" />
              <FormControlLabel value="request_technical" control={<Radio disabled />} label="Technical Requested" />
            </RadioGroup>
            <FormControl fullWidth className="mt-4 md:w-1/2">
              <InputLabel>Experience Type</InputLabel>
              <Select value={expType} label="Experience Type" onChange={(e) => setExpType(e.target.value as ExpType)}>
                <MenuItem value="fresher">Fresher</MenuItem><MenuItem value="domestic">Domestic</MenuItem><MenuItem value="abroad">Abroad</MenuItem><MenuItem value="free">Freelance</MenuItem>
              </Select>
            </FormControl>
            <Box className="flex justify-end gap-3 mt-6 mb-2">
              <Button variant="contained" className="!rounded-xl !normal-case bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark]" disabled={isPreLocked || !expRFT} onClick={() => updateExpStatus(`request_technical`)}>Refer Technical</Button>
              <Button variant="contained" className="!bg-green-500 hover:!bg-green-600 !text-[13px] !font-bold !rounded-lg !normal-case" disabled={isPreLocked || !expVerified} onClick={() => updateExpStatus(`verified`)}>Verify</Button>
            </Box>
          </Box>
          {expRequestTech && (
            <Box className="shadow-2xl rounded-xl p-5 mt-4 bg-[var(--mui-palette-primary)]">
              <Typography className="mb-2 font-bold text-[15px] text-[var(--mui-palette-text-primary)]">Technical Round</Typography>
              <RadioGroup row value={techStatus} onChange={(e) => setTechStatus(e.target.value)}>
                <FormControlLabel value="refered" control={<Radio disabled={isFoe} />} label="Referred" />
                <FormControlLabel value="passed" control={<Radio disabled={isFoe} />} label="Passed" />
                <FormControlLabel value="failed" control={<Radio disabled={isFoe} />} label="Failed" />
              </RadioGroup>
              <FormControl fullWidth className="mt-4 md:w-1/2">
                <InputLabel>Classify Experience</InputLabel>
                <Select value={classifyExp} onChange={(e) => setClassifyExp(e.target.value)} label="Classify Experience" disabled>
                  <MenuItem value="fresher">Fresher</MenuItem><MenuItem value="domestic">Domestic</MenuItem><MenuItem value="abroad">Abroad</MenuItem><MenuItem value="free">Freelance</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          {!isFoe && !showAssessmentForm && assessBasicForm.values.status === "rejected" && (
            <Box className="flex justify-end mt-6">
              <Button variant="contained" onClick={handleSaveAll} className="bg-[--mui-palette-error-main] !text-white !rounded-xl !px-10 !py-2.5 !normal-case shadow-md" disabled={isPreLocked}>Reject</Button>
            </Box>
          )}
        </>
      ) : null}
      {showAssessmentForm && <AssessmentForm selectedCandidate={candidate} assessAssign={assessAssign} assessBasicForm={assessBasicForm} />}
    </Card>
  );
};
export default AssessmentFormSection;