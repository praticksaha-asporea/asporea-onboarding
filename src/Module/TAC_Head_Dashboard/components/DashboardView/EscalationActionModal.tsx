"use client";

import React, { useState, useEffect } from "react";
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
  Divider,
  Chip,
} from "@mui/material";
import toast from "react-hot-toast";
import { CamelCase } from "@/Utils/common";

import { getSlotsAction } from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import { approveRejectEscalationAction } from "@/Services/APIs/tacHead/escalation.actions";

interface ActionModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  escalation: any;
  refreshData: () => void;
}

const EscalationActionModal: React.FC<ActionModalProps> = ({
  open,
  setOpen,
  escalation,
  refreshData,
}) => {
  const [action, setAction] = useState<"approved" | "rejected" | "">("");
  const [remarks, setRemarks] = useState("");

   
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  
  const todayStr = new Date(new Date().getTime() + 330 * 60000)
    .toISOString()
    .split("T")[0];

   
  useEffect(() => {
    if (open) {
      setDate(todayStr);
      setAction("");
      setRemarks("");
      setSelectedSlot(null);
    }
  }, [open, todayStr]);

  
  const leadStatus = escalation?.leadId?.status || "";
  const requiresSchedule = ["pre_scheduled", "assess_scheduled"].includes(
    leadStatus,
  );
  const targetTacId = escalation?.toId?._id;

  
  useEffect(() => {
    const fetchTargetTacSlots = async () => {
      if (action === "approved" && requiresSchedule && targetTacId && date) {
        setSlotsLoading(true);
        setSelectedSlot(null);
        const res = await getSlotsAction(targetTacId, date);
        if (res?.success) {
          setSlots(res.data);
        } else {
          setSlots([]);
          toast.error(
            res?.message || "Failed to fetch slots for the Target TAC",
          );
        }
        setSlotsLoading(false);
      }
    };

    fetchTargetTacSlots();
  }, [action, date, requiresSchedule, targetTacId]);

  const handleSubmit = async () => {
    if (!action) return toast.error("Please select an action (Approve/Reject)");
    if (!remarks.trim()) return toast.error("Remarks are mandatory");

    
    let schedulePayload = undefined;
    if (action === "approved" && requiresSchedule) {
      if (!selectedSlot)
        return toast.error(
          "Please select an available time slot for the Target TAC",
        );
      schedulePayload = {
        date,
        from: selectedSlot.from,
        to: selectedSlot.to,
        method:
          escalation?.leadId?.preferences?.visitType === "offline"
            ? "off"
            : "on",
      };
    }

    const payload = {
      escalationId: escalation._id,
      status: action,
      remarks,
      schedule: schedulePayload,
    };

    setSubmitLoading(true);
    const res = await approveRejectEscalationAction(payload);
    setSubmitLoading(false);

    if (res?.success) {
      toast.success(res.message || `Escalation ${action} successfully!`);
      setOpen(false);
      refreshData();
    } else {
      // toast.error(res?.message || "Failed to process the request");
    }
  };

  if (!escalation) return null;

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{ className: "rounded-xl" }}
    >
      <DialogTitle className="font-bold text-[20px] text-[var(--mui-palette-primary)] bg-var(--mui-palette-primary-main)  ">
        Review Escalation Request
      </DialogTitle>

      <DialogContent className="flex flex-col gap-5 pt-6">
        {/* Detail Section */}
        <Box className="bg-var(--mui-palette-primary) p-4 rounded-xl shadow-2xl ">
          <Typography
            variant="h5"
            className="text-[var(--mui-palette-primary)] mb-1"
          >
            Candidate Details
          </Typography>
          <Typography className="font-medium text-[var(--mui-palette-primary)] text-sm">
            {escalation.leadId?.fullName}
          </Typography>
          <Box className="flex gap-2  mt-2">
            <Chip
              label={CamelCase(leadStatus)}
              size="small"
              color="primary"
              variant="outlined"
              className="text-[11px] font-medium text-white bg-[var(--mui-palette-success-main)] "
            />
          </Box>
        </Box>

        <Box className="grid grid-cols-2 gap-4 bg-var(--mui-palette-primary) p-4 rounded-xl shadow-2xl  ">
          <Box>
            <Typography
              variant="subtitle2"
              className="text-[var(--mui-palette-secondary)] text-[12px]"
            >
              Escalated By (From)
            </Typography>
            <Typography className="font-semibold text-[14px]">
              {escalation.fromId?.firstName} {escalation.fromId?.lastName}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              className="text-[var(--mui-palette-primary)] text-[12px]"
            >
              Requested TAC (To)
            </Typography>
            <Typography className="font-semibold text-[14px] text-[var(--mui-palette-primary-main)]">
              {escalation.toId?.firstName} {escalation.toId?.lastName}
            </Typography>
          </Box>
          <Box className="col-span-2 mt-2">
            <Typography
              variant="subtitle2"
              className="text-gray-500 text-[12px]"
            >
              TAC Reason
            </Typography>
            <Typography className="text-[14px] italic">
              "{escalation.reason}"
            </Typography>
          </Box>
        </Box>

        <Divider className="my-2" />

        {/* Action Controls */}
        <FormControl fullWidth size="small">
          <InputLabel>Decision Action</InputLabel>
          <Select
            value={action}
            onChange={(e) =>
              setAction(e.target.value as "approved" | "rejected")
            }
            label="Decision Action"
          >
            <MenuItem value="approved" className="text-[var(--mui-palette-success-main)] font-medium">
              Approve Escalation
            </MenuItem>
            <MenuItem value="rejected" className="text-[var(--mui-palette-error-main)] font-medium">
              Reject Escalation
            </MenuItem>
          </Select>
        </FormControl>

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

        {/* Conditional Scheduling Section (Magic Happens Here) */}
        {action === "approved" && requiresSchedule && (
          <Box className="mt-2 p-4 rounded-xl shadow-2xl border-blue-200 bg-var(--mui-palette-primary)">
            <Typography
              variant="subtitle2"
              className="font-medium text-[var(--mui-palette-primary-main)] mb-2"
            >
              <i className="ri-calendar-schedule-line mr-2" />
              Target TAC needs to be scheduled
            </Typography>
            <Typography
              variant="caption"
              className="text-[var(--mui-palette-primary)] mb-4 block"
            >
              Candidate is in the <b>{CamelCase(leadStatus)}</b> stage. Please
              select an available slot for{" "}
              <b>
                {escalation.toId?.firstName} {escalation.toId?.lastName}
              </b>
              .
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
              className="mb-4 bg-var(--mui-palette-primary)"
            />

            <Box>
              <Typography
                variant="subtitle2"
                className="mb-2 font-bold text-[var(--mui-palette-primary)]"
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
                  slots.map((slot, index) => (
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
          </Box>
        )}
      </DialogContent>

      <DialogActions className="p-5 text-[var(--mui-palette-primary)]  ">
        <Button
          onClick={() => setOpen(false)}
          className=" text-white bg-[var(--mui-palette-primary-main)] normal-case"
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
              ? " bg-[var(--mui-palette-error-main)] hover:bg-[var(--mui-palette-error-main)]"
              : "bg-[var(--mui-palette-light-main) hover:bg-[var(--mui-palette-light-main)"
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
