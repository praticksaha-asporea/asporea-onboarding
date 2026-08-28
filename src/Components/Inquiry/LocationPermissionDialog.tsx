import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

interface LocationPermissionDialogProps {
  open: boolean;
  getLocation: () => void;
}

export const LocationPermissionDialog: React.FC<
  LocationPermissionDialogProps
> = ({ open, getLocation }) => {
  return (
    <Dialog open={open}>
      <DialogContent className="text-center p-8">
        <Typography variant="h4" className="mt-4">
          Location permission required
        </Typography>
        <Typography variant="body1" className="mt-2 mb-8">
          Please allow location permission to continue
        </Typography>
        <Button variant="contained" color="primary" onClick={getLocation}>
          Allow location
        </Button>
      </DialogContent>
    </Dialog>
  );
};
