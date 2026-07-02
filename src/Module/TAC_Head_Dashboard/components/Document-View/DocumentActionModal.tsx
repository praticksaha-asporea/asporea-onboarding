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

import CandidateDocumentsSection from "@/Module/TAC_Dashboard/components/CandidateDetail/CandidateDocumentsSection";
import { getCandidateDocumentsAction } from "@/Services/APIs/Documents/document.actions";
import { approveRejectDocumentAction } from "../../../../Services/APIs/tacHead/document.action";
import { RadioGroup, FormControlLabel, Radio, FormLabel } from "@mui/material";
import { getSlotsAction } from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
interface ActionModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  lead: any;
  refreshData: () => void;
}

const DocumentActionModal: React.FC<ActionModalProps> = ({
  open,
  setOpen,
  lead,
  refreshData,
}) => {
  const [action, setAction] = useState<"verified" | "rejected" | "">("");
  const [remarks, setRemarks] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fullLeadData, setFullLeadData] = useState<any>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<any[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  useEffect(() => {
    const fetchFullLeadDetails = async () => {
      if (open && lead?._id) {
        setFetchingDetails(true);
        setAction("");
        setRemarks("");
        setSelectedDate("");
        setSelectedSlot(null);
        setSlots([]);
        setFullLeadData(null);

        const res = await getCandidateDocumentsAction(lead._id);
        if (res?.success && res?.data?.lead) {
          setFullLeadData(res.data.lead);
        } else {
          toast.error(
            "Failed to fetch complete document details for this candidate.",
          );
          setFullLeadData(lead);
        }
        setFetchingDetails(false);
      }
    };

    fetchFullLeadDetails();
  }, [open, lead]);

  useEffect(() => {
    const fetchSlots = async () => {
      const consultantId =
        lead?.preferences?.consultantId?._id ||
        lead?.preferences?.consultantId?.id;
      if (action === "verified" && selectedDate && consultantId) {
        setFetchingSlots(true);
        const res = await getSlotsAction(consultantId, selectedDate);
        if (res?.success !== false) {
          setSlots(res?.data || []);
        } else {
          setSlots([]);
        }
        setFetchingSlots(false);
      }
    };
    fetchSlots();
  }, [action, selectedDate, lead]);

  const handleSubmit = async () => {
    if (!action) return toast.error("Please select an action (Approve/Reject)");
    if (action === "verified" && (!selectedDate || !selectedSlot)) {
      return toast.error(
        "Please select an Assessment date and slot for verification.",
      );
    }

    const payload: any = {
      leadId: lead._id,
      status: action,
      remarks,
    };

    if (action === "verified" && selectedSlot) {
      payload.schedule = {
        date: selectedDate,
        from: selectedSlot.from,
        to: selectedSlot.to,
      };
    }

    setSubmitLoading(true);

    const res = await approveRejectDocumentAction(payload);
    setSubmitLoading(false);

    if (res?.success !== false) {
      toast.success(`Documents ${action} successfully!`);
      setOpen(false);
      refreshData();
    } else {
      toast.error(res?.message || "Failed to process the request");
    }
  };

  if (!lead) return null;

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{ className: "rounded-xl" }}
    >
      <DialogTitle className="font-medium text-[20px] text-[var(--mui-palette-primary)] bg-[var(--mui-palette-primary-main)]">
        Review Candidate Documents
      </DialogTitle>

      <DialogContent className="flex flex-col gap-5 pt-6">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="p-4 rounded-xl shadow-md border">
            <Typography
              variant="subtitle2"
              className="text-[12px] uppercase tracking-wider"
            >
              Candidate
            </Typography>
            <Typography className="font-medium text-[16px]">
              {lead.fullName}{" "}
              <span className="font-mono text-xs font-medium ml-2">
                #{lead.inqNo}
              </span>
            </Typography>
          </Box>
          <Box className="p-4 rounded-xl shadow-md border flex flex-col justify-between">
            <Typography
              variant="subtitle2"
              className="text-[12px] uppercase tracking-wider"
            >
              Assigned TAC
            </Typography>
            <Typography className="font-medium text-[14px]">
              {lead.preferences?.consultantId?.firstName}{" "}
              {lead.preferences?.consultantId?.lastName}
            </Typography>
          </Box>
        </Box>

        <Box className="p-4 md:p-6 rounded-xl shadow-2xl  ">
          <Typography variant="h6" className="mb-4 font-medium pb-2">
            Uploaded & Missing Documents
          </Typography>
          {fetchingDetails ? (
            <Box className="flex flex-col items-center justify-center py-10 gap-2">
              <CircularProgress size={35} />
            </Box>
          ) : fullLeadData ? (
            <CandidateDocumentsSection candidate={fullLeadData} />
          ) : (
            <Typography className="text-center py-4">
              No data available
            </Typography>
          )}
        </Box>

        <Box className="p-4 md:p-6 rounded-xl shadow-2xl  mt-2">
          <Typography
            variant="subtitle2"
            className="font-medium mb-3 text-[var(--mui-palette-text-primary)]
 uppercase tracking-wider pb-2"
          >
            TAC Head Decision
          </Typography>

          <FormControl component="fieldset" className="mb-4 w-full">
            <RadioGroup
              row
              value={action}
              onChange={(e) => {
                setAction(e.target.value as "verified" | "rejected");
                setSelectedDate("");
                setSelectedSlot(null);
              }}
            >
              <FormControlLabel
                value="verified"
                control={<Radio color="success" />}
                label={
                  <Typography color="success.main" className="font-medium">
                    Verify
                  </Typography>
                }
              />
              <FormControlLabel
                value="rejected"
                control={<Radio color="error" />}
                label={
                  <Typography color="error.main" className="font-bold">
                    Reject
                  </Typography>
                }
              />
            </RadioGroup>
          </FormControl>

          
         {/* Verification Slots Section */}
{action === "verified" && (
  <Box className="mb-6 p-4 bg-[var(--mui-palette-primary)] rounded-lg  ">
    <Typography variant="subtitle2" className="mb-3 text-[var(--mui-palette-primary-main)]
 font-semibold">
      Schedule Slot For Next Steps
    </Typography>
    <TextField
      type="date"
      size="small"
      fullWidth
      inputProps={{ min: new Date().toISOString().split("T")[0] }}
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className="bg-[var(--mui-palette-primary)] mb-4"
    />
    
    {selectedDate && (
      <Box>
        <Typography variant="subtitle2" className="mb-2 font-bold text-[var(--mui-palette-primary)]">
          Available Slots
        </Typography>
        <Box className="flex flex-wrap gap-2">
          {fetchingSlots ? (
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
                variant={selectedSlot?.time === slot.time ? "contained" : "outlined"}
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
            placeholder="Add specific remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions className="p-5">
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button
          variant="contained"
          disabled={submitLoading || fetchingDetails || !action}
          onClick={handleSubmit}
          className={`rounded-lg px-6 normal-case shadow-md font-bold ${action === "rejected" ? "!bg-red-500" : "!bg-blue-600"}`}
        >
          {submitLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            `Confirm`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default DocumentActionModal;
