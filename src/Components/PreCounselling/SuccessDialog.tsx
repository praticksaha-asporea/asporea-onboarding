"use client";

import React from "react";
import { Dialog, DialogContent, Typography, Box, Button } from "@mui/material";
import { ILead } from "@/lib/models/Lead.model";
import { CounsellingMode } from "@/Module/Candidate_Dashboard/Pre-Counselling/usePreCounselling";
import { ExistingBooking } from "@/Types/Frontend_Payload/precounselling.types";
import { useRouter } from "next/navigation";

interface SuccessDialogProps {
  showConfirmPopup: boolean;
  setShowConfirmPopup: (val: boolean) => void;
  leadData: ILead | null;
  mode: CounsellingMode
  bookingData: ExistingBooking | null;
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({
  showConfirmPopup,
  setShowConfirmPopup,
  leadData,
  mode,
  bookingData
}) => {
  const router = useRouter();
  const bookingStatus =
    mode === "online"
      ? bookingData
        ? "BOOKED"
        : "SELECT_SLOT"
      : bookingData
        ? leadData?.preferences?.consultantId
          ? "OFFLINE_TAC"
          : "OFFLINE_NO_TAC"
        : "OFFLINE_NO_TAC";

  const bookingStatusMessage = {
    SELECT_SLOT: "TAC assigned to you. Please choose an available time slot that suits you.",
    BOOKED: "Please be available on the selected date and time.",
    OFFLINE_TAC: "Please reach the counselling center on time.",
    OFFLINE_NO_TAC:
      "A Front Office Executive (FOE) will contact you through your preferred communication channel. You will be assigned a Talent Acquisition Consultant (TAC) based on your availability. Alternatively, you may reach the selected branch, where a TAC will be assigned to you.",
    ONLINE_NO_BOOKING:
      "A Talent Acquisition Consultant (TAC) will contact you through your preferred communication channel.",
  }[bookingStatus];

  const bookingStatusUrl = {
    SELECT_SLOT: `/pre-counselling`,
    BOOKED: `/profile?tab=notifications`,
    OFFLINE_TAC: `/pre-counselling`,
    OFFLINE_NO_TAC: `/profile?tab=notifications`,
    ONLINE_NO_BOOKING: `/profile?tab=notifications`,
  }[bookingStatus];
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
          {bookingStatusMessage}
        </Typography>
        <Box className="flex gap-4 justify-center w-full mt-5">
          <Button
            variant="contained"
            disableRipple
            disableElevation
            // href={bookingStatusUrl}
            onClick={() => { setShowConfirmPopup(false); return router.replace(bookingStatusUrl); }}
            className="rounded-full bg-[var(--mui-palette-primary-main)] px-4 py-1.5 normal-case text-[var(--mui-palette-primary-contrastText)] hover:text-white shadow-md"
          >
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
