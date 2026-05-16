"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// Formik & Yup Imports
import { useFormik } from "formik";
import * as yup from "yup";

// MUI Imports
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import axios from "axios";

type Data = {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  state: string;
  zipCode: string;
  country: string;
  language: string;
  timezone: string;
  currency: string;
  passportStatus: string;
  passportNumber: string;
};

const initialData: Data = {
  firstName: "",
  lastName: "",
  email: "",
  organization: "Tech Solutions",
  phoneNumber: "",
  whatsappNumber: "",
  address: "",
  state: "",
  zipCode: "",
  country: "india",
  language: "english",
  timezone: "gmt-0530",
  currency: "inr",
  passportStatus: "not",
  passportNumber: "",
};

// 🛡️ STRICT YUP VALIDATION SCHEMA
const validationSchema = yup.object({
  firstName: yup
    .string()
    .matches(/^[A-Za-z\s]+$/, "Only alphabets allowed (no numbers)")
    .min(2, "Min 2 characters required")
    .required("First name is required"),
  lastName: yup
    .string()
    .matches(/^[A-Za-z\s]+$/, "Only alphabets allowed (no numbers)")
    .required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  phoneNumber: yup
    .string()
    .matches(/^[0-9]{10}$/, "Enter exactly 10 digits (no words/letters)")
    .required("Phone number is required"),
  whatsappNumber: yup
    .string()
    .matches(/^[0-9]{10}$/, "Enter exactly 10 digits")
    .notRequired(),
  passportStatus: yup.string(),
  passportNumber: yup.string().when("passportStatus", {
    is: "having",
    then: (schema) =>
      schema
        .matches(/^[A-Z][0-9]{7}$/, "Format: 1 Letter + 7 Digits (e.g., Z1234567)")
        .required("Passport number is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  address: yup.string().required("Address is required"),
});

export default function CompleteProfilePage() {
  const router = useRouter();
  const [fileInput, setFileInput] = useState<string>("");
  const [imgSrc, setImgSrc] = useState<string>("/images/avatars/1.png");
  const [loading, setLoading] = useState(false);
  const [verifiedChannel, setVerifiedChannel] = useState<"email" | "sms" | "">("");

  // 🚀 TERA WAPAS AAYA HUA handleRegisterUser FUNCTION
  const handleRegisterUser = async (values: Data) => {
    setLoading(true);
    const password = localStorage.getItem("temp_register_password");

    const payload = {
      ...values,
      passportNumber:
        values.passportStatus === "having" ? values.passportNumber : "",
      password,
    };

    try {
      const res = await axios.post("/api/auth/register", payload);

      if (res.data?.success) {
        localStorage.removeItem("temp_register_email");
        localStorage.removeItem("temp_register_password");
        toast.success("Profile completed! Redirecting to login...", {
          duration: 2000,
        });
        setTimeout(() => {
          router.push("/login");
        }, 4000);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 FORMIK SETUP
  const formik = useFormik({
    initialValues: initialData,
    validationSchema: validationSchema,
    onSubmit: handleRegisterUser, // Yahan humne apna function Formik ko de diya!
  });

  useEffect(() => {
    const savedIdentity = localStorage.getItem("temp_register_email");

    if (savedIdentity) {
      const isEmail = savedIdentity.includes("@");
      setVerifiedChannel(isEmail ? "email" : "sms");

      formik.setFieldValue("email", isEmail ? savedIdentity : "");
      formik.setFieldValue("phoneNumber", !isEmail ? savedIdentity : "");
    } else {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleFileInputChange = (file: ChangeEvent) => {
    const reader = new FileReader();
    const { files } = file.target as HTMLInputElement;
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string);
      reader.readAsDataURL(files[0]);
      if (reader.result !== null) {
        setFileInput(reader.result as string);
      }
    }
  };

  const handleFileInputReset = () => {
    setFileInput("");
    setImgSrc("/images/avatars/1.png");
  };

  return (
    <Box className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-4xl shadow-xl rounded-2xl">
        <Box className="p-6 text-center border-b border-gray-100 bg-white rounded-t-2xl">
          <Typography
            variant="h5"
            className="font-semibold tracking-wide text-gray-500"
          >
            Complete Your Profile
          </Typography>
          <Typography className="text-gray-500 mt-2">
            Almost there! Please fill in your details to create your account.
          </Typography>
        </Box>

        <CardContent className="p-6 sm:p-10 bg-white rounded-b-2xl">
          <div className="flex max-sm:flex-col mb-4 items-center gap-6">
            <img
              height={100}
              width={100}
              className="rounded"
              src={imgSrc}
              alt="Profile"
            />
            <div className="flex flex-grow flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  component="label"
                  size="small"
                  variant="contained"
                  htmlFor="account-settings-upload-image"
                >
                  Upload New Photo
                  <input
                    hidden
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleFileInputChange}
                    id="account-settings-upload-image"
                  />
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={handleFileInputReset}
                >
                  Reset
                </Button>
              </div>
              <Typography>Allowed JPG, GIF or PNG. Max size of 800K</Typography>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} noValidate>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  value={formik.values.email}
                  disabled={verifiedChannel === "email"}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={
                    (formik.touched.email && formik.errors.email) ||
                    (verifiedChannel === "email" ? "Verified via OTP" : "")
                  }
                  required={verifiedChannel !== "email"}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="tel"
                  required
                  id="phoneNumber"
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="+91 9876543210"
                  value={formik.values.phoneNumber}
                  disabled={verifiedChannel === "sms"}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                  helperText={
                    (formik.touched.phoneNumber && formik.errors.phoneNumber) ||
                    (verifiedChannel === "sms" ? "Verified via OTP" : "")
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="tel"
                  id="whatsappNumber"
                  name="whatsappNumber"
                  label="WhatsApp Number"
                  placeholder="+91 9876543210"
                  value={formik.values.whatsappNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.whatsappNumber && Boolean(formik.errors.whatsappNumber)}
                  helperText={formik.touched.whatsappNumber && formik.errors.whatsappNumber}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Having Passport</InputLabel>
                  <Select
                    id="passportStatus"
                    name="passportStatus"
                    label="Having Passport"
                    value={formik.values.passportStatus}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (e.target.value !== "having") {
                        formik.setFieldValue("passportNumber", "");
                      }
                    }}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="having">Yes</MenuItem>
                    <MenuItem value="not">No</MenuItem>
                    <MenuItem value="applied">Applied</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formik.values.passportStatus === "having" && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="passportNumber"
                    name="passportNumber"
                    label="Passport Number"
                    placeholder="Z1234567"
                    value={formik.values.passportNumber}
                    onChange={(e) => {
                      formik.setFieldValue("passportNumber", e.target.value.toUpperCase());
                    }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.passportNumber && Boolean(formik.errors.passportNumber)}
                    helperText={formik.touched.passportNumber && formik.errors.passportNumber}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="address"
                  name="address"
                  label="Address"
                  placeholder="123 Talent Lane..."
                  multiline
                  rows={3}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                />
              </Grid>

              <Grid size={{ xs: 12 }} className="flex justify-end gap-4 mt-4">
                <Button
                  variant="contained"
                  type="submit"
                  size="large"
                  disabled={loading}
                  className="min-w-[180px] bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}