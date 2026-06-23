import React, { useState, useEffect } from "react";
import {
  Box, Button, Card, FormControl, FormControlLabel,
  FormLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup,
  Select, TextField, Typography,
} from "@mui/material";
import CandidateDocumentsSection from "./CandidateDocumentsSection";
import toast from "react-hot-toast";
import { CamelCase, isWithinSchedule } from "@/Utils/common";
import { useFormik } from "formik";
import * as Yup from "yup";
import { confirmToast } from "@/Utils/confirmToast";
import dayjs from "dayjs";
import { ExpType, updateAssignmentAssessAction, updateDocumentStatusAction, updateExpStatusAction } from "@/Services/APIs/tac/tac.actions";
import AssessmentForm from "../AssessmentForm/AssessmentForm";

interface AssessmentFormSectionProps {
  candidate: any;
  assessAssign: any;
  isFoe: boolean;
  branchTitle: string;
  setCurrentView: (view: "dashboard" | "detail") => void;
}

const AssessmentFormSection: React.FC<AssessmentFormSectionProps> = ({
  candidate,
  assessAssign,
  isFoe,
  branchTitle }) => {

  const docs = candidate?.documents || {};
  const exp = candidate?.experience || {};

  const [docStatus, setDocStatus] = useState(docs.status || "na");
  const [expStatus, setExpStatus] = useState<"selected" | "verified" | "request_technical">("selected");
  const [expType, setExpType] = useState<ExpType>(exp.type);
  const [isPreLocked, setIsPreLocked] = useState(true);
  const [docReject, setDocReject] = useState(false);
  const [docVerify, setDocVerify] = useState(false);
  const [docRequestTL, setDocRequestTL] = useState(false);
  const [expRFT, setExpRFT] = useState(false);
  const [expVerified, setExpVerified] = useState(false);

  //   const [techStatus, setTechStatus] = useState(tech.status || "na");
  //   const [classifyExp, setClassifyExp] = useState(tech.classify || "");


  const assessBasicForm = useFormik({
    initialValues: {
      status: assessAssign?.status ?? "na",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      status: Yup.string().trim().required("Status is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!assessAssign?._id) { toast.error("No pre-counselling assignment found"); setSubmitting(false); return; }
      if (values.status === "completed") {
        const confirmed = await confirmToast(`Are you sure Pre-Counselling is Completed!`);
        if (!confirmed) { setSubmitting(false); return; }
      }
      if (values.status === "rejected") {
        const confirmed = await confirmToast(`Are you sure Candidate is Rejected!`);
        if (!confirmed) { setSubmitting(false); return; }
      }

      try {
        const formData = new FormData();
        formData.append("assignmentId", assessAssign._id);
        formData.append("status", values.status);

        const assessResult = await updateAssignmentAssessAction(formData);
        if (assessResult?.data?.data?.status === "completed" || assessResult?.data?.data?.status === "rejected") {
          setIsPreLocked(true);
        }
        toast.success("Status Updated and will be sent to Candidate via Email");
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? "Save failed");
      } finally {
        setSubmitting(false);
      }
    },
  });
  // console.log(candidate?.documents?.position,7777);

  const updateAssignmentStatus = async (status: string) => {
    if (!assessAssign?._id) return;
    const textStatus =
      status === "contacted"
        ? `Are you sure?\nYou contacted ${candidate.contact?.phone ?? ""}`
        : status === "not_responded"
          ? `You contacted ${candidate.contact?.phone ?? ""},\nbut the candidate did not respond?`
          : "Are you sure you are available to talk with this candidate now?";
    const confirmed = await confirmToast(textStatus);
    if (!confirmed) return;
    try {
      const formData = new FormData();
      formData.append("assignmentId", assessAssign._id);
      formData.append("status", status);

      await updateAssignmentAssessAction(formData);
      toast.success(`Status updated to ${CamelCase(status)}`);
      assessBasicForm.setValues({ ...assessBasicForm.values, status: status });
      if (status === "queued") setIsPreLocked(false);
    } catch (err: any) {
      console.log(err?.response?.data?.message ?? "Update failed");
    }
  };

  useEffect(() => {
    setDocStatus(docs.status || "na");
    setExpStatus(exp.status);

    setExpType(exp.type);
    // setTechStatus(tech.status || "na");
    // setClassifyExp(tech.classify || "");
    if (assessAssign?.status === "completed" || assessAssign?.status === "rejected") {
      setIsPreLocked(true);
    } else if (assessAssign?.status === "queued" && (isWithinSchedule(assessAssign) && assessAssign?.schedule?.from != "" && assessAssign?.schedule?.to != "")) {
      setIsPreLocked(false);
    }
    if (candidate?.status === "doc_awaiting_approval") {
      setDocReject(false);
      setDocVerify(false);
      setDocRequestTL(false);

      setExpRFT(false);
      setExpVerified(false);
      setShowAssessmentForm(false);
    }
    else {
      setDocReject(docs?.status === "uploaded");
      setDocVerify(docs?.status === "uploaded");
      setDocRequestTL(docs?.status === "uploaded");

      setExpRFT(docs?.status === "verified");
      setExpVerified(docs?.status === "verified");
      setShowAssessmentForm(docs?.status === "verified" && exp?.status === "verified");
    }


  }, [assessAssign, candidate]);

  const handleSaveAll = () => {

    const payload = {
      assessment: { status, method: assessAssign?.schedule?.method },
      documents: { status: docStatus },
      experience: { status: expStatus, type: expType },
      //   technical: { status: techStatus, classify: classifyExp },
    };
    // console.log("Saving Assessment Data:", payload);
    toast.success("Assessment details saved successfully!");
  };

  // const updateDocumentStatus = async (status: 'verified' | 'rejected' | 'awaiting_approval') => {

  //   if (!assessAssign?._id) return;
  //   const textStatus =
  //     status === "verified"
  //       ? `Are you sure?\nYou verified these documents?`
  //       : status === "rejected"
  //         ? `Are you sure?\nYou rejecting these documents`
  //         : ``;
  //   const confirmed = await confirmToast(textStatus);
  //   if (!confirmed) return;
  //   try {
  //     const updatedLead = await updateDocumentStatusAction(assessAssign._id, status);
  //     toast.success(`Documents Marked as ${CamelCase(status)}`);
  //     if (updatedLead?.data?.data?.status === "doc_verified") {
  //       setExpRFT(true)
  //       setExpVerified(true)
  //       setDocRequestTL(true)

  //       setDocVerify(false)
  //       setDocReject(false)
  //     }
  //     else if (updatedLead?.data?.data?.status === "doc_rejected") {
  //       setExpRFT(false)
  //       setExpVerified(false)
  //       setDocRequestTL(false)

  //       setDocVerify(false)
  //       setDocReject(false)

  //     }
  //     else if (updatedLead?.data?.data?.status === "doc_awaiting_approval") {
  //       setExpRFT(false)
  //       setExpVerified(false)
  //       setDocRequestTL(false)

  //       setDocVerify(false)
  //       setDocReject(false)
  //     }

  //   } catch (err: any) {
  //     console.log(err?.response?.data?.message ?? "Update failed");
  //   }
  // }
  const updateDocumentStatus = async (
    status: "verified" | "rejected" | "awaiting_approval"
  ) => {
    if (!assessAssign?._id) return;

    const messages = {
      verified: "Are you sure?\nYou verified these documents.",
      rejected: "Are you sure?\nYou are rejecting these documents.",
      awaiting_approval: "Are you sure?\nSend these documents for approval?",
    };

    const confirmed = await confirmToast(messages[status]);
    if (!confirmed) return;

    try {
      const res = await updateDocumentStatusAction(
        assessAssign._id,
        status
      );

      const docStatus = res?.data?.data?.documents?.status;

      toast.success(`Documents marked as ${CamelCase(status)}`);

      // const isVerified = docStatus === "verified";

      // setExpRFT(isVerified);
      // setExpVerified(isVerified);
      // setDocRequestTL(!isVerified);

      // setDocVerify(false);
      // setDocReject(false);

      setDocReject(docStatus === "uploaded");
      setDocVerify(docStatus === "uploaded");
      setDocRequestTL(docStatus === "uploaded");

      setExpRFT(docStatus === "verified");
      setExpVerified(docStatus === "verified");

      setDocStatus(docStatus);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to update document status"
      );
    }
  };

  const updateExpStatus = async (status: 'verified' | 'rejected' | 'request_technical') => {

    if (!assessAssign?._id) return;
    const textStatus =
      status === "verified"
        ? `Are you sure?\nYou verified candidate experience.`
        : (status === "rejected"
          ? `Are you sure?\nYou rejecting candidate experience.`
          : status === "request_technical" ?
            `Are you sure?\nYou want technical round for this candidate.` : ``);

    const confirmed = await confirmToast(textStatus);
    if (!confirmed) return;
    try {
      const updatedEXPLead = await updateExpStatusAction(assessAssign._id, status, expType);
      toast.success(`Experience updated as ${CamelCase(status)} !`);
      if (updatedEXPLead?.data?.data?.experience?.status === 'verified') {
        setShowAssessmentForm(true);
      }
      else {
        setShowAssessmentForm(false);

      }
      setExpRFT(false);
      setExpVerified(false);

      // if (updatedEXPLead?.data?.data?.experience?.status !== 'request_technical') {
        setExpStatus(updatedEXPLead?.data?.data?.experience?.status)
      // }
      // console.log(updatedEXPLead?.data?.data?.experience?.type,15854);

      setExpType(updatedEXPLead?.data?.data?.experience?.type as ExpType)
    } catch (err: any) {
      console.log(err?.response?.data?.message ?? "Update failed");
    }
  }

  // Derived: show assessment form once the candidate is actively being assessed
  const [showAssessmentForm, setShowAssessmentForm] =
    useState(false);
  const currentStatus = assessBasicForm.values.status || assessAssign.status;
  const canAccess = isWithinSchedule(assessAssign);

  const isFinalStatus = ["completed", "rejected"].includes(currentStatus);

  const canCall =
    canAccess &&
    !isFinalStatus &&
    ["assigned", "not_responded"].includes(currentStatus);

  const canMarkNotResponded =
    canAccess &&
    !isFinalStatus &&
    currentStatus === "contacted";
  return (
    <Card className="p-6 rounded-xl  shadow-xl mt-4">
      <Typography className="text-[24px] text-center font-semibold mb-5 text-[var(--mui-palette-text-primary)]">
        Assessment
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <FormControl>
            <FormLabel className="font-semibold  text-[var(--mui-palette-text-primary)]">Assessment Status</FormLabel>
            <RadioGroup row name="status" value={assessBasicForm.values.status} onChange={(e, value) => {
              // setEnablePreSubmit(((preForm.isSubmitting || isWithinSchedule(inqAssign)) && (value === "completed" || value === "rejected") && (inqAssign?.status !== "completed" && inqAssign?.status !== "rejected")));
              setIsPreLocked(!(assessBasicForm.isSubmitting || isWithinSchedule(assessAssign)) && (value === "completed" || value === "rejected" || value === "queued") && (assessAssign?.status !== "completed" && assessAssign?.status !== "rejected" && assessAssign?.status !== "queued"));
              return assessBasicForm.handleChange(e);
            }}>
              <FormControlLabel value="assigned" control={<Radio />} label="Scheduled" disabled={assessBasicForm.values.status !== 'assigned'} />
              {assessAssign?.schedule?.method === "on" && <FormControlLabel value="contacted" control={<Radio readOnly />} label="Contacted" disabled />}
              {assessAssign?.schedule?.method === "off" && <FormControlLabel value="queued" control={<Radio />} label="Queued" />}
              <FormControlLabel value="completed" control={<Radio />} label="Completed" disabled={assessAssign?.status === "rejected"} />
              <FormControlLabel value="not_responded" control={<Radio readOnly />} label="Not Responded / Unattended" disabled />
              <FormControlLabel value="rejected" control={<Radio />} label="Rejected" disabled={assessAssign?.status === "completed"} />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl>
            <FormLabel className="font-semibold text-[var(--mui-palette-text-primary)]">Visit Option</FormLabel>
            <RadioGroup row value={assessAssign?.schedule?.method === "on" ? "remote" : "office"}>
              <FormControlLabel value="office" control={<Radio />} label="In-Office" disabled={assessAssign?.schedule?.method === "on"} />
              <FormControlLabel value="remote" control={<Radio />} label="Remote" disabled={assessAssign?.schedule?.method === "off"} />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="Branch" disabled value={branchTitle} />
        </Grid>
        {assessAssign?.schedule.method === "off" &&
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Token No" disabled value={assessAssign?.token?.number || "—"} />
          </Grid>
        }
        <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Scheduled Date" disabled value={assessAssign?.schedule?.date ? dayjs(assessAssign.schedule.date).format("DD/MM/YYYY") : "—"} /></Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="Scheduled Time" disabled value={assessAssign?.schedule?.from ? assessAssign.schedule.from + (assessAssign.schedule.to ? " – " + assessAssign.schedule.to : "") : "—"} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Box className="flex justify-center md:justify-end gap-3 mt-2">
            {/* <Button variant="contained" disabled={status === "done"} className="!bg-blue-300 hover:!bg-blue-400 !text-white !rounded-lg !normal-case">
              Call for Assessment
            </Button>
            <Button variant="contained" disabled={status === "done"} className=" hover:!bg-blue-600 !rounded-lg !normal-case">
              Queue for Assessment
            </Button> */}
            {assessAssign && assessAssign.schedule?.method === "on" && (
              <>
                <Button variant="contained" className="!bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={!canMarkNotResponded}
                  onClick={() => updateAssignmentStatus("not_responded")}>Not Responded</Button>

                <Button variant="contained" className="!bg-green-500 hover:!bg-green-600 !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={!canCall} onClick={
                  () => updateAssignmentStatus("contacted")
                }>Call</Button>
              </>
            )}
            {assessAssign && assessAssign.schedule?.method === "off" && (
              <Button variant="contained" className="!bg-orange-400 hover:!bg-orange-500 !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={!(assessAssign.status === "assigned" && isWithinSchedule(assessAssign)) || assessBasicForm.values.status === "queued" || assessBasicForm.values.status === "completed" || assessBasicForm.values.status === "rejected"} onClick={() => updateAssignmentStatus("queued")}>Queue</Button>
            )}
            {assessBasicForm?.values?.status == "queued" && (
              <Button variant="contained" type="button" className="bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={isPreLocked || assessBasicForm.values.status === "completed" || assessBasicForm.values.status === "rejected"} onClick={() => updateAssignmentStatus("not_responded")}>Absent</Button>
            )}
          </Box>
        </Grid>
      </Grid>

      {assessBasicForm?.values?.status === "queued" || assessBasicForm?.values?.status === "completed" || assessBasicForm?.values?.status === "rejected" ? (
        <>
          {/* --- Documents Section --- */}
          <Box className="shadow-2xl rounded-xl p-5 mt-6 bg-[var(--mui-palette-primary)]">
            <Typography className="mb-4 font-bold text-[15px] text-[var(--mui-palette-text-primary)]">
              Documents Verification
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Position Applied"
                  disabled
                  value={candidate?.documents?.position?.title || ""}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                {/* Uploaded docs preview + missing-doc upload, grouped by section */}
                <CandidateDocumentsSection candidate={candidate} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="body2"
                  className="mb-2 font-medium text-[var(--mui-palette-text-primary)]"
                >
                  Verification Status
                </Typography>

                <RadioGroup
                  row
                  value={docStatus}
                  onChange={(e) => setDocStatus(e.target.value)}
                >
                  <FormControlLabel value="uploaded" control={<Radio disabled />} label="Uploaded" />
                  <FormControlLabel value="verified" control={<Radio disabled />} label="Verified" />
                  <FormControlLabel value="rejected" control={<Radio disabled />} label="Rejected" />
                </RadioGroup>
                {candidate?.status === "doc_awaiting_approval" && (
                  <Typography
                    variant="caption"
                    className="block mt-2 text-[--mui-palette-warning-main] font-medium"
                  >
                    Documents have been reviewed and are currently awaiting approval from the Team Leader (TL).
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Box className="flex justify-center md:justify-end gap-3 mt-2">
              <Button variant="contained" className="!bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] !text-[13px] !font-bold !rounded-lg !normal-case" disabled={isPreLocked || !docReject} onClick={() => updateDocumentStatus(`rejected`)}>Rejected</Button>
              <Button variant="contained" className="!bg-green-500 hover:!bg-green-600 !text-[13px] !font-bold !rounded-lg !normal-case" disabled={isPreLocked || !docVerify} onClick={() => updateDocumentStatus(`verified`)}>Verified</Button>
              <Button variant="contained" className="!bg-[--mui-palette-warning-main] hover:!bg-[--mui-palette-warning-dark] !text-[13px] !font-bold !rounded-lg !normal-case" disabled={isPreLocked || !docRequestTL} onClick={() => updateDocumentStatus(`awaiting_approval`)}>TL Request</Button>
            </Box>
          </Box>
          {/* --- Experience Section ---  */}
          <Box className=" shadow-2xl rounded-xl p-5 mt-4 bg-[var(--mui-palette-secondary)]">
            <Typography className="mb-2 font-bold text-[15px] text-[var(--mui-palette-text-primary)]">Experience</Typography>
            <RadioGroup row value={expStatus} onChange={(e:any) => setExpStatus(e.target.value)}>
              <FormControlLabel value="selected" control={<Radio disabled />} label="Selected" />
              <FormControlLabel value="verified" control={<Radio disabled />} label="Verified" />
              <FormControlLabel value="request_technical" control={<Radio disabled />} label="Technical Requested" />
            </RadioGroup>
            <FormControl fullWidth className="mt-4 md:w-1/2">
              <InputLabel>Experience Type</InputLabel>
              <Select value={expType} label="Experience Type" onChange={(e) => setExpType(e.target.value)}>
                <MenuItem value="fresher">Fresher</MenuItem>
                <MenuItem value="domestic">Domestic</MenuItem>
                <MenuItem value="abroad">Abroad</MenuItem>
                <MenuItem value="free">Freelance</MenuItem>
              </Select>
            </FormControl>
            <Box className="flex justify-end gap-3 mt-6 mb-2">
              <Button variant="contained" className="!rounded-xl !normal-case bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark]" disabled={isPreLocked || !expRFT} onClick={() => updateExpStatus(`request_technical`)}>Refer Technical</Button>
              <Button variant="contained" className="!bg-green-500 hover:!bg-green-600 !text-[13px] !font-bold !rounded-lg !normal-case" disabled={isPreLocked || !expVerified} onClick={() => updateExpStatus(`verified`)}>Verified</Button>
            </Box>
          </Box>
          {/* --- Assessment Start Button --- */}
          {/* <Box className="flex justify-end gap-3 mt-6 mb-2">
            <Button variant="contained" onClick={() => setShowAssesmentForm(true)} className=" !rounded-lg !normal-case font-bold">
              Start
            </Button>
          </Box> */}

          {/* --- Common Save Button --- */}
          {!isFoe && !showAssessmentForm && (
            <Box className="flex justify-end mt-6">
              <Button
                variant="contained"
                onClick={handleSaveAll}
                className="  !text-white !rounded-xl !px-10 !py-2.5 !normal-case font-bold shadow-md"
                disabled={isPreLocked}
              >
                Save
              </Button>
            </Box>
          )}
        </>
      ) : ``}
      {/* --- Technical Round Section --- */}
      {/* <Box className=" shadow-2xl rounded-xl p-5 mt-4 bg-[var(--mui-palette-primary)]">
        <Typography className="mb-2 font-bold text-[15px] text-[var(--mui-palette-text-primary)]">Technical Round</Typography>
        <RadioGroup row value={techStatus} onChange={(e) => setTechStatus(e.target.value)}>
          <FormControlLabel value="na" control={<Radio disabled={isFoe} />} label="Not Referred" />
          <FormControlLabel value="refered" control={<Radio disabled={isFoe} />} label="Referred" />
          <FormControlLabel value="passed" control={<Radio disabled={isFoe} />} label="Passed" />
          <FormControlLabel value="failed" control={<Radio disabled={isFoe} />} label="Failed" />
        </RadioGroup>
        <FormControl fullWidth className="mt-4 md:w-1/2" size="small">
          <InputLabel>Classify Experience</InputLabel>
          <Select value={classifyExp} onChange={(e) => setClassifyExp(e.target.value)} label="Classify Experience" disabled={isFoe}>
            <MenuItem value="domestic">Domestic</MenuItem>
            <MenuItem value="abroad">International</MenuItem>
          </Select>
        </FormControl>
      </Box> */}
      {showAssessmentForm && (
        <AssessmentForm
          selectedCandidate={candidate}
          assessAssign={assessAssign}
          assessBasicForm={assessBasicForm}
        />
      )}
    </Card>
  );
};

export default AssessmentFormSection;