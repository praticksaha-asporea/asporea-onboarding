"use client";

import React from "react";
import { useTheme, lighten } from "@mui/material/styles";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Chip,
  Avatar,
} from "@mui/material";
import { CamelCase } from "@/Utils/common";
import { useEscalationActionModal } from "./useEscalationActionModal";

interface ActionModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  transfer: any;
  refreshData: () => void;
}

const resolveFileSrc = (path?: string | null) => {
  if (!path) return "/images/avatars/avatar.png";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:3000";
  return `${BACKEND_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};

const EscalationActionModal: React.FC<ActionModalProps> = ({
  open,
  setOpen,
  transfer,
  refreshData,
}) => {
  const theme = useTheme();
  const headerGradient = `linear-gradient(270deg, var(--mui-palette-primary-main), ${lighten(theme.palette.primary.main, 0.5)} 100%)`;

  const {
    action,
    remarks,
    setRemarks,
    setSelectedSlot,
    submitLoading,
    handleSubmit,
  } = useEscalationActionModal({ open, setOpen, transfer, refreshData });

  if (!transfer) return null;

  const cPic = transfer?.leadId?.createdBy?.id?.profilePic?.path || null;
  const fPic = transfer?.fromId?.profilePic?.path || null;

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{ className: "rounded-xl" }}
    >
      <DialogTitle className="font-medium text-[20px] text-white px-6 py-4" style={{ background: headerGradient }}>
        Review Escalation Request
      </DialogTitle>

      <DialogContent className="flex flex-col gap-5 pt-6">

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Candidate Info Card */}
          <Box className="p-4 rounded-xl shadow-2xl flex items-center gap-4">
            <Avatar
              src={resolveFileSrc(cPic)}
              sx={{ width: 56, height: 56, border: '2px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Box>
              <Typography variant="subtitle2" className="text-[12px] uppercase tracking-wider text-[var(--mui-palette-primary)]
">
                Candidate Detail
              </Typography>
              <Typography className="font-medium text-[16px] mt-1">
                {transfer.fullName}{" "}
                <span className="font-mono text-xs font-medium ml-1 text-gray-500">#{transfer?.inqNo}</span>
              </Typography>
              <Chip label={CamelCase(transfer.leadStatus)} size="small" className="mt-1 h-[20px] text-[10px] font-bold text-white bg-green-500" />
            </Box>
          </Box>

          {/* Escalation Route Information Card */}
          <Box className="p-4 rounded-xl shadow-2xl flex flex-col justify-center">
            <Box className="grid grid-cols-2 gap-4">
              <Box>
                <Typography variant="subtitle2" className="text-[12px] uppercase tracking-wider text-[var(--mui-palette-primary)]
 mb-2">
                  Escalated By
                </Typography>
                <Box className="flex items-center gap-2">
                  <Avatar src={resolveFileSrc(fPic)} sx={{ width: 32, height: 32 }} />
                  <Typography className="font-medium text-[14px]">
                    {transfer.fromName}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* 2. Escalation Reason Container (Shadowed like document section) */}
        <Box className="p-4 md:p-6 rounded-xl shadow-2xl">
          <Typography variant="h6" className="mb-2 font-medium">
            Escalation Reason
          </Typography>
          <Typography className="text-[15px] italic Escalation Reason
 p-4 rounded-lg ">
            {transfer?.rawRecord?.reason}
          </Typography>
        </Box>

        {/* 3. TAC Head Decision Container (Matches DocumentActionModal) */}
        <Box className="p-4 md:p-6 rounded-xl shadow-2xl mt-2">
          <Typography variant="subtitle2" className="font-medium mb-3 uppercase tracking-wider pb-2">
            TAC Head Decision
          </Typography>


          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            label="Checked with remarks"
            required
            sx={{
              "& .MuiFormLabel-asterisk": {
                color: "red",
              },
            }}
            placeholder="Add reason for approval or rejection..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions className="p-5">
        <Button
          onClick={() => setOpen(false)}
          className="normal-case text-gray-600"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={
            submitLoading ||
            !remarks.trim()
          }
          onClick={handleSubmit}
          className={`rounded-lg px-6 normal-case shadow-md ${action === "rejected"
            ? "!bg-red-500"
            : "!bg-blue-600"
            }`}
        >
          {submitLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            `Checked`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EscalationActionModal;