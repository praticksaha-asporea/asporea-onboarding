"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, TextField,
  CircularProgress, Chip,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import toast from "react-hot-toast";
import { CamelCase } from "@/Utils/common";
import * as yup from "yup";

import CandidateDocumentsSection from "@/Module/TAC_Dashboard/components/CandidateDetail/CandidateDocumentsSection";
import { getCandidateDocumentsAction } from "@/Services/APIs/Documents/document.actions";
import { useFormik } from "formik";
import { technicalExperienceAction } from "@/Services/APIs/tacHead/experience.action";
import { getSlotsAction } from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";

interface ActionModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  lead: any;
  refreshData: () => void;
}

// ── Inline PDF / image upload card ───────────────────────────────────────────

interface BreakdownPdfUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

const BreakdownPdfUpload: React.FC<BreakdownPdfUploadProps> = ({ file, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Revoke old blob URL when file changes
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const accept = [".pdf", ".jpg", ".jpeg", ".png"];
  const isImage = file?.type.startsWith("image/") ?? false;

  const processFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5 MB");
      return;
    }
    onChange(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = "";
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
  };

  return (
    <>
     
      <Typography variant="caption" className="font-semibold text-[var(--mui-palette-text-secondary)] mb-1 block uppercase tracking-wide">
        Breakdown PDF / Image
      </Typography>

      <Box
        component="label"
        onDragOver={(e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        className={` shadow-2xl rounded-xl p-4 min-h-[150px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-300 hover:bg-[var(--mui-palette-secondary-lightOpacity)]"}`}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          accept={accept.join(",")}
          onChange={handleChange}
        />

        {file ? (
          <Box className="flex flex-col items-center text-center w-full gap-1">
            {/* Thumbnail for images, icon for PDF */}
            {isImage && previewUrl ? (
              <Box
                className="relative group/thumb w-full flex justify-center mb-1 cursor-pointer"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPreviewOpen(true); }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="preview" className="h-16 object-contain rounded-md shadow-sm" />
                <Box className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                  <i className="ri-eye-line text-white text-xl" />
                </Box>
              </Box>
            ) : (
              <Box
                className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-1 cursor-pointer hover:bg-green-100 transition-all relative group/pdf"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (previewUrl) setPreviewOpen(true); }}
              >
                <i className="ri-file-pdf-2-line text-green-600 text-xl group-hover/pdf:opacity-0 transition-opacity" />
                <i className="ri-eye-line text-green-700 text-xl absolute opacity-0 group-hover/pdf:opacity-100 transition-opacity" />
              </Box>
            )}

            <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] break-all px-2 max-w-full">
              {file.name}
            </Typography>
            <Typography className="text-[11px] text-[var(--mui-palette-text-secondary)]">
              Click card to change
            </Typography>
            <Typography
              onClick={handleClear}
              className="text-[11px] text-red-500 font-bold underline cursor-pointer hover:text-red-700 mt-0.5"
            >
              Clear
            </Typography>
          </Box>
        ) : (
          <Box className="flex flex-col items-center text-center">
            <Box className="w-10 h-10 bg-[var(--mui-overlays-1)] border border-gray-200 rounded-full flex items-center justify-center mb-2 shadow-sm">
              <i className="ri-upload-cloud-2-line text-xl text-[var(--mui-palette-primary-main)]" />
            </Box>
            <Typography className="text-xs font-semibold mb-1">
              Drop file here or{" "}
              <span className="text-[var(--mui-palette-primary-main)] font-extrabold">browse</span>
            </Typography>
            <Typography className="text-[10px] text-gray-400 uppercase mt-1">
              PDF · JPG · PNG — max 5 MB
            </Typography>
          </Box>
        )}
      </Box>

      {/* Full preview dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <Box className="flex items-center justify-between px-5 py-3 border-b border-[var(--mui-palette-divider)]">
          <Typography variant="subtitle1" className="font-bold truncate max-w-[80%]">
            {file?.name}
          </Typography>
          <Box className="flex items-center gap-2">
            {previewUrl && (
              <a href={previewUrl} download={file?.name} target="_blank" rel="noreferrer">
                <Button size="small" variant="text" startIcon={<i className="ri-download-2-line" />}>
                  Download
                </Button>
              </a>
            )}
            <Button size="small" variant="text" onClick={() => setPreviewOpen(false)}>
              <i className="ri-close-line text-xl" />
            </Button>
          </Box>
        </Box>
        <DialogContent className="p-0 bg-gray-50 flex items-center justify-center min-h-[60vh]">
          {isImage && previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={file?.name} className="max-w-full max-h-[75vh] object-contain p-4" />
          ) : previewUrl ? (
            <iframe src={previewUrl} title={file?.name} className="w-full min-h-[75vh] border-0" />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────

const TechnicalActionModal: React.FC<ActionModalProps> = ({ open, setOpen, lead, refreshData }) => {
  const [fullLeadData, setFullLeadData] = useState<any>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<any[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [passingMarks, setPassingMarks] = useState<number>(0);

  

  useEffect(() => {
    if (open) {
      setSelectedDate("");
      setSelectedSlot(null);
      setSlots([]);
    }
  }, [open]);

  
  useEffect(() => {
    const fetchSlots = async () => {
      const consultantId = lead?.preferences?.consultantId?._id || lead?.preferences?.consultantId?.id;
      if (selectedDate && consultantId) {
        setFetchingSlots(true);
        const res = await getSlotsAction(consultantId, selectedDate);
        if (res?.success !== false) {
          setSlots(res?.data || []);
        } else {
          setSlots([]);
        }
        setFetchingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate, lead]);
  const technicalReviewForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      expType: lead?.experience?.type,
      achievedScore: '',
      totalScore: '',
      answered: '',
      questions: '',
      timeTaken: '',
      remarks: '',
      breakdownPdf: null as File | null,

    },

    validationSchema: yup.object({
      expType: yup.string().required("Please choose experience type first"),
      achievedScore: yup
        .number()
        .typeError("Please enter achieved score")
        .required("Please enter achieved score")
        .min(0, "Achieved score cannot be negative")
        .max(
          yup.ref("totalScore"),
          "Achieved score cannot be greater than total score"
        ),
      totalScore: yup
        .number()
        .typeError("Please enter total score")
        .required("Please enter total score")
        .min(1, "Total score must be at least 1")
        .max(100, "Total score cannot exceed 100"),
      answered: yup
        .number()
        .typeError("Please enter number of questions answered")
        .required("Please enter number of questions answered")
        .min(0, "Answered questions cannot be negative")
        .max(
          yup.ref("questions"),
          "Answered questions cannot exceed total questions"
        ),
      questions: yup
        .number()
        .typeError("Please enter total number of questions")
        .required("Please enter total number of questions")
        .min(1, "Questions must be at least 1")
        .max(100, "Questions cannot exceed 100"),
      timeTaken: yup.string().required("Please enter total time taken for this round"),
      remarks: yup.string().max(500),
      // breakdownPdf: yup.any()
    }),
    onSubmit: async (values) => {
      const currentIsPassing = Number(values.achievedScore) >= passingMarks && passingMarks > 0;
      if (currentIsPassing && (!selectedDate || !selectedSlot)) {
        toast.error("Candidate has passed! Please schedule the next assessment slot.");
        return;  
      }
      const formData = new FormData();

      formData.append("leadId", lead?._id);

      formData.append("type", values.expType);
      formData.append("achievedScore", values.achievedScore);
      formData.append("totalScore", values.totalScore);
      formData.append("answered", values.answered);
      formData.append("questions", values.questions);
      formData.append("timeTaken", values.timeTaken);
      formData.append("feedback", values.remarks);
      if (values.breakdownPdf) {
        formData.append("breakdownPdf", values.breakdownPdf);
      }

   if (currentIsPassing && selectedDate && selectedSlot) {
        formData.append("scheduleDate", selectedDate);
        formData.append("scheduleFrom", selectedSlot.from);
        formData.append("scheduleTo", selectedSlot.to);
      }

      const res = await technicalExperienceAction(formData);

      if (res?.success !== false) {
        toast.success(`Technical Experience verified successfully as ${CamelCase(res?.data?.status)} !`);
        setOpen(false);
        refreshData();
      }
    },
  });
  useEffect(() => {
    const fetchFullLeadDetails = async () => {
      if (open && lead?._id) {
        setFetchingDetails(true);
        setFullLeadData(null);

        const res = await getCandidateDocumentsAction(lead._id, true);
        if (res?.success && res?.data?.lead) {
          // console.log(res?.data?.generalSettings?.technical?.fullMarks,514);

          setFullLeadData(res.data.lead);
          technicalReviewForm.setFieldValue("totalScore", res?.data?.generalSettings?.technical?.fullMarks);
          setPassingMarks(res?.data?.generalSettings?.technical?.passingMarks || 0);
          // console.log(lead?.experience?.type,88444);

        } else {
          toast.error("Failed to fetch complete document details for this candidate.");
          setFullLeadData(lead);
        }
        setFetchingDetails(false);
      }
    };

    fetchFullLeadDetails();
  }, [open, lead]);
 
  const isPassing = Number(technicalReviewForm.values.achievedScore) >= passingMarks && passingMarks > 0;

  if (!lead) return null;

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ className: "rounded-xl" }}>
      <DialogTitle className="font-medium text-[20px] text-[var(--mui-palette-primary)] bg-var(--mui-palette-primary-main)">
        Review Candidate Experience
      </DialogTitle>

      <DialogContent className="flex flex-col gap-5 pt-6  bg-[var(--mui-palette-primary)]">


        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="bg-[var(--mui-palette-primary)]  p-4 rounded-xl shadow-2xl">
            <Typography variant="subtitle2" className="text-[var(--mui-palette-primary)] text-[12px] uppercase tracking-wider">
              Candidate
            </Typography>
            <Typography className="font-medium text-[16px] text-[var(--mui-palette-primary)]">
              {lead.fullName} <span className="font-mono text-xs text-[var(--mui-palette-primary)] font-medium ml-2">#{lead.inqNo}</span>
            </Typography>
            <Box className="mt-2">
              <Chip
                label={lead.documents?.position?.title || "No Position Selected"}
                size="small"
                className="text-[11px] font-bold  text-[var(--mui-palette-primary)] border border-blue-100"
              />
            </Box>
          </Box>

          <Box className="bg-[var(--mui-palette-primary)]   p-4 rounded-xl shadow-2xl flex flex-col justify-between">
            <Box>
              <Typography variant="subtitle2" className="text-[var(--mui-palette-primary)] text-[12px] uppercase tracking-wider">
                Assigned TAC
              </Typography>
              <Typography className="font-medium text-[14px] text-[var(--mui-palette-primary)]">
                {lead.preferences?.consultantId?.firstName} {lead.preferences?.consultantId?.lastName}
              </Typography>
            </Box>
          </Box>
        </Box>


        <Box className="bg-[var(--mui-palette-primary)]    p-4 md:p-6 rounded-xl shadow-2xl">
          <Typography variant="h6" className="text-[var(--mui-palette-primary)] mb-4 font-medium    pb-2">
            Uploaded Documents
          </Typography>
          {fetchingDetails ? (
            <Box className="flex flex-col items-center justify-center py-10 gap-2">
              <CircularProgress size={35} />
              <Typography variant="caption" className="text-[var(--mui-palette-primary)] font-medium animate-pulse">
                Fetching uploaded files...
              </Typography>
            </Box>
          ) : fullLeadData ? (

            <CandidateDocumentsSection candidate={fullLeadData} />
          ) : (
            <Typography className="text-center py-4 text-[var(--mui-palette-primary)]">No data available</Typography>
          )}
        </Box>


        {/* <Box className="bg-[var(--mui-palette-primary)]    p-4 md:p-6 rounded-xl shadow-2xl">

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" className="text-[var(--mui-palette-primary)] mb-4 font-medium    pb-2">
                Experience
              </Typography>
              
            </Grid>
          </Grid>
        </Box> */}
        <Box className="bg-[var(--mui-palette-primary)] p-4 md:p-6 rounded-xl shadow-2xl mt-2">
          <Typography
            variant="subtitle2"
            className="font-bold mb-4 uppercase tracking-wider pb-2"
          >
            Technical Assessment Review
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 12 }}>
              <FormControl fullWidth>
                <InputLabel id="experienceType-label">
                  Experience Type
                </InputLabel>
                {fullLeadData ? (
                  <Select
                    displayEmpty
                    size="medium" value={technicalReviewForm?.values?.expType} label="Experience Type"
                    onChange={(e) =>
                      technicalReviewForm.setFieldValue("expType", e.target.value)}
                    name="expType"
                  >
                    <MenuItem value="fresher">Fresher</MenuItem>
                    <MenuItem value="domestic">Domestic</MenuItem>
                    <MenuItem value="abroad">Abroad</MenuItem>
                    <MenuItem value="free">Freelance</MenuItem>
                  </Select>
                ) : (
                  <Typography className="text-center py-4 text-[var(--mui-palette-primary)]">No data available</Typography>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Achieved Score"
                name="achievedScore"
                onChange={technicalReviewForm?.handleChange}
                value={technicalReviewForm?.values?.achievedScore ?? ""}
                error={technicalReviewForm.touched.achievedScore && Boolean(technicalReviewForm.errors.achievedScore)}
                helperText={technicalReviewForm.touched.achievedScore && technicalReviewForm.errors.achievedScore}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                name="totalScore"
                label="Total Score"
                disabled
                onChange={technicalReviewForm?.handleChange}
                value={technicalReviewForm?.values?.totalScore ?? ""}
                error={technicalReviewForm.touched.totalScore && Boolean(technicalReviewForm.errors.totalScore)}
                helperText={technicalReviewForm.touched.totalScore && technicalReviewForm.errors.totalScore}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="answered"
                type="number"
                label="Answered"
                onChange={technicalReviewForm?.handleChange}
                value={technicalReviewForm?.values?.answered ?? ""}
                error={technicalReviewForm.touched.answered && Boolean(technicalReviewForm.errors.answered)}
                helperText={technicalReviewForm.touched.answered && technicalReviewForm.errors.answered}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="questions"
                label="Questions"
                type="number"
                onChange={technicalReviewForm?.handleChange}
                value={technicalReviewForm?.values?.questions ?? ""}
                error={technicalReviewForm.touched.questions && Boolean(technicalReviewForm.errors.questions)}
                helperText={technicalReviewForm.touched.questions && technicalReviewForm.errors.questions}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="timeTaken"
                label="Time Taken"
                onChange={technicalReviewForm?.handleChange}
                value={technicalReviewForm?.values?.timeTaken}
                error={technicalReviewForm.touched.timeTaken && Boolean(technicalReviewForm.errors.timeTaken)}
                helperText={technicalReviewForm.touched.timeTaken && technicalReviewForm.errors.timeTaken}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="remarks"
                label="TAC Head Remarks"
                placeholder="Provide remarks for approval/rejection..."
                value={technicalReviewForm.values.remarks}
                onChange={technicalReviewForm.handleChange}
                onBlur={technicalReviewForm.handleBlur}
                error={
                  technicalReviewForm.touched.remarks &&
                  Boolean(technicalReviewForm.errors.remarks)
                }
                helperText={
                  technicalReviewForm.touched.remarks &&
                  technicalReviewForm.errors.remarks
                }
              // className="mt-4"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12 }}>
              <BreakdownPdfUpload
                file={technicalReviewForm.values.breakdownPdf as File | null}
                onChange={(f) => technicalReviewForm.setFieldValue("breakdownPdf", f)}
              />
            </Grid>

       
          {isPassing && (
              <Grid size={{ xs: 12, md: 12 }}>
                <Box className="p-4  rounded-xl   shadow-2xl mt-2 transition-all">
                  <Typography variant="subtitle2" className="mb-3 text-[var(--mui-palette-primary-main)] font-semibold uppercase tracking-wider">
                     Schedule Next Assessment Slot (Mandatory)
                  </Typography>
                  <TextField
                    type="date" size="small" fullWidth
                    inputProps={{ min: new Date().toISOString().split("T")[0] }}
                    value={selectedDate}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      const todayStr = new Date().toISOString().split("T")[0];
                      if (selectedVal && selectedVal < todayStr) {
                        toast.error("Past dates are not allowed!");
                        setSelectedDate(todayStr);
                        setSelectedSlot(null);
                      } else {
                        setSelectedDate(selectedVal);
                        setSelectedSlot(null);
                      }
                    }}
                    className="bg-[var(--mui-palette-primary)]"
                  />

                  {selectedDate && (
                    <Box className="mt-4">
                      {fetchingSlots ? (
                        <Box className="flex items-center gap-2">
                          <CircularProgress size={20} />
                          <Typography variant="caption">Fetching available slots...</Typography>
                        </Box>
                      ) : slots.length > 0 ? (
                        <Box className="flex flex-wrap gap-2 mt-2">
                          {slots.map((slot: any) => (
                            <Chip
                              key={slot.time}
                              label={slot.time}
                              clickable={slot.available}
                              onClick={() => slot.available && setSelectedSlot(slot)}
                              color={selectedSlot?.time === slot.time ? "primary" : "default"}
                              variant={selectedSlot?.time === slot.time ? "filled" : "outlined"}
                              className={`${!slot.available ? "opacity-40 cursor-not-allowed bg-[var(--mui-palette-primary)]" : "hover:bg-[var(--mui-palette-primary)"}`}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="error">No slots available for this date.</Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>
            )}

          </Grid>



          {/* <Box className="flex justify-end mt-4">
            <Button
              variant="contained"
              color={
                technicalReviewForm.values.action === "rejected"
                  ? "error"
                  : "success"
              }
              onClick={technicalReviewForm.submitForm}
              disabled={!technicalReviewForm.values.action}
            >
              Submit Decision
            </Button>
          </Box> */}
        </Box>

      </DialogContent>

      <DialogActions className="p-5  bg-[var(--mui-palette-primary)]   ">
        <Button onClick={() => setOpen(false)} className="text-[var(--mui-palette-primary)]  font-medium normal-case">
          Cancel
        </Button>
        <Button
          variant="contained"

          // disabled={submitLoading || fetchingDetails || !action}
          onClick={() => technicalReviewForm.handleSubmit()}
          className={`rounded-lg px-6 normal-case shadow-md font-bold bg-[var(--mui-palette-primary-main)]`}  >
          {technicalReviewForm.isSubmitting ? <CircularProgress size={20} color="inherit" /> : `Update`}
        </Button>
      </DialogActions>
    </Dialog >
  );
};

export default TechnicalActionModal;