import React from "react";
import { Grid, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

interface AssessmentBasicInfoProps {
  selectedCandidate: any;
}

const AssessmentBasicInfo: React.FC<AssessmentBasicInfoProps> = ({ selectedCandidate }) => {
  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  return (
    <Grid container spacing={3} className="mb-8">
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography className="text-[11px] font-bold mb-1 uppercase">
          Name of Candidate
        </Typography>
        <TextField
          fullWidth
          defaultValue={selectedCandidate?.name}
          disabled
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography className="text-[11px] font-bold mb-1 uppercase">
          Passport No.
        </Typography>
        <TextField fullWidth defaultValue={selectedCandidate?.passport?.no} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography className="text-[11px] font-bold mb-1 uppercase">
          Date of Assessment
        </Typography>
        <TextField fullWidth defaultValue={dayjs().format("DD/MM/YYYY")} disabled/>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Typography className="text-[11px] font-bold mb-1 uppercase">
          Assessed By
        </Typography>
        <TextField fullWidth disabled defaultValue={`${reduxUser?.firstName ?? ""} ${reduxUser?.lastName ?? ""}`} />
      </Grid>
    </Grid>
  );
};

export default AssessmentBasicInfo;