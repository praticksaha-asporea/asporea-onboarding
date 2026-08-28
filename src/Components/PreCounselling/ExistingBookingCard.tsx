import React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { ExistingBooking } from "@/Types/Frontend_Payload/precounselling.types";
import { formatToDDMMYY } from "@/Utils/common";
import { sectionCardClass } from "./HeaderCard";

interface ExistingBookingCardProps {
  existingBooking: ExistingBooking;
  handleReschedule: () => void;
  canReschedule: boolean;
  showScheduling: boolean;
  handleCancelReason: () => void;
  showCancel: boolean;
  cancelReason: string;
  setCancelReason: (val: string) => void;
  cancellationRequest: () => void;
}

export const ExistingBookingCard: React.FC<ExistingBookingCardProps> = ({
  existingBooking,
  handleReschedule,
  canReschedule,
  showScheduling,
  handleCancelReason,
  showCancel,
  cancelReason,
  setCancelReason,
  cancellationRequest,
}) => {
  return (
    <Card className={sectionCardClass}>
      <Box className="p-5 rounded-2xl shadow-2xl flex items-center gap-4">
        <Box
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background:
              "color-mix(in srgb, var(--mui-palette-primary-main) 14%, transparent)",
          }}
        >
          <i className="ri-calendar-check-fill text-2xl text-[var(--mui-palette-primary-main)]" />
        </Box>
        <Box>
          <Typography variant="h6" className="font-bold mb-1">
            Session Scheduled
          </Typography>
          <Typography
            variant="body2"
            className="text-[var(--mui-palette-text-secondary)]"
          >
            Booked for{" "}
            <strong>
              {formatToDDMMYY(existingBooking?.schedule?.date as string)}
            </strong>{" "}
            at{" "}
            <strong>
              {existingBooking?.schedule?.from} -{" "}
              {existingBooking?.schedule?.to}
            </strong>
            .
          </Typography>
        </Box>
      </Box>

      <Box className="flex justify-end gap-2 mt-6">
        <Button
          size="small"
          onClick={handleReschedule}
          disabled={canReschedule}
          className="rounded-xl normal-case text-white bg-[var(--mui-palette-success-main)] text-sm shadow-md px-8 font-semibold gap-1"
        >
          {!showScheduling ? "Reschedule" : "Leave as it is"}
          <i className="ri-calendar-check-fill" />
        </Button>

        <Button
          variant="contained"
          size="small"
          className="rounded-xl normal-case text-sm shadow-md px-8 font-semibold gap-1 bg-[var(--mui-palette-error-main)]"
          onClick={handleCancelReason}
        >
          Cancel
          <i className="ri-delete-bin-fill" />
        </Button>

        <Button
          variant="contained"
          size="small"
          href="/document-upload"
          className="rounded-xl normal-case text-sm shadow-md px-8 font-semibold"
        >
          Go to Documents
          <i className="ri-arrow-right-line" />
        </Button>
      </Box>

      {showCancel && (
        <Box className="mt-6 p-5 rounded-2xl shadow-2xl bg-[var(--mui-palette-primary)]">
          <Box className="flex items-center gap-2 mb-4">
            <Box className="flex items-center justify-center w-9 h-9 rounded-xl text-[var(--mui-palette-error-main)]">
              <i className="ri-close-circle-line text-xl" />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                className="font-medium text-[var(--mui-palette-error-main)]"
              >
                Cancellation Request
              </Typography>
              <Typography
                variant="caption"
                className="text-[var(--mui-palette-error-main)]"
              >
                Please provide a reason for cancelling this session.
              </Typography>
            </Box>
          </Box>

          <TextField
            label="Reason"
            variant="outlined"
            fullWidth
            multiline
            minRows={4}
            placeholder="Enter your cancellation reason..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />

          <Box className="flex justify-end mt-4">
            <Button
              variant="contained"
              color="error"
              onClick={cancellationRequest}
              className="rounded-xl normal-case px-7 font-semibold gap-2"
              startIcon={<i className="ri-send-plane-fill" />}
            >
              Send Request
            </Button>
          </Box>
        </Box>
      )}
    </Card>
  );
};
