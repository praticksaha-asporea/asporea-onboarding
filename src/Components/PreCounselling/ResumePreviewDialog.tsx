import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

interface ResumePreviewDialogProps {
  isPreviewOpen: boolean;
  setIsPreviewOpen: (open: boolean) => void;
  previewUrl: string | null;
  isPdf: boolean;
}

export const ResumePreviewDialog: React.FC<ResumePreviewDialogProps> = ({
  isPreviewOpen,
  setIsPreviewOpen,
  previewUrl,
  isPdf,
}) => {
  return (
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
  );
};
