import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {
  Box, Button, Card, CircularProgress, FormControl, Grid, 
  InputLabel, MenuItem, Select, TextField, Typography
} from "@mui/material";
import { CamelCase } from "@/Utils/common";
import { updateLeadAction } from "@/Services/APIs/tac/tac.actions";

interface InquiryDetailsFormProps {
  candidate: any;
}

const InquiryDetailsForm: React.FC<InquiryDetailsFormProps> = ({ candidate: c }) => {
  const contact = c.contact ?? {};
  const passport = c.passport ?? {};
  const preferences = c.preferences ?? {};

  const inquiryForm = useFormik({
    initialValues: {
      fullName: c.name ?? c.fullName ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      whatsapp: contact.whatsapp ?? "",
      address: c.address ?? "",
      passportStatus: passport.status ?? "no",
      passportNo: passport.no ?? "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      fullName: Yup.string().trim().required("Full name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phone: Yup.string()
        .matches(/^[0-9]{10}$/, "Must be exactly 10 digits")
        .required("Phone is required"),
      whatsapp: Yup.string()
        .matches(/^[0-9]{10}$/, "Must be exactly 10 digits")
        .required("WhatsApp is required"),
      address: Yup.string().trim().required("Address is required"),
      passportStatus: Yup.string().required(),
      passportNo: Yup.string().when("passportStatus", {
        is: "having",
        then: (s) => s.trim().required("Passport number is required"),
        otherwise: (s) => s.optional(),
      }),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateLeadAction({ id: c._id, ...values });
        toast.success("Inquiry details updated");
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? "Update failed");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fe = (field: string) =>
    !!(inquiryForm.touched[field as keyof typeof inquiryForm.touched] &&
      inquiryForm.errors[field as keyof typeof inquiryForm.errors]);
  const fh = (field: string) =>
    inquiryForm.touched[field as keyof typeof inquiryForm.touched]
      ? (inquiryForm.errors[field as keyof typeof inquiryForm.errors] as string | undefined)
      : undefined;

  return (
    <Card className="p-6 rounded-xl   shadow-2xl">
      <Typography className="text-[18px] font-medium mb-5">
        Inquiry Details ({c.inqNo ?? "—"})
      </Typography>
      <form onSubmit={inquiryForm.handleSubmit}>
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="fullName" label="Full Name" value={inquiryForm.values.fullName} onChange={inquiryForm.handleChange} onBlur={inquiryForm.handleBlur} error={fe("fullName")} helperText={fh("fullName")} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="email" label="Email Address" value={inquiryForm.values.email} onChange={inquiryForm.handleChange} onBlur={inquiryForm.handleBlur} error={fe("email")} helperText={fh("email")} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="phone" label="Phone Number" value={inquiryForm.values.phone} onChange={inquiryForm.handleChange} onBlur={inquiryForm.handleBlur} error={fe("phone")} helperText={fh("phone")} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="whatsapp" label="WhatsApp Number" value={inquiryForm.values.whatsapp} onChange={inquiryForm.handleChange} onBlur={inquiryForm.handleBlur} error={fe("whatsapp")} helperText={fh("whatsapp")} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={fe("passportStatus")}>
              <InputLabel>Passport Status</InputLabel>
              <Select
                name="passportStatus"
                label="Passport Status"
                value={inquiryForm.values.passportStatus}
                onChange={(e) => {
                  inquiryForm.handleChange(e);
                  if (e.target.value !== "having") {
                    inquiryForm.setFieldValue("passportNo", "");
                  }
                }}
                onBlur={inquiryForm.handleBlur}
              >
                <MenuItem value="having">Having</MenuItem>
                <MenuItem value="applied">Applied</MenuItem>
                <MenuItem value="no">Not Having</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {inquiryForm.values.passportStatus === "having" && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth name="passportNo" label="Passport No" value={inquiryForm.values.passportNo} onChange={(e) => inquiryForm.setFieldValue("passportNo", e.target.value.toUpperCase())} onBlur={inquiryForm.handleBlur} error={fe("passportNo")} helperText={fh("passportNo")} />
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth multiline rows={3} name="address" label="Full Address" value={inquiryForm.values.address} onChange={inquiryForm.handleChange} onBlur={inquiryForm.handleBlur} error={fe("address")} helperText={fh("address")} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Status" disabled value={CamelCase(c.status ?? "")} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Visit Type" disabled value={CamelCase(preferences.visitType ?? "")} />
          </Grid>
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