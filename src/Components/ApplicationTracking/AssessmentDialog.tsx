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
            You are assigned to a Talent Acquisition <br /> Consultant (TAC). <br /> Be ready for e-Assessment with Original Documents
          </Typography>
          <Button onClick={onProceed} className="bg-[var(--mui-palette-primary-main)] hover:bg-[--mui-palette-primary-main] text-white rounded-full text-[16px] normal-case px-6 py-2">
            Request e-Assessment
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};