"use client";

import React from "react";
import { Dialog, DialogContent, IconButton, Typography, Box, Button } from "@mui/material";

interface AssessmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export const AssessmentDialog: React.FC<AssessmentDialogProps> = ({ isOpen, onClose, onProceed }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className: "rounded-[24px] pt-12 pb-10 px-8 relative overflow-hidden" }}>
      <DialogContent className="flex flex-col items-center text-center">
        <IconButton onClick={onClose} className="absolute right-5 top-5 text-gray-500">
          <i className="material-symbols--close-rounded" />
        </IconButton>
        <Typography variant="h4">Assessment</Typography>
        <Box className="mb-8">
          <Typography variant="body1" className="mt-2 mb-4 px-8">
            Keep your original documents ready for the Assessment. Your qualifications, experience, and supporting documents will be verified to assess your eligibility for the selected position.
          </Typography>
          <Button onClick={onProceed} className="bg-[var(--mui-palette-primary-main)] hover:bg-[--mui-palette-primary-main] text-white rounded-full text-[16px] normal-case px-6 py-2">
            Request Assessment
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};