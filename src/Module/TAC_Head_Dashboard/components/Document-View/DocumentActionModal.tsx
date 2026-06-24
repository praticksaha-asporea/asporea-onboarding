"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  Typography, Box, TextField, FormControl, InputLabel, Select, 
  MenuItem, CircularProgress, Divider, Chip
} from "@mui/material";
import toast from "react-hot-toast";
import { CamelCase } from "@/Utils/common";
// import { approveRejectDocumentAction } from "@/Services/Apis/tachead/document.action";

interface ActionModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  lead: any;
  refreshData: () => void;
}

const DocumentActionModal: React.FC<ActionModalProps> = ({ open, setOpen, lead, refreshData }) => {
  const [action, setAction] = useState<"verified" | "rejected" | "">("");
  const [remarks, setRemarks] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setAction("");
      setRemarks("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!action) return toast.error("Please select an action (Approve/Reject)");
    if (!remarks.trim()) return toast.error("Remarks are mandatory");

    const payload = {
      leadId: lead._id,
      status: action,
      remarks,
    };

    setSubmitLoading(true);
    // API Call Mockup (Replace with actual action when ready)
    // const res = await approveRejectDocumentAction(payload);
    
    setTimeout(() => { // Mocking API delay
      setSubmitLoading(false);
      toast.success(`Documents ${action} successfully!`);
      setOpen(false);
      refreshData();
    }, 1000);
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ className: "rounded-xl" }}>
      <DialogTitle className="font-bold text-[20px] text-[var(--mui-palette-primary)] bg-var(--mui-palette-primary-main)">
        Review Candidate Documents
      </DialogTitle>

      <DialogContent className="flex flex-col gap-5 pt-6">
        <Box className="bg-var(--mui-palette-primary) p-4 rounded-xl shadow-2xl">
          <Typography variant="h5" className="text-[var(--mui-palette-primary)] mb-1">
            Candidate Details
          </Typography>
          <Typography className="font-medium text-[var(--mui-palette-primary)] text-sm">
            {lead.fullName} (Inq: {lead.inqNo})
          </Typography>
          <Box className="flex gap-2 mt-2">
            <Chip
              label={lead.documents?.position?.title || "No Position"}
              size="small" color="primary" variant="outlined"
              className="text-[11px] font-medium text-white bg-[var(--mui-palette-info-main)]"
            />
          </Box>
        </Box>

        <Box className="grid grid-cols-2 gap-4 bg-var(--mui-palette-primary) p-4 rounded-xl shadow-2xl">
          <Box>
            <Typography variant="subtitle2" className="text-[var(--mui-palette-secondary)] text-[12px]">
              Assigned TAC
            </Typography>
            <Typography className="font-semibold text-[14px]">
              {lead.preferences?.consultantId?.firstName} {lead.preferences?.consultantId?.lastName}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" className="text-[var(--mui-palette-primary)] text-[12px]">
              Current Status
            </Typography>
            <Typography className="font-semibold text-[14px] text-orange-500">
              Awaiting Approval
            </Typography>
          </Box>
        </Box>

        <Divider className="my-2" />

        <FormControl fullWidth size="small">
          <InputLabel>Decision Action</InputLabel>
          <Select value={action} onChange={(e) => setAction(e.target.value as "verified" | "rejected")} label="Decision Action">
            <MenuItem value="verified" className="text-[var(--mui-palette-success-main)] font-medium">Approve Documents</MenuItem>
            <MenuItem value="rejected" className="text-[var(--mui-palette-error-main)] font-medium">Reject Documents</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth multiline rows={2} size="small" label="Remarks" required  
          sx={{ "& .MuiFormLabel-asterisk": { color: "red" } }}
          placeholder="Add review remarks..."
          value={remarks} onChange={(e) => setRemarks(e.target.value)}
        />
      </DialogContent>

      <DialogActions className="p-5 text-[var(--mui-palette-primary)]">
        <Button onClick={() => setOpen(false)} className="text-white bg-[var(--mui-palette-primary-main)] normal-case">
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={submitLoading || !action || !remarks.trim()}
          onClick={handleSubmit}
          className={`rounded-lg px-6 normal-case shadow-md ${
            action === "rejected" ? "bg-[var(--mui-palette-error-main)] hover:bg-[var(--mui-palette-error-main)]" : "bg-[var(--mui-palette-success-main)] hover:bg-[var(--mui-palette-success-main)]"
          }`}
        >
          {submitLoading ? <CircularProgress size={20} color="inherit" /> : `Confirm ${CamelCase(action || "Action")}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentActionModal;