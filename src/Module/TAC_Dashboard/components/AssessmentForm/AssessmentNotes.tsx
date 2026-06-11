import React from "react";
import { Box, Card, CardContent, Grid, TextField, Typography } from "@mui/material";

const AssessmentNotes: React.FC = () => {
  return (
    <Box className="mb-10">
      <Typography className="text-[14px] font-bold mb-4">
        Additional Assessment Notes
      </Typography>
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, md: 6 }} key={i}>
            <Card className="border border-gray-200 shadow-sm">
              <CardContent>
                <Typography className="text-[11px] font-bold mb-2 uppercase">
                  Note {i}
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  defaultValue=""
                  placeholder="Sample Note... "
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AssessmentNotes;