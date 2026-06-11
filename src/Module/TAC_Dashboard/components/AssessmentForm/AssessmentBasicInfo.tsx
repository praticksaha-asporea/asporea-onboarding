import React from "react";
import { Grid, TextField, Typography } from "@mui/material";

interface AssessmentBasicInfoProps {
  selectedCandidate: any;
}

const AssessmentBasicInfo: React.FC<AssessmentBasicInfoProps> = ({ selectedCandidate }) => {
  return (
    <Grid container spacing={3} className="mb-8">
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography className="text-[11px] font-bold mb-1 uppercase">
          Name of Candidate
        </Typography>
        <TextField
          fullWidth
          defaultValue={selectedCandidate?.name || "Jonathan Doe"}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography className="text-[11px] font-bold mb-1 uppercase">
          Passport No.
        </Typography>
        <TextField fullWidth defaultValue="H234566Y" />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography className="text-[11px] font-bold mb-1 uppercase">
          Date of Assessment
        </Typography>
        <TextField fullWidth defaultValue="11/11/2026" />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Typography className="text-[11px] font-bold mb-1 uppercase">
          Assessed By
        </Typography>
        <TextField fullWidth defaultValue="Mason Lee" />
      </Grid>
    </Grid>
  );
};

export default AssessmentBasicInfo;