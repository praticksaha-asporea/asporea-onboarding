import React from "react";
import { Box, Card, CardContent, Grid, TextField, Typography } from "@mui/material";
import { FormikProps } from "formik";
import { AssessmentFormValues } from "@/Types/object.types";

const AssessmentNotes: React.FC<{ assessmentForm: FormikProps<AssessmentFormValues> }> = (
  { assessmentForm }) => {
  return (
    <Box className="mb-10">
      <Typography className="text-[14px] font-bold mb-4">
        Additional Assessment Notes
      </Typography>
      <Grid container spacing={3}>
        {[0, 1, 2, 3].map((i) => {
          const fieldName = `note${i + 1}` as keyof AssessmentFormValues;
          return (
            <Grid size={{ xs: 12, md: 6 }} key={i}>
              <Card className="border border-gray-200 shadow-sm">
                <CardContent>
                  <Typography className="text-[11px] font-bold mb-2 uppercase">
                    Note {i + 1}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name={fieldName}
                    value={assessmentForm.values[fieldName]}
                    onChange={assessmentForm.handleChange}
                    onBlur={assessmentForm.handleBlur}
                    error={
                      !!(
                        assessmentForm.touched[fieldName] &&
                        assessmentForm.errors[fieldName]
                      )
                    }
                    helperText={
                      assessmentForm.touched[fieldName]
                        ? assessmentForm.errors[fieldName]
                        : ""
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  );
};

export default AssessmentNotes;