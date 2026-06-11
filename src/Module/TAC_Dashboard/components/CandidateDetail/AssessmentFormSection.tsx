import React, { useState, useEffect } from "react";
import {
  Box, Button, Card, Chip, FormControl, FormControlLabel,
  FormLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup,
  Select, TextField, Typography,
} from "@mui/material";
import toast from "react-hot-toast";

interface AssessmentFormSectionProps {
  candidate: any;
  assessAssign: any;  
  isFoe: boolean;
  branchTitle: string;
  setCurrentView: (view: "dashboard" | "detail" | "assessment") => void;
}

const AssessmentFormSection: React.FC<AssessmentFormSectionProps> = ({
  candidate,
  assessAssign,
  isFoe,
  branchTitle,
  setCurrentView,
}) => {
  
  const docs = candidate?.documents || {};
  const exp = candidate?.experience || {};
//   const tech = candidate?.technical || {};

 
 const uploadedDocsList = Array.isArray(docs?.uploadedDocs) ? docs.uploadedDocs : [];
  const dynamicDocChips = uploadedDocsList.length > 0 
    ? Array.from(new Set(uploadedDocsList.map((d: any) => d.section)))
    : [];

 
  const [status, setStatus] = useState(assessAssign?.status || "not");
  const [visitMethod, setVisitMethod] = useState(assessAssign?.schedule?.method || "off");
  
  const [docStatus, setDocStatus] = useState(docs.status || "na");
  const [expStatus, setExpStatus] = useState(exp.type ? "selected" : "not");
  const [expType, setExpType] = useState(exp.type || "");
//   const [techStatus, setTechStatus] = useState(tech.status || "na");
//   const [classifyExp, setClassifyExp] = useState(tech.classify || "");

   
  useEffect(() => {
    setStatus(assessAssign?.status || "not");
    setVisitMethod(assessAssign?.schedule?.method || "off");
    setDocStatus(docs.status || "na");
    setExpStatus(exp.type ? "selected" : "not");
    setExpType(exp.type || "");
    // setTechStatus(tech.status || "na");
    // setClassifyExp(tech.classify || "");
  }, [assessAssign, candidate]);

  const handleSaveAll = () => {
   
    const payload = {
      assessment: { status, method: visitMethod },
      documents: { status: docStatus },
      experience: { status: expStatus, type: expType },
    //   technical: { status: techStatus, classify: classifyExp },
    };
    console.log("Saving Assessment Data:", payload);
    toast.success("Assessment details saved successfully!");
  };

  return (
    <Card className="p-6 rounded-xl  shadow-xl mt-4">
      <Typography className="text-[24px] text-center font-semibold mb-5 text-[var(--mui-palette-text-primary)]">
        Assessment 
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <FormControl>
            <FormLabel className="font-semibold  text-[var(--mui-palette-text-primary)]">Assessment Status</FormLabel>
            <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value)}>
              <FormControlLabel value="not" control={<Radio disabled={isFoe} />} label="Not Scheduled" />
              <FormControlLabel value="assigned" control={<Radio disabled={isFoe} />} label="Assigned" />
              <FormControlLabel value="progress" control={<Radio disabled={isFoe} />} label="In Progress" />
              <FormControlLabel value="done" control={<Radio disabled={isFoe} />} label="Finished" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl>
            <FormLabel className="font-semibold text-[var(--mui-palette-text-primary)]">Visit Option</FormLabel>
            <RadioGroup row value={visitMethod} onChange={(e) => setVisitMethod(e.target.value)}>
              <FormControlLabel value="off" control={<Radio disabled={isFoe} />} label="In-Office" />
              <FormControlLabel value="on" control={<Radio disabled={isFoe} />} label="Remote" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="Branch" disabled value={branchTitle} size="small" />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="Token No" disabled value={candidate.token || "—"} size="small" />
        </Grid>

        {!isFoe && (
          <Grid size={{ xs: 12 }}>
            <Box className="flex justify-center md:justify-end gap-3 mt-2">
              <Button variant="contained" disabled={status === "done"} className="!bg-blue-300 hover:!bg-blue-400 !text-white !rounded-lg !normal-case">
                Call for Assessment
              </Button>
              <Button variant="contained" disabled={status === "done"} className=" hover:!bg-blue-600 !rounded-lg !normal-case">
                Queue for Assessment
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* --- Documents Section --- */}
      <Box className=" shadow-2xl  rounded-xl p-5 mt-6 bg-[var(--mui-palette-primary)] ">
        <Typography className="mb-2 font-bold text-[15px] text-[var(--mui-palette-text-primary)]">Documents</Typography>
        <RadioGroup row value={docStatus} onChange={(e) => setDocStatus(e.target.value)}>
          <FormControlLabel value="uploaded" control={<Radio disabled={isFoe} />} label="Uploaded" />
          <FormControlLabel value="verified" control={<Radio disabled={isFoe} />} label="Verified" />
          <FormControlLabel value="rejected" control={<Radio disabled={isFoe} />} label="Rejected" />
        </RadioGroup>
       <Box className="flex flex-wrap gap-2 mt-4">
          {dynamicDocChips.length > 0 ? (
            dynamicDocChips.map((item: any) => (
              <Chip key={item} label={item} color="primary" variant="outlined" size="small" className="font-semibold bg-[var(--mui-palette-primary)] text-[var(--mui-palette-text-primary)] border-[var(--mui-palette-text-primary)]" />
            ))
          ) : (
            <Typography variant="body2" className="text-[var(--mui-palette-text-secondary)] italic mt-1">No documents uploaded yet</Typography>
          )}
        </Box>
      </Box>

      {/* --- Experience Section --- */}
      <Box className=" shadow-2xl rounded-xl p-5 mt-4 bg-[var(--mui-palette-secondary)]">
        <Typography className="mb-2 font-bold text-[15px] text-[var(--mui-palette-text-primary)]">Experience</Typography>
        <RadioGroup row value={expStatus} onChange={(e) => setExpStatus(e.target.value)}>
          <FormControlLabel value="not" control={<Radio disabled={isFoe} />} label="Not Selected" />
          <FormControlLabel value="selected" control={<Radio disabled={isFoe} />} label="Selected" />
          <FormControlLabel value="verified" control={<Radio disabled={isFoe} />} label="Verified" />
        </RadioGroup>
        <FormControl fullWidth className="mt-4 md:w-1/2" size="small">
          <InputLabel>Experience Type</InputLabel>
          <Select value={expType} label="Experience Type" onChange={(e) => setExpType(e.target.value)} disabled={isFoe}>
            <MenuItem value="fresher">Fresher</MenuItem>
            <MenuItem value="domestic">Domestic</MenuItem>
            <MenuItem value="abroad">Abroad</MenuItem>
            <MenuItem value="free">Freelance</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* --- Assessment Start Button --- */}
      {/* <Box className="flex justify-end gap-3 mt-6 mb-2">
        <Button variant="contained" disabled={isFoe} className="!rounded-lg !normal-case font-bold">Refer Technical</Button>
        <Button variant="contained" disabled={isFoe} onClick={() => setCurrentView("assessment")} className=" !rounded-lg !normal-case font-bold">
          Start
        </Button>
      </Box> */}

      {/* --- Technical Round Section --- */}
      {/* <Box className=" shadow-2xl rounded-xl p-5 mt-4 bg-[var(--mui-palette-primary)]">
        <Typography className="mb-2 font-bold text-[15px] text-[var(--mui-palette-text-primary)]">Technical Round</Typography>
        <RadioGroup row value={techStatus} onChange={(e) => setTechStatus(e.target.value)}>
          <FormControlLabel value="na" control={<Radio disabled={isFoe} />} label="Not Referred" />
          <FormControlLabel value="refered" control={<Radio disabled={isFoe} />} label="Referred" />
          <FormControlLabel value="passed" control={<Radio disabled={isFoe} />} label="Passed" />
          <FormControlLabel value="failed" control={<Radio disabled={isFoe} />} label="Failed" />
        </RadioGroup>
        <FormControl fullWidth className="mt-4 md:w-1/2" size="small">
          <InputLabel>Classify Experience</InputLabel>
          <Select value={classifyExp} onChange={(e) => setClassifyExp(e.target.value)} label="Classify Experience" disabled={isFoe}>
            <MenuItem value="domestic">Domestic</MenuItem>
            <MenuItem value="abroad">International</MenuItem>
          </Select>
        </FormControl>
      </Box> */}

      {/* --- Common Save Button --- */}
      {!isFoe && (
        <Box className="flex justify-end mt-6">
          <Button 
            variant="contained" 
            onClick={handleSaveAll} 
            className="  !text-white !rounded-xl !px-10 !py-2.5 !normal-case font-bold shadow-md"
          >
            Save All Details
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default AssessmentFormSection;