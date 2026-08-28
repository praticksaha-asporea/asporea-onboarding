import React from "react";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

interface InquiryFormActionsProps {
  formStep: number;
  creatingInquiry: boolean;
  updatingInquiry: boolean;
  step1HasErrors: boolean;
  step2HasErrors: boolean;
  locationPermissionRequired: boolean;
  goBackToStep1: () => void;
}

export const InquiryFormActions: React.FC<InquiryFormActionsProps> = ({
  formStep,
  creatingInquiry,
  updatingInquiry,
  step1HasErrors,
  step2HasErrors,
  locationPermissionRequired,
  goBackToStep1,
}) => {
  return (
    <CardContent className="mbe-5 mt-4">
      <Grid container spacing={5}>
        <Grid
          size={{ xs: 12 }}
          className="flex gap-4 flex-wrap justify-between"
        >
          {formStep === 1 ? (
            <Button
              variant="outlined"
              onClick={goBackToStep1}
              disabled={updatingInquiry}
              className="rounded-xl normal-case text-sm"
            >
              Back
            </Button>
          ) : (
            <span />
          )}

          <Button
            variant="contained"
            type="submit"
            disabled={
              formStep === 0
                ? creatingInquiry ||
                  step1HasErrors ||
                  locationPermissionRequired
                : updatingInquiry ||
                  step2HasErrors ||
                  locationPermissionRequired
            }
            className="rounded-xl normal-case text-sm shadow-md"
          >
            {creatingInquiry || updatingInquiry ? (
              <CircularProgress size={24} color="inherit" />
            ) : formStep === 0 ? (
              "Save and continue"
            ) : (
              "Submit inquiry"
            )}
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  );
};