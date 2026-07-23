import React from "react";
import { Box, Button, CircularProgress, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import { isWithinSchedule } from "@/Utils/common";
import { useAssessmentSignature } from "./useAssessmentSignatures";
import { AssessmentFormValues } from "@/Types/object.types";
import { FormikProps } from "formik";
import { IAssignment } from "@/lib/models/Assignment.model";
import { SignatureFieldItem } from "./useAssessmentForm";


interface AssessmentSignaturesProps {
  signatureFields: SignatureFieldItem[];
  assessmentForm: FormikProps<AssessmentFormValues>;
  assessmentStatus: string;
  assessAssign: IAssignment;
}


const AssessmentSignatures: React.FC<AssessmentSignaturesProps> = ({ assessmentForm, signatureFields, assessmentStatus, assessAssign }) => {

  const { handleClosePreview, handleOpenPreview, previews, previewDialogFile, setPreviews } = useAssessmentSignature({ assessmentForm });
  return (
    <Box className="flex flex-col gap-6">
      <Box className="flex flex-col sm:flex-row w-full gap-4 items-stretch">
        {/* {signatureFields.map(({ label, field }) => {
          const file = assessmentForm.values[field];
          return (
            <Box
              key={label}
              component="label"
              className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <input
                type="file"
                hidden
                accept=".pdf, .jpg, .jpeg, .png"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    assessmentForm.setFieldValue(field, e.target.files[0]);
                  }
                }}
              />
              {file ? (
                <Box className="flex flex-col items-center text-center">
                  <i className="mdi--check-circle-outline text-green-500 mb-2 text-2xl" />
                  <Typography className="text-[13px] font-bold text-gray-800">
                    {file.name}
                  </Typography>
                  <Typography className="text-[11px] text-gray-500">
                    Click to change file
                  </Typography>
                  <Typography className="text-[10px] text-gray-400 uppercase mt-4">
                    {label}
                  </Typography>
                </Box>
              ) : (
                <Box className="flex flex-col items-center text-center">
                  <Box className="w-10 h-10 bg-[var(--mui-overlays-1)] border border-gray-200 rounded-full flex items-center justify-center mb-2 shadow-sm">
                    <i className="ri-upload-cloud-2-line text-xl text-[var(--mui-palette-primary-main)]"></i>
                  </Box>
                  <Typography className="text-xs font-semibold mb-1">
                    Drop file here or{" "}
                    <span className="text-[var(--mui-palette-primary-main)] font-extrabold">browse</span>
                  </Typography>
                  <Typography className="text-[10px] text-gray-400 uppercase mt-2">
                    {label}
                  </Typography>
                </Box>
              )}
            </Box>
          )
        })} */}
        {signatureFields.map(({ label, field }) => {
          const file = assessmentForm.values[field];

          let previewUrl = null;
          let isImage = false;
          let fileName = "";

          if (file) {
            if (file instanceof File) {
              isImage = file.type.startsWith("image/");
              previewUrl = previews[field] || null;
              fileName = "name" in file ? (file as File).name : "Uploaded File";
            } else if (typeof file === "string") {
              isImage = file.match(/\.(jpeg|jpg|gif|png)$/i) != null || file.startsWith("data:image");
              previewUrl = file;
              fileName = file.split('/').pop() || "Signature";
            }
          }

          return (
            <Box key={label} className="flex-1 flex flex-col" id={field}>
              <Box
                component="label"
                className={`border-2 border-dashed rounded-xl p-4 min-h-[150px] flex-1 flex flex-col items-center justify-center cursor-pointer relative
          ${assessmentForm.touched[field] && assessmentForm.errors[field]
                    ? "border-red-500"
                    : "border-gray-300"
                  }
        `}
              >
                <input
                  type="file"
                  hidden
                  accept=".pdf, .jpg, .jpeg, .png"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      // Size validation: max 2MB
                      if (selectedFile.size > 2 * 1024 * 1024) {
                        assessmentForm.setFieldTouched(field, true);
                        assessmentForm.setFieldError(field, "File size must be less than 2MB");
                        e.target.value = ''; // Reset input
                        return;
                      }

                      if (selectedFile.type.startsWith("image/")) {
                        const img = new Image();
                        const objectUrl = URL.createObjectURL(selectedFile);
                        img.src = objectUrl;
                        img.onload = () => {
                          // Resolution validation
                          if (img.width > 2000 || img.height > 2000) {
                            assessmentForm.setFieldTouched(field, true);
                            assessmentForm.setFieldError(field, "Image resolution should not exceed 2000x2000");
                            URL.revokeObjectURL(objectUrl);
                          } else if (img.width < 100 || img.height < 100) {
                            assessmentForm.setFieldTouched(field, true);
                            assessmentForm.setFieldError(field, "Image resolution should be at least 100x100");
                            URL.revokeObjectURL(objectUrl);
                          } else {
                            if (previews[field] && previews[field].startsWith("blob:")) {
                              URL.revokeObjectURL(previews[field]);
                            }
                            setPreviews(prev => ({ ...prev, [field]: objectUrl }));
                            assessmentForm.setFieldValue(field, selectedFile);
                            assessmentForm.setFieldError(field, undefined);
                          }
                        };
                        img.onerror = () => {
                          assessmentForm.setFieldTouched(field, true);
                          assessmentForm.setFieldError(field, "Invalid image file");
                          URL.revokeObjectURL(objectUrl);
                        };
                      } else {
                        // PDF or other non-image — generate blob URL for preview
                        if (previews[field] && previews[field].startsWith("blob:")) {
                          URL.revokeObjectURL(previews[field]);
                        }
                        const pdfObjectUrl = URL.createObjectURL(selectedFile);
                        setPreviews(prev => ({ ...prev, [field]: pdfObjectUrl }));
                        assessmentForm.setFieldValue(field, selectedFile);
                        assessmentForm.setFieldError(field, undefined);
                      }
                      e.target.value = ''; // Reset input
                    }
                  }}
                />
                {file ? (
                  <Box className="flex flex-col items-center text-center w-full">
                    {isImage && previewUrl ? (
                      <Box
                        className="w-full flex justify-center mb-2 cursor-pointer relative group/prev"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenPreview(fileName, previewUrl, true); }}
                      >
                        <img src={previewUrl} alt="preview" className="h-16 object-contain rounded-md shadow-sm" />
                        <Box className="absolute inset-0 bg-black/30 opacity-0 group-hover/prev:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                          <i className="ri-eye-line text-white text-xl" />
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-2 cursor-pointer hover:bg-green-100 transition-all relative group/pdf"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (previewUrl) handleOpenPreview(fileName, previewUrl, false); }}
                      >
                        <i className="ri-file-text-line text-green-600 text-xl group-hover/pdf:opacity-0 transition-opacity" />
                        <i className="ri-eye-line text-green-700 text-xl absolute opacity-0 group-hover/pdf:opacity-100 transition-opacity" />
                      </Box>
                    )}
                    <Typography className="text-[13px] font-bold text-gray-800 break-all">
                      {fileName}
                    </Typography>
                    {/* <Typography className="text-[11px] text-[var(--mui-palette-primary-main)] font-semibold mt-0.5">
                      {previewUrl ? "Click preview to view" : ""}
                    </Typography> */}
                    <Typography className="text-[11px] text-gray-500 mt-0.5">
                      Click card to change
                    </Typography>
                    <Typography className="text-[10px] text-gray-400 uppercase mt-3">
                      {label}
                    </Typography>
                  </Box>
                ) : (
                  <Box className="flex flex-col items-center text-center">
                    <Box className="w-10 h-10 bg-[var(--mui-overlays-1)] border border-gray-200 rounded-full flex items-center justify-center mb-2 shadow-sm">
                      <i className="ri-upload-cloud-2-line text-xl text-[var(--mui-palette-primary-main)]"></i>
                    </Box>
                    <Typography className="text-xs font-semibold mb-1">
                      Drop file here or{" "}
                      <span className="text-[var(--mui-palette-primary-main)] font-extrabold">browse</span>
                    </Typography>
                    <Typography className="text-[10px] text-gray-400 uppercase mt-2">
                      {label}
                    </Typography>
                  </Box>
                )}
              </Box>

              {assessmentForm.touched[field] &&
                assessmentForm.errors[field] && (
                  <Typography
                    variant="caption"
                    className="text-[var(--mui-palette-error-light)] text-center mt-1 block"
                  >
                    {assessmentForm.errors[field] as string}
                  </Typography>
                )}
            </Box>
          );
        })}
      </Box>

      {/* Signature Fullscreen Preview Dialog */}
      <Dialog
        open={!!previewDialogFile}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: "rounded-[20px] overflow-hidden" }}
      >
        <Box className="flex items-center justify-between px-5 py-3 border-b border-[var(--mui-palette-divider)]">
          <Typography variant="subtitle1" className="font-bold truncate max-w-[80%]">
            {previewDialogFile?.name}
          </Typography>
          <Box className="flex items-center gap-2">
            {previewDialogFile?.url && (
              <a href={previewDialogFile.url} download={previewDialogFile?.name} target="_blank" rel="noreferrer">
                <Button size="small" variant="text" startIcon={<i className="ri-download-2-line" />}>
                  Download
                </Button>
              </a>
            )}
            <IconButton size="small" onClick={handleClosePreview}>
              <i className="ri-close-line text-xl" />
            </IconButton>
          </Box>
        </Box>
        <DialogContent className="p-0 bg-gray-50 flex items-center justify-center min-h-[60vh]">
          {previewDialogFile?.isImage ? (
            <img
              src={previewDialogFile.url}
              alt={previewDialogFile?.name}
              className="max-w-full max-h-[75vh] object-contain p-4"
            />
          ) : previewDialogFile?.url ? (
            <iframe
              src={previewDialogFile.url}
              title={previewDialogFile?.name}
              className="w-full min-h-[75vh] border-0"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Box className="flex justify-end">
        <Button
          type="button"
          variant="contained"
          onClick={() => assessmentForm.handleSubmit()}
          disabled={
            assessmentForm.isSubmitting ||
            assessmentStatus === "completed" ||
            assessmentStatus === "rejected" ||
            !isWithinSchedule(assessAssign)
          }
          className="bg-[var(--mui-palette-success-dark)] hover:bg-[var(--mui-palette-success-dark)] px-10 py-3 font-bold tracking-widest"
        >
          {assessmentForm?.isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Check Eligibility"
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default AssessmentSignatures;