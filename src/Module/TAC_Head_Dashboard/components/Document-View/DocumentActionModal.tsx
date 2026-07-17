"use client";

import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, TextField,
  FormControl, CircularProgress, RadioGroup, FormControlLabel, Radio, useTheme, lighten,
} from "@mui/material";
import CandidateDocumentsSection from "@/Module/TAC_Dashboard/components/CandidateDetail/CandidateDocumentsSection";
import { useDocumentActionModal } from "./useDocumentActionModal";

interface ActionModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  lead: any;
  refreshData: () => void;
}

const DocumentActionModal: React.FC<ActionModalProps> = ({ open, setOpen, lead, refreshData }) => {
  const theme = useTheme();
  const headerGradient = `linear-gradient(270deg, var(--mui-palette-primary-main), ${lighten(theme.palette.primary.main, 0.5)} 100%)`;

 
  const {
    action, setAction, remarks, setRemarks, submitLoading, fullLeadData, fetchingDetails,
    selectedDate, setSelectedDate, slots, fetchingSlots, selectedSlot, setSelectedSlot,
    handleSubmit, modalDetails,
  } = useDocumentActionModal({ open, lead, setOpen, refreshData });

  if (!lead) return null;

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ className: "rounded-xl" }}>
      <DialogTitle className="font-medium text-[20px] text-white px-6 py-4" style={{ background: headerGradient }}>
        Review Candidate Documents
      </DialogTitle>

      <DialogContent className="flex flex-col gap-5 pt-6">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 1. Candidate Info Card */}
          <Box className="p-4 rounded-xl shadow-md border">
            <Typography variant="subtitle2" className="text-[12px] uppercase tracking-wider">
              Candidate
            </Typography>
           
            <Typography className="font-medium text-[16px]">
              {modalDetails.fullName}{" "}
              <span className="font-mono text-xs font-medium ml-2">#{modalDetails.inqNo}</span>
            </Typography>
          </Box>

           
          <Box className="p-4 rounded-xl shadow-md border flex flex-col justify-between">
            <Typography variant="subtitle2" className="text-[12px] uppercase tracking-wider">
              Assigned TAC
            </Typography>
           
            <Typography className="font-medium text-[14px]">
              {modalDetails.assignedTac}
            </Typography>
          </Box>
        </Box>

      
        <Box className="p-4 md:p-6 rounded-xl shadow-2xl">
          <Typography variant="h6" className="mb-4 font-medium pb-2">
            Uploaded & Missing Documents For Position: <span className="text-blue-600">({modalDetails.positionApplied})</span>
          </Typography>
          {fetchingDetails ? (
            <Box className="flex flex-col items-center justify-center py-10">
              <CircularProgress size={35} />
            </Box>
          ) : fullLeadData ? (
            <CandidateDocumentsSection candidate={fullLeadData} />
          ) : (
            <Typography className="text-center py-4">No data available</Typography>
          )}
        </Box>

       
        <Box className="p-4 md:p-6 rounded-xl shadow-2xl mt-2">
          <Typography variant="subtitle2" className="font-medium mb-3 uppercase tracking-wider pb-2">
            TAC Head Decision
          </Typography>
          <FormControl component="fieldset" className="mb-4 w-full">
            <RadioGroup
              row value={action}
              onChange={(e) => {
                setAction(e.target.value as "verified" | "rejected");
                setSelectedDate("");
                setSelectedSlot(null);
              }}
            >
              <FormControlLabel value="verified" control={<Radio color="success" />} label={<Typography color="success.main" className="font-medium">Verify</Typography>} />
              <FormControlLabel value="rejected" control={<Radio color="error" />} label={<Typography color="error.main" className="font-bold">Reject</Typography>} />
            </RadioGroup>
          </FormControl>

          {action === "verified" && (
            <Box className="mb-6 p-4 bg-[var(--mui-palette-primary)] rounded-lg">
              <Typography variant="subtitle2" className="mb-3 font-semibold">
                Schedule Slot For Next Steps
              </Typography>
              <TextField
                type="date" size="small" fullWidth
                inputProps={{ min: new Date().toISOString().split("T")[0] }}
                value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                className="mb-4"
              />
              {selectedDate && (
                <Box>
                  <Typography variant="subtitle2" className="mb-2 font-bold">
                    Available Slots
                  </Typography>
                  <Box className="flex flex-wrap gap-2">
                    {fetchingSlots ? (
                      <CircularProgress size={20} className="m-2" />
                    ) : slots.length === 0 ? (
                      <Typography className="text-sm italic">No slots available.</Typography>
                    ) : (
                      slots.map((slot: any, index: number) => (
                        <Button
                          key={index} disabled={!slot.available}
                          variant={selectedSlot?.time === slot.time ? "contained" : "outlined"}
                          onClick={() => slot.available && setSelectedSlot(slot)}
                          className={`normal-case rounded-lg px-4 py-1 text-sm ${selectedSlot?.time === slot.time ? "bg-blue-600 text-white" : "bg-white"}`}
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
          <TextField fullWidth multiline rows={2} size="small" label="Remarks" placeholder="Add specific remarks..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </Box>
      </DialogContent>

      <DialogActions className="p-5">
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button
          variant="contained" disabled={submitLoading || fetchingDetails || !action} onClick={handleSubmit}
          className={`rounded-lg px-6 normal-case ${action === "rejected" ? "!bg-red-500" : "!bg-blue-600"}`}
        >
          {submitLoading ? <CircularProgress size={20} color="inherit" /> : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentActionModal;