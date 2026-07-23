import React from "react";
import { Box, Button, Card, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography, Chip } from "@mui/material";
import { CamelCase } from "@/Utils/common";
import { useInquiryDetails } from "./useInquiryDetails";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";

interface InquiryDetailsFormProps { candidate: CandidateLead; }

const InquiryDetailsForm: React.FC<InquiryDetailsFormProps> = ({ candidate }) => {
  const { inquiryForm, fe, fh, getChipStyle, preferences, notifPrefs } = useInquiryDetails(candidate);

  return (
    <Card className="p-6 rounded-xl shadow-2xl">
      <Typography className="text-[18px] font-medium mb-5">
        Inquiry Details ({candidate.inqNo ?? "—"})
      </Typography>
      <form onSubmit={inquiryForm.handleSubmit}>
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="fullName"
              label="Full Name"
              value={inquiryForm.values.fullName}
              onChange={inquiryForm.handleChange}
              onBlur={inquiryForm.handleBlur}
              error={fe("fullName")}
              helperText={fh("fullName")}
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 6 }}
            className="flex flex-col -mt-2 justify-center"
          >
            <Typography
              variant="h6"
              className="text-[var(--mui-palette-text-secondary)] font-medium mb-2  tracking-wide"
            >
              Contact Preferences
            </Typography>
            <Box className="flex flex-wrap gap-2">
              <Chip label="WhatsApp" size="small" className={getChipStyle(!!notifPrefs?.whatsapp)} />
              <Chip label="Email" size="small" className={getChipStyle(!!notifPrefs?.email)} />
              <Chip label="SMS" size="small" className={getChipStyle(!!notifPrefs?.sms)} />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth name="email" label="Email Address" value={inquiryForm.values.email} onChange={inquiryForm.handleChange} onBlur={inquiryForm.handleBlur} error={fe("email")} helperText={fh("email")} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth name="phone" label="Phone Number" value={inquiryForm.values.phone} onChange={inquiryForm.handleChange} onBlur={inquiryForm.handleBlur} error={fe("phone")} helperText={fh("phone")} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth name="whatsapp" label="WhatsApp Number" value={inquiryForm.values.whatsapp} onChange={inquiryForm.handleChange} onBlur={inquiryForm.handleBlur} error={fe("whatsapp")} helperText={fh("whatsapp")} /></Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={fe("passportStatus")}>
              <InputLabel>Passport Status</InputLabel>
              <Select name="passportStatus" label="Passport Status" value={inquiryForm.values.passportStatus} onChange={(e) => { inquiryForm.handleChange(e); if (e.target.value !== "having") inquiryForm.setFieldValue("passportNo", ""); }} onBlur={inquiryForm.handleBlur}>
                <MenuItem value="having">Having</MenuItem><MenuItem value="applied">Applied</MenuItem><MenuItem value="no">Not Having</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {inquiryForm.values.passportStatus === "having" && (
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth name="passportNo" label="Passport No" value={inquiryForm.values.passportNo} onChange={(e) => inquiryForm.setFieldValue("passportNo", e.target.value.toUpperCase())} onBlur={inquiryForm.handleBlur} error={fe("passportNo")} helperText={fh("passportNo")} /></Grid>
          )}

          <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={3} name="address" label="Full Address" value={inquiryForm.values.address} onChange={inquiryForm.handleChange} onBlur={inquiryForm.handleBlur} error={fe("address")} helperText={fh("address")} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Status" disabled value={CamelCase(candidate.status ?? "")} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Visit Type" disabled value={CamelCase(preferences.visitType ?? "")} /></Grid>
        </Grid>

        <Box className="flex justify-end mt-6">
          <Button variant="contained" type="submit" disabled={inquiryForm.isSubmitting} className="normal-case px-6">
            {inquiryForm.isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Update"}
          </Button>
        </Box>
      </form>
    </Card>
  );
};

export default InquiryDetailsForm;