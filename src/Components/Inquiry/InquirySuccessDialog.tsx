import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

interface InquirySuccessDialogProps {
  open: boolean;
  generatedInqNo: string;
  handleClosePopup: () => void;
}

export const InquirySuccessDialog: React.FC<InquirySuccessDialogProps> = ({
  open,
  generatedInqNo,
  handleClosePopup,
}) => {
  return (
    <Dialog
      open={open}
      onClose={(_e, reason) => {
        if (reason !== "backdropClick") {
          handleClosePopup();
        }
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent className="text-center p-8">
        <Typography variant="h4" className="mt-4">
          Inquiry submitted
        </Typography>
        <Typography variant="h6" className="mt-2 mb-8" color="primary">
          ID: {generatedInqNo}
        </Typography>

        <Box className="mb-8">
          <Typography variant="body1" className="mt-2 mb-8" color="primary">
            Please choose your preferred schedule so we can assist you more
            effectively
          </Typography>
          <Button
            variant="contained"
            className="normal-case rounded-[50px] py-[9.6px] px-10"
            onClick={handleClosePopup}
          >
            Schedule / Re-Schedule
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};