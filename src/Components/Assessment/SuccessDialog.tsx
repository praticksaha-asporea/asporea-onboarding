"use client";

import React from "react";
import { Dialog, DialogContent, Typography, Box, Button } from "@mui/material";

export const SuccessDialog = ({ showConfirmPopup, setShowConfirmPopup, router }: any) => {
  return (
    <Dialog open={showConfirmPopup} onClose={(e, reason) => { if (reason !== "backdropClick" && reason !== "escapeKeyDown") setShowConfirmPopup(false); }} maxWidth="sm" fullWidth PaperProps={{ className: "rounded-[20px] p-8 relative" }}>
      <DialogContent className="flex flex-col items-center text-center p-4">
        <Typography variant="h4">Request Submitted</Typography>
        <Box>
          <Typography variant="body1" className="mt-6 mb-4 px-8 text-[--mui-palette-error-light] leading-[1.9]">
            Please be ready for your assessment on the scheduled time. You will be notified via reminder notification channels.
          </Typography>
          <Typography variant="body1" className="mt-5">
            You can keep necessary original documents handy.
          </Typography>
          <Button variant="contained" onClick={() => router.push("/applicationtracking")} className="mt-8 rounded-full px-8 py-2 normal-case border-[#1976d2] text-[var(--mui-palette-primary-main)] text-white font-bold">
            Back to Timeline
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};