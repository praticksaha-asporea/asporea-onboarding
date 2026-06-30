"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  Typography, Box, TextField, FormControl, InputLabel, Select, 
  MenuItem, CircularProgress, Divider, Chip
} from "@mui/material";
import toast from "react-hot-toast";
import { CamelCase } from "@/Utils/common";

 
import CandidateDocumentsSection from "@/Module/TAC_Dashboard/components/CandidateDetail/CandidateDocumentsSection";
import { getCandidateDocumentsAction } from "@/Services/APIs/Documents/document.actions";
import { approveRejectDocumentAction } from "../../../../Services/APIs/tacHead/document.action";
import { RadioGroup, FormControlLabel, Radio, FormLabel } from "@mui/material";  

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
  
   
  const [fullLeadData, setFullLeadData] = useState<any>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  
  useEffect(() => {
    const fetchFullLeadDetails = async () => {
      if (open && lead?._id) {
        setFetchingDetails(true);
        setAction("");
        setRemarks("");
        setFullLeadData(null);

        const res = await getCandidateDocumentsAction(lead._id);
        if (res?.success && res?.data?.lead) {
          
          setFullLeadData(res.data.lead);
        } else {
          toast.error("Failed to fetch complete document details for this candidate.");
          setFullLeadData(lead);  
        }
        setFetchingDetails(false);
      }
    };

    fetchFullLeadDetails();
  }, [open, lead]);

  const handleSubmit = async () => {
    if (!action) return toast.error("Please select an action (Approve/Reject)");

    const payload = {
      leadId: lead._id,
      status: action,
      remarks,  
    };

    // console.log("API PAYLOAD BHEJ RAHA HU:", payload);

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
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ className: "rounded-xl" }}>
      <DialogTitle className="font-medium text-[20px] text-[var(--mui-palette-primary)] bg-var(--mui-palette-primary-main)">
        Review Candidate Documents
      </DialogTitle>

      <DialogContent   className="flex flex-col gap-5 pt-6  bg-[var(--mui-palette-primary)]">
        
       
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="bg-[var(--mui-palette-primary)]  p-4 rounded-xl shadow-2xl">
            <Typography variant="subtitle2" className="text-[var(--mui-palette-primary)] text-[12px] uppercase tracking-wider">
              Candidate
            </Typography>
            <Typography className="font-medium text-[16px] text-[var(--mui-palette-primary)]">
              {lead.fullName} <span className="font-mono text-xs text-[var(--mui-palette-primary)] font-medium ml-2">#{lead.inqNo}</span>
            </Typography>
            <Box className="mt-2">
              <Chip
                label={lead.documents?.position?.title || "No Position Selected"}
                size="small"
                className="text-[11px] font-bold  text-[var(--mui-palette-primary)] border border-blue-100"
              />
            </Box>
          </Box>

          <Box className="bg-[var(--mui-palette-primary)]   p-4 rounded-xl shadow-2xl flex flex-col justify-between">
            <Box>
              <Typography variant="subtitle2" className="text-[var(--mui-palette-primary)] text-[12px] uppercase tracking-wider">
                Assigned TAC
              </Typography>
              <Typography className="font-medium text-[14px] text-[var(--mui-palette-primary)]">
                {lead.preferences?.consultantId?.firstName} {lead.preferences?.consultantId?.lastName}
              </Typography>
            </Box>
          </Box>
        </Box>

       
        <Box className="bg-[var(--mui-palette-primary)]    p-4 md:p-6 rounded-xl shadow-2xl">
          <Typography variant="h6" className="text-[var(--mui-palette-primary)] mb-4 font-medium    pb-2">
            <i className="ri-folder-shield-2-line mr-2" />
            Uploaded & Missing Documents
          </Typography>
          
           
          {fetchingDetails ? (
            <Box className="flex flex-col items-center justify-center py-10 gap-2">
              <CircularProgress size={35} />
              <Typography variant="caption" className="text-[var(--mui-palette-primary)] font-medium animate-pulse">
                Fetching uploaded files...
              </Typography>
            </Box>
          ) : fullLeadData ? (
             
            <CandidateDocumentsSection candidate={fullLeadData} />
          ) : (
            <Typography className="text-center py-4 text-[var(--mui-palette-primary)]">No data available</Typography>
          )}
        </Box>

        
       <Box className=" bg-[var(--mui-palette-primary)]    p-4 md:p-6 rounded-xl shadow-2xl mt-2">
           <Typography variant="subtitle2" className=" text-[var(--mui-palette-primary)]  font-bold mb-3 uppercase tracking-wider    pb-2">
              TAC Head Decision
           </Typography>
          
          <FormControl component="fieldset" className="mb-4 w-full">
            <RadioGroup 
              row 
              value={action} 
              onChange={(e) => setAction(e.target.value as "verified" | "rejected")}
            >
              <FormControlLabel 
                value="verified" 
                control={<Radio className="text-[var(--mui-palette-primary-light)] [&.Mui-checked]:text-[var(--mui-palette-primary-light)]" />} 
                label={<Typography className="font-medium text-[var(--mui-palette-success-light)]">Verify</Typography>} 
              />
              <FormControlLabel 
                value="rejected" 
                control={<Radio className="text-[var(--mui-palette-error-light)] [&.Mui-checked]:text-[var(--mui-palette-error-light)]" />} 
                label={<Typography className="font-bold text-[var(--mui-palette-error-light)]">Reject</Typography>} 
              />
            </RadioGroup>
          </FormControl>

         
          <TextField
            fullWidth multiline rows={2} size="small" 
            label="Remarks (Optional)"
            placeholder="Add specific remarks about missing or invalid documents..."
            value={remarks} 
            onChange={(e) => setRemarks(e.target.value)}
            className="mt-2"
          />
        </Box>

      </DialogContent>

      <DialogActions className="p-5  bg-[var(--mui-palette-primary)]   ">
        <Button onClick={() => setOpen(false)}   className="text-[var(--mui-palette-primary-main)] [&.Mui-checked]:text-[var(--mui-palette-primary-main)]"
>
          Cancel
        </Button>
        <Button
          variant="contained"
        
          disabled={submitLoading || fetchingDetails || !action}
          onClick={handleSubmit}
          className={`rounded-lg px-6 normal-case shadow-md font-bold ${
            action === "rejected" ? "!bg-[var(--mui-palette-error-light)] hover:!bg-[var(--mui-palette-error-dark)]" : "!bg-[var(--mui-palette-primary-main)]  "
          }`}
        >
          {submitLoading ? <CircularProgress size={20} color="inherit" /> : `Confirm`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentActionModal;