"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

interface CancelBookingModalProps {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  cancelReason: string;
  setCancelReason: (val: string) => void;
  onConfirmCancel: () => void;
  loading: boolean;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  open,
  onClose,
  candidateName,
  cancelReason,
  setCancelReason,
  onConfirmCancel,
  loading,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ className: "rounded-2xl p-2" }}>
      <DialogTitle className="flex items-center gap-2 text-[var(--mui-palette-error-main)]
 font-semibold text-lg pb-1">
        <i className="ri-error-warning-line text-2xl" />
        Cancel Session
      </DialogTitle>

      <DialogContent className="pt-2">
        <Typography variant="body2" className="text-[var(--mui-palette-text-secondary)] mb-4">
          Are you sure you want to cancel the scheduled session for{" "}
          <strong className="text-[var(--mui-palette-text-primary)]">{candidateName}</strong>?
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Cancellation Reason"
          placeholder="Provide a reason for cancellation..."
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          variant="outlined"
          size="small"
        />
      </DialogContent>

      <DialogActions className="p-3 pt-0">
        <Button onClick={onClose} disabled={loading} color="inherit" className="rounded-xl normal-case">
          Close
        </Button>

        <Button
          onClick={onConfirmCancel}
          disabled={loading || !cancelReason.trim()}
          variant="contained"
          color="error"
          className="rounded-xl normal-case px-5 font-semibold bg-red-600 hover:bg-red-700"
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Confirm Cancel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelBookingModal;