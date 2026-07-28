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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Avatar,
} from "@mui/material";
import { CamelCase } from "@/Utils/common";
import { useEscalationActionModal } from "./useEscalationActionModal";

interface ActionModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  escalation: any;
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
  escalation,
  refreshData,
}) => {
  const theme = useTheme();
  const headerGradient = `linear-gradient(270deg, var(--mui-palette-primary-main), ${lighten(theme.palette.primary.main, 0.5)} 100%)`;

  const {
    action,
    setAction,
    remarks,
    setRemarks,
    date,
    setDate,
    slots,
    selectedSlot,
    setSelectedSlot,
    slotsLoading,
    submitLoading,
    todayStr,
    leadStatus,
    requiresSchedule,
    handleSubmit,
  } = useEscalationActionModal({ open, setOpen, escalation, refreshData });

  if (!escalation) return null;

  const cPic = escalation?.leadId?.createdBy?.id?.profilePic?.path || null;
  const fPic = escalation?.fromId?.profilePic?.path || null;
  const tPic = escalation?.toId?.profilePic?.path || null;

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
                {escalation.leadId?.fullName}{" "}
                <span className="font-mono text-xs font-medium ml-1 text-gray-500">#{escalation.leadId?.inqNo}</span>
              </Typography>
              <Chip label={CamelCase(leadStatus)} size="small" className="mt-1 h-[20px] text-[10px] font-bold text-white bg-green-500" />
            </Box>
          </Box>

          {/* Escalation Route Information Card */}
          <Box className="p-4 rounded-xl shadow-2xl flex flex-col justify-center">
            <Box className="grid grid-cols-2 gap-4">
              <Box>
                <Typography variant="subtitle2" className="text-[12px] uppercase tracking-wider text-[var(--mui-palette-primary)]
 mb-2">
                  Escalated By (From)
                </Typography>
                <Box className="flex items-center gap-2">
                  <Avatar src={resolveFileSrc(fPic)} sx={{ width: 32, height: 32 }} />
                  <Typography className="font-medium text-[14px]">
                    {escalation.fromId?.firstName} {escalation.fromId?.lastName}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" className="text-[12px] uppercase tracking-wider text-[var(--mui-palette-primary)]
0 mb-2">
                  Requested TAC (To)
                </Typography>
                <Box className="flex items-center gap-2">
                  <Avatar src={resolveFileSrc(tPic)} sx={{ width: 32, height: 32 }} />
                  <Typography className="font-medium text-[14px] text-blue-600">
                    {escalation.toId?.firstName} {escalation.toId?.lastName}
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
            "{escalation.reason}"
          </Typography>
        </Box>

        {/* 3. TAC Head Decision Container (Matches DocumentActionModal) */}
        <Box className="p-4 md:p-6 rounded-xl shadow-2xl mt-2">
          <Typography variant="subtitle2" className="font-medium mb-3 uppercase tracking-wider pb-2">
            TAC Head Decision
          </Typography>

          <FormControl fullWidth size="small" className="mb-4">
            <InputLabel>Decision Action</InputLabel>
            <Select
              value={action}
              onChange={(e) =>
                setAction(e.target.value as "approved" | "rejected")
              }
              label="Decision Action"
            >
              <MenuItem
                value="approved"
                className="text-[var(--mui-palette-success-main)] font-medium"
              >
                Approve Escalation
              </MenuItem>
              <MenuItem
                value="rejected"
                className="text-[var(--mui-palette-error-main)] font-medium"
              >
                Reject Escalation
              </MenuItem>
            </Select>
          </FormControl>

          {/* Conditional Target TAC Slot Rescheduling Configuration */}
          {action === "approved" && requiresSchedule && (
            <Box className="mb-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <Typography
                variant="subtitle2"
                className="font-medium text-blue-700 mb-2"
              >
                <i className="ri-calendar-schedule-line mr-2" />
                Target TAC needs to be scheduled
              </Typography>
              <Typography
                variant="caption"
                className="text-[var(--mui-palette-primary)]
 mb-4 block"
              >
                Candidate is in the <b>{CamelCase(leadStatus)}</b> stage. Please
                select an available slot for{" "}
                <b>
                  {escalation.toId?.firstName} {escalation.toId?.lastName}
                </b>.
              </Typography>

              <TextField
                fullWidth
                type="date"
                size="small"
                label="Select Date"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: todayStr }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mb-4 "
              />

              {date && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    className="mb-2 font-bold text-gray-700"
                  >
                    Available Slots
                  </Typography>
                  <Box className="flex flex-wrap gap-2">
                    {slotsLoading ? (
                      <CircularProgress size={20} className="m-2" />
                    ) : slots.length === 0 ? (
                      <Typography className="text-gray-500 text-sm italic">
                        No slots available for this date.
                      </Typography>
                    ) : (
                      slots.map((slot: any, index: number) => (
                        <Button
                          key={index}
                          disabled={!slot.available}
                          variant={
                            selectedSlot?.time === slot.time
                              ? "contained"
                              : "outlined"
                          }
                          onClick={() => slot.available && setSelectedSlot(slot)}
                          className={`normal-case rounded-lg px-4 py-1 text-sm ${
                            selectedSlot?.time === slot.time
                              ? "bg-blue-600 border-blue-600 text-white"
                              : slot.available
                                ? "bg-white border-gray-300 hover:border-blue-500 text-gray-700"
                                : "bg-gray-100 border-gray-200"
                          } disabled:text-gray-400`}
                        >
                          {slot.time}
                        </Button>
                      ))
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            label="Remarks"
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
            !action ||
            !remarks.trim() ||
            (action === "approved" && requiresSchedule && !selectedSlot)
          }
          onClick={handleSubmit}
          className={`rounded-lg px-6 normal-case shadow-md ${
            action === "rejected"
              ? "!bg-red-500"
              : "!bg-blue-600"
          }`}
        >
          {submitLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            `Confirm ${CamelCase(action || "Action")}`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EscalationActionModal;