"use client";

import React from "react";
import { Dialog, DialogContent, Typography, Box, Button } from "@mui/material";
import { ILead } from "@/lib/models/Lead.model";
import { CounsellingMode } from "@/Module/Candidate_Dashboard/Pre-Counselling/usePreCounselling";

interface SuccessDialogProps {
  showConfirmPopup: boolean;
  setShowConfirmPopup: (val: boolean) => void;
  leadData: ILead | null;
  mode: CounsellingMode
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({
  showConfirmPopup,
  setShowConfirmPopup,
  leadData,
  mode
}) => {
  return (
    <Dialog
      open={showConfirmPopup}
      onClose={(event, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        setShowConfirmPopup(false);
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{ className: "rounded-[20px] p-8 relative" }}
    >
      <DialogContent className="flex flex-col items-center">
        <Typography variant="h4">Request Submitted</Typography>
        <Typography
          variant="body1"
          className="mt-5 leading-[1.9] text-center"
        >
          Pre-Counselling scheduled successfully.
        </Typography>
        <Typography
          variant="body1"
          className="text-[--mui-palette-error-light] mt-5 text-center"
        >
          Please be available on the selected date and time. {!leadData?.preferences
            ?.consultantId && mode === "offline" ?
            `Please reach to the counselling center on time.`
            : mode === "online"
              ? `TAC will be available on Video/Audio Call`
              : `A Talent Acquisition Consultant (TAC) will contact you through your preferred communication channel.`}
        </Typography>
        <Box className="flex gap-4 justify-center w-full mt-5">
          <Button
            variant="contained"
            disableRipple
            disableElevation
            href={`/profile?tab=notifications`}
            className="rounded-full bg-[var(--mui-palette-primary-main)] px-4 py-1.5 normal-case text-[var(--mui-palette-primary-contrastText)] hover:text-white shadow-md"
          >
            Go to Profile
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
