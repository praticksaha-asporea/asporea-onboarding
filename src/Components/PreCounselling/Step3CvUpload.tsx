import React from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SectionHeader } from "./SectionHeader";
import { sectionCardClass } from "./HeaderCard";

interface Step3CvUploadProps {
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDragging: boolean;
  previewUrl: string | null;
  setIsPreviewOpen: (open: boolean) => void;
  isPdf: boolean;
}

export const Step3CvUpload: React.FC<Step3CvUploadProps> = ({
  handleDragOver,
  handleDragLeave,
  handleDrop,
  fileInputRef,
  onFileInputChange,
  isDragging,
  previewUrl,
  setIsPreviewOpen,
  isPdf,
}) => {
  return (
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
            className={`shadow-2xl rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all h-[220px] ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:bg-[--mui-palette-secondary-lightOpacity]"
            }`}
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
                  <iframe src={previewUrl} className="w-full h-full border-0" />
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
  );
};
