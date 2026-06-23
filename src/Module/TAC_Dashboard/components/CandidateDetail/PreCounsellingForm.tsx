import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  Box, Button, Card, CircularProgress, FormControl, FormControlLabel,
  FormLabel, Grid, Radio, RadioGroup, Stack, TextField, Typography,
  Dialog, DialogContent, IconButton
} from "@mui/material";
import { CamelCase, isWithinSchedule } from "@/Utils/common";
import { updateAssignmentAction } from "@/Services/APIs/tac/tac.actions";
import { confirmToast } from "@/Utils/confirmToast";

interface PreCounsellingFormProps {
  candidate: any;
  inqAssign: any;
  branchId: any;
  consultantId: any;
  source: any;
  preferences: any;
  candidatePhone: string;
}

const PreCounsellingForm: React.FC<PreCounsellingFormProps> = ({
  candidate: c, inqAssign, branchId, consultantId, source, preferences, candidatePhone
}) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // const [enablePreSubmit, setEnablePreSubmit] = useState(false);
  const [isPreLocked, setIsPreLocked] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const existingResume = inqAssign?.pre?.initialCV?.path;

  useEffect(() => {
    let objectUrl: string | null = null;
    if (resumeFile) {
      objectUrl = URL.createObjectURL(resumeFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(existingResume ?? null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [resumeFile, existingResume]);

  const isPdf = resumeFile
    ? resumeFile.type === "application/pdf"
    : existingResume?.toLowerCase().includes(".pdf") ?? false;



  useEffect(() => {
    if (inqAssign?.status === "completed" || inqAssign?.status === "rejected") {
      setIsPreLocked(true);
    } else if (inqAssign?.status === "queued" && (isWithinSchedule(inqAssign) && inqAssign?.schedule?.from != "" && inqAssign?.schedule?.to != "")) {
      setIsPreLocked(false);
    }
  }, [inqAssign]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0];
      setResumeFile(file);
      preForm.setFieldValue("resumeFile", file);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setResumeFile(file);
      preForm.setFieldValue("resumeFile", file);
    }
  };
  // console.log(c.token,6666);


  const preForm = useFormik({
    initialValues: {
      preStatus: inqAssign?.status ?? "na",
      additionalDetails: inqAssign?.pre?.additionalDetails ?? "",
      specificNotes: inqAssign?.pre?.specificNotes ?? "",
      advice: inqAssign?.pre?.advice ?? "",
      resumeFile: null as File | null,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      preStatus: Yup.string().trim().required("Status is required"),
      additionalDetails: Yup.string().trim().required("Additional details are required"),
      specificNotes: Yup.string().trim().optional(),
      advice: Yup.string().trim().optional(),
      resumeFile: Yup.mixed<File>().nullable().optional(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!inqAssign?._id) { toast.error("No pre-counselling assignment found"); setSubmitting(false); return; }
      if (values.preStatus === "completed") {
        const confirmed = await confirmToast(`Are you sure Pre-Counselling is Completed!`);
        if (!confirmed) { setSubmitting(false); return; }
      }
      if (values.preStatus === "rejected") {
        const confirmed = await confirmToast(`Are you sure Candidate is Rejected!`);
        if (!confirmed) { setSubmitting(false); return; }
      }

      try {
        const formData = new FormData();
        formData.append("assignmentId", inqAssign._id);
        formData.append("status", values.preStatus);
        formData.append("additionalDetails", values.additionalDetails);
        formData.append("specificNotes", values.specificNotes);
        formData.append("advice", values.advice);
        if (values.resumeFile) formData.append("resume", values.resumeFile);

        const preResult = await updateAssignmentAction(formData);
        if (preResult?.data?.data?.status === "completed" || preResult?.data?.data?.status === "rejected") {
          setIsPreLocked(true);
        }
        toast.success("Status Updated and will be sent to Candidate via Email");
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? "Save failed");
      } finally {
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    if (preForm.submitCount > 0 && Object.keys(preForm.errors).length > 0) {
      const firstErrorField = Object.keys(preForm.errors)[0];
      const errorElement = document.getElementsByName(firstErrorField)[0] || document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus();
      }
    }
  }, [preForm.submitCount]);

  const updateAssignmentStatus = async (status: string) => {
    if (!inqAssign?._id) return;
    const textStatus =
      status === "contacted"
        ? `Are you sure?\nYou contacted ${candidatePhone}`
        : status === "not_responded"
          ? `You contacted ${candidatePhone},\nbut the candidate did not respond?`
          : "Are you sure you are available to talk with this candidate now?";
    const confirmed = await confirmToast(textStatus);
    if (!confirmed) return;
    try {
      const formData = new FormData();
      formData.append("assignmentId", inqAssign._id);
      formData.append("status", status);

      await updateAssignmentAction(formData);
      toast.success(`Status updated to ${CamelCase(status)}`);
      preForm.setValues({ ...preForm.values, preStatus: status });
      if (status === "queued") setIsPreLocked(false);
    } catch (err: any) {
      console.log(err?.response?.data?.message ?? "Update failed");
    }
  };
  
  return (
    <Card className="p-6 rounded-xl   shadow-xl">
      <form onSubmit={preForm.handleSubmit}>
        <Typography className="text-[20px] font-bold text-center mb-5">Pre-Counselling</Typography>
        <Stack spacing={3}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12 }}>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <RadioGroup row name="preStatus" value={preForm.values.preStatus} onChange={(e, value) => {
                  // setEnablePreSubmit(((preForm.isSubmitting || isWithinSchedule(inqAssign)) && (value === "completed" || value === "rejected") && (inqAssign?.status !== "completed" && inqAssign?.status !== "rejected")));
                  setIsPreLocked(!(preForm.isSubmitting || isWithinSchedule(inqAssign)) && (value === "completed" || value === "rejected" || value === "queued") && (inqAssign?.status !== "completed" && inqAssign?.status !== "rejected" && inqAssign?.status !== "queued"));
                  return preForm.handleChange(e);
                }}>
                  <FormControlLabel value="assigned" control={<Radio />} label="Scheduled" disabled={preForm.values.preStatus !== 'assigned'} />
                  {inqAssign?.schedule?.method === "on" && <FormControlLabel value="contacted" control={<Radio readOnly />} label="Contacted" disabled />}
                  {inqAssign?.schedule?.method === "off" && <FormControlLabel value="queued" control={<Radio />} label="Queued" disabled={preForm.values.preStatus === 'rejected' || preForm.values.preStatus === 'completed'} />}
                  <FormControlLabel value="completed" control={<Radio />} label="Completed" disabled={inqAssign?.status === "rejected"} />
                  <FormControlLabel value="not_responded" control={<Radio readOnly />} label="Not Responded / Unattended" disabled />
                  <FormControlLabel value="rejected" control={<Radio />} label="Rejected" disabled={inqAssign?.status === "completed"} />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl>
                <FormLabel>Visit Method</FormLabel>
                <RadioGroup row value={inqAssign?.schedule?.method === "on" ? "remote" : "office"}>
                  <FormControlLabel value="office" control={<Radio />} label="In-Office" disabled={inqAssign?.schedule?.method === "on"} />
                  <FormControlLabel value="remote" control={<Radio />} label="Remote" disabled={inqAssign?.schedule?.method === "off"} />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Branch" disabled value={branchId.title ?? "—"} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Assigned Consultant" disabled value={consultantId.firstName ? `${consultantId.firstName} ${consultantId.lastName ?? ""}`.trim() : "—"} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Source" disabled value={CamelCase(source.type ?? "")} /></Grid>

            {source.refType && <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Referred By (Type)" disabled value={CamelCase(source.refType ?? "")} /></Grid>}
            {source.refName && <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Referred By (Name)" disabled value={source.refName} /></Grid>}
            {preferences.visitType === "offline" && <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Token No" value={inqAssign?.token?.number ?? "—"} disabled /></Grid>}

            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Inquiry Created" disabled value={c.lastActivity ? dayjs(c.lastActivity).format("DD/MM/YYYY hh:mm A") : "—"} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Scheduled Date" disabled value={inqAssign?.schedule?.date ? dayjs(inqAssign.schedule.date).format("DD/MM/YYYY") : "—"} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Scheduled Time" disabled value={inqAssign?.schedule?.from ? inqAssign.schedule.from + (inqAssign.schedule.to ? " – " + inqAssign.schedule.to : "") : "—"} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box className="flex justify-end gap-3">
                {inqAssign && inqAssign.schedule?.method === "on" && (
                  <>
                    <Button variant="contained" className="!bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={(inqAssign.status !== "assigned" && inqAssign.status !== "contacted") || !isWithinSchedule(inqAssign) || preForm.values.preStatus === "completed" || preForm.values.preStatus === "rejected"} onClick={() => updateAssignmentStatus("not_responded")}>Not Responded</Button>
                    <Button variant="contained" className="!bg-green-500 hover:!bg-green-600 !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={(inqAssign.status !== "assigned" && inqAssign.status !== "contacted") || !isWithinSchedule(inqAssign) || preForm.values.preStatus === "completed" || preForm.values.preStatus === "rejected"} onClick={() => updateAssignmentStatus("contacted")}>Call</Button>
                  </>
                )}
                {inqAssign && inqAssign.schedule?.method === "off" && (
                  <Button variant="contained" className="!bg-orange-400 hover:!bg-orange-500 !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={!(inqAssign.status === "assigned" && isWithinSchedule(inqAssign)) || preForm.values.preStatus === "queued" || preForm.values.preStatus === "completed" || preForm.values.preStatus === "rejected"} onClick={() => updateAssignmentStatus("queued")}>Queue</Button>
                )}
                {preForm?.values?.preStatus == "queued" && (
                  <Button variant="contained" type="button" className="bg-[--mui-palette-error-main] hover:!bg-[--mui-palette-error-dark] !text-white !text-[13px] !font-bold !rounded-lg !normal-case" disabled={isPreLocked || preForm.values.preStatus === "completed" || preForm.values.preStatus === "rejected"} onClick={() => updateAssignmentStatus("not_responded")}>Absent</Button>
                )}
              </Box>
            </Grid>

            {(preForm?.values?.preStatus == "completed" || preForm?.values?.preStatus == "rejected" || preForm?.values?.preStatus == "queued") && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography className="text-[13px] font-semibold mb-1.5">Additional Details of Candidate</Typography>
                  <TextField multiline rows={3} fullWidth name="additionalDetails" value={preForm.values.additionalDetails} onChange={preForm.handleChange} onBlur={preForm.handleBlur} error={preForm.submitCount > 0 && Boolean(preForm.errors.additionalDetails)} helperText={preForm.submitCount > 0 ? preForm.errors.additionalDetails as string : undefined} slotProps={{ input: { className: "text-[14px]" } }} disabled={isPreLocked} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography className="text-[13px] font-semibold mb-1.5">Specific Notes (During Pre-Counselling)</Typography>
                  <TextField multiline rows={3} fullWidth name="specificNotes" value={preForm.values.specificNotes} onChange={preForm.handleChange} onBlur={preForm.handleBlur} slotProps={{ input: { className: "text-[14px]" } }} disabled={isPreLocked} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography className="text-[13px] font-semibold mb-1.5">Advice</Typography>
                  <TextField multiline rows={3} fullWidth name="advice" value={preForm.values.advice} onChange={preForm.handleChange} onBlur={preForm.handleBlur} slotProps={{ input: { className: "text-[13px]" } }} disabled={isPreLocked} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} id="resumeFile">
                  <Typography className="text-[12px] font-semibold mb-1.5">Upload Resume</Typography>
                  <Box onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all h-[220px] ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"}`}>
                    <input ref={fileInputRef} hidden type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} disabled={isPreLocked} />
                    <i className="ri-upload-cloud-2-line text-4xl text-blue-500 mb-3" />
                    <Typography className="font-semibold text-sm">Drag & Drop Resume</Typography>
                    <Typography className="text-xs text-gray-500 mt-1">PDF, JPG, JPEG, PNG</Typography>
                  </Box>
                </Grid>
                {previewUrl && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography className="text-[12px] font-semibold mb-1.5">Resume Preview</Typography>
                    <Box
                      onClick={() => setIsPreviewOpen(true)}
                      className="border rounded-xl h-[220px] bg-gray-50 overflow-hidden relative cursor-pointer group hover:border-blue-500 transition-all"
                    >
                      {isPdf ? (
                        <Box className="w-full h-full pointer-events-none relative">
                          <iframe src={previewUrl} className="w-full h-full border-0" />
                          <Box className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Box className="bg-white/90 text-blue-600 px-3 py-1.5 rounded-lg shadow-sm font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view document
                            </Box>
                          </Box>
                        </Box>
                      ) : (
                        <Box className="w-full h-full flex items-center justify-center bg-white relative">
                          <img src={previewUrl} alt="Resume Preview" className="w-full h-full object-contain" />
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
              </>
            )}
          </Grid>
          {(preForm?.values?.preStatus == "completed" || preForm?.values?.preStatus == "rejected" || preForm?.values?.preStatus == "queued") && (
            <Box className="flex justify-end gap-3 mt-4 pt-6">
              <Button variant="contained" type="submit" disabled={isPreLocked || preForm?.values?.preStatus === "queued"} className="!bg-blue-500 hover:!bg-blue-600 !text-white !text-[13px] !font-bold !rounded-lg !normal-case">
                {preForm.isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Send As Prescription"}
              </Button>
            </Box>
          )}
        </Stack>
      </form>

      {/* Resume Fullscreen Preview Dialog */}
      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: "rounded-[20px] relative overflow-hidden" }}
      >
        <Box className="flex items-center justify-between px-5 py-3 border-b border-[var(--mui-palette-divider)]">
          <Typography variant="subtitle1" className="font-bold">
            Resume Preview
          </Typography>
          <Box className="flex items-center gap-2">
            {previewUrl && (
              <a href={previewUrl} download="Resume" target="_blank" rel="noreferrer">
                <Button size="small" variant="text" startIcon={<i className="ri-download-2-line" />}>
                  Download
                </Button>
              </a>
            )}
            <IconButton size="small" onClick={() => setIsPreviewOpen(false)}>
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
    </Card>
  );
};

export default PreCounsellingForm;