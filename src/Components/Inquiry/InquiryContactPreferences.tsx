import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormHelperText from "@mui/material/FormHelperText";
import { NotificationPreferences } from "@/Types/Frontend_Payload/precounselling.types";
interface InquiryContactPreferencesProps {
  preferences: NotificationPreferences;
  handlePreferenceToggle: (type: keyof NotificationPreferences) => void;
  isPreferenceError: boolean;
  submitCount: number;
}

export const InquiryContactPreferences: React.FC<
  InquiryContactPreferencesProps
> = ({
  preferences,
  handlePreferenceToggle,
  isPreferenceError,
  submitCount,
}) => {
  const hasError = submitCount > 0 && isPreferenceError;

  return (
    <Card>
      <CardContent>
        <FormControl className="mbs-4 mie-4" error={hasError}>
          <Typography variant="h5" className="pb-5">
            Contact preferences
          </Typography>
          <FormGroup>
            <FormControlLabel
              label="Receive updates via email"
              control={
                <Checkbox
                  checked={preferences.email}
                  onChange={() => handlePreferenceToggle("email")}
                />
              }
            />
            <FormControlLabel
              label="Receive updates via WhatsApp"
              control={
                <Checkbox
                  checked={preferences.whatsapp}
                  onChange={() => handlePreferenceToggle("whatsapp")}
                />
              }
            />
            <FormControlLabel
              label="Receive updates via SMS"
              control={
                <Checkbox
                  checked={preferences.sms}
                  onChange={() => handlePreferenceToggle("sms")}
                />
              }
            />
          </FormGroup>
          <FormHelperText className="pt-3" error={hasError}>
            {hasError ? "Choose at least one preference to proceed" : null}
          </FormHelperText>
        </FormControl>
      </CardContent>
    </Card>
  );
};
