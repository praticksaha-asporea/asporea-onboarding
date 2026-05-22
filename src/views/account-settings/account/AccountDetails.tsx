"use client";

import { useFormik } from "formik";
import { profileValidationSchema } from "@/Validations/profileValidation";
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";

import { useSelector, useDispatch } from "react-redux";
import { updateUserData } from "@/Redux/Auth/user.slice";

import Cookies from "js-cookie";
import axiosClient from "@/Services/AxiosConfig/axiosClient";

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
import Divider from "@mui/material/Divider";
import toast from "react-hot-toast";
import { Avatar } from "@mui/material";

const AccountDetails = () => {
  const dispatch = useDispatch();

  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );

  const [fileInput, setFileInput] = useState<string>("");
  const [imgSrc, setImgSrc] = useState<string>("/images/avatars/1.png");

  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);

  
  useEffect(() => {
    const fetchAndSetData = async () => {
      if (reduxUser && (reduxUser.firstName || reduxUser.verifiedIdentity)) {
        setFetching(false);
        return;
      }

      try {
        const token = Cookies.get("accessToken");
        if (!token) {
          setFetching(false);
          return;
        }

        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const userId = decodedPayload.userId || decodedPayload.id;

        const res = await axiosClient.get(`/user/details?id=${userId}`);

        if (res.data?.success) {
          const fullUserData = res.data.data.user;
          dispatch(updateUserData(fullUserData));
        }
      } catch (error) {
        console.error("Profile Fetch Error:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchAndSetData();
  }, [reduxUser, dispatch]);

 
  const formik = useFormik({
    initialValues: {
      firstName: reduxUser?.firstName || "",
      lastName: reduxUser?.lastName || "",
      email:
        (reduxUser?.channel === "email"
          ? reduxUser.verifiedIdentity
          : reduxUser?.email) || "",
      organization: reduxUser?.organization || "",
      phoneNumber:
        (reduxUser?.channel === "sms"
          ? reduxUser.verifiedIdentity
          : reduxUser?.phoneNumber) || "",
      whatsappNumber: reduxUser?.whatsappNumber || "",
      address: reduxUser?.address || "",
      state: reduxUser?.state || "",
      zipCode: reduxUser?.zipCode || "",
      country: reduxUser?.country || "india",
      language: reduxUser?.language || "english",
      timezone: reduxUser?.timezone || "gmt-0530",
      currency: reduxUser?.currency || "inr",
      passportStatus: reduxUser?.passportStatus || "not",
      passportNumber: reduxUser?.passportNo || reduxUser?.passportNumber || "",
      experienceInMonths: reduxUser?.experienceInMonths || "",
      bio: reduxUser?.bio || "",
    },
    enableReinitialize: true,
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      setUpdating(true);
      try {
        const userId = reduxUser?.id || reduxUser?._id;

        if (!userId) {
          toast.error("Session expired. Please login again.");
          return;
        }

        const payload = {
          id: userId,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phoneNumber: String(values.phoneNumber),
          whatsappNumber: String(values.whatsappNumber),
          address: values.address,
          passportStatus: values.passportStatus,
          passportNo:
            values.passportStatus === "having" ? values.passportNumber : "",
          enquired: "yes",
        };

        const res = await axiosClient.patch(`/user/profile-update`, payload);

        if (res.data?.success) {
          toast.success("Profile Updated Successfully!", {
            duration: 3000,
          });
          dispatch(updateUserData(res.data.data));
        }
      } catch (error: any) {
        console.error("Update Profile Error:", error);
      } finally {
        setUpdating(false);
      }
    },
  });

  // Image Upload Handlers
  const handleFileInputChange = (file: ChangeEvent) => {
    const reader = new FileReader();
    const { files } = file.target as HTMLInputElement;

    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string);
      reader.readAsDataURL(files[0]);
      if (reader.result !== null) setFileInput(reader.result as string);
    }
  };

  const handleFileInputReset = () => {
    setFileInput("");
    setImgSrc("/images/avatars/1.png");
  };

  if (fetching) {
    return (
      <Card className="flex justify-center items-center h-64">
        <CircularProgress />
        <Typography className="ml-4">Loading Profile Data...</Typography>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="mbe-5">
        <div className="flex max-sm:flex-col items-center gap-6">
          <Avatar alt={`${reduxUser?.firstName ?? ""} ${reduxUser?.lastName ?? ""}`} src={imgSrc} />
          <div className="flex flex-grow flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                component="label"
                size="small"
                variant="contained"
                htmlFor="upload-image"
              >
                Upload New Photo
                <input
                  hidden
                  type="file"
                  value={fileInput}
                  accept="image/png, image/jpeg"
                  onChange={handleFileInputChange}
                  id="upload-image"
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
      </CardContent>

      <CardContent>
        <form onSubmit={formik.handleSubmit} noValidate>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                // ✅ Fixed with Type Assertion (as string)
                helperText={
                  formik.touched.firstName && formik.errors.firstName
                    ? (formik.errors.firstName as string)
                    : undefined
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                // ✅ Fixed with Type Assertion (as string)
                helperText={
                  formik.touched.lastName && formik.errors.lastName
                    ? (formik.errors.lastName as string)
                    : undefined
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                value={formik.values.email}
                disabled
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, sm: 12 }}>
              <TextField
                fullWidth
                type="number"
                id="phoneNumber"
                name="phoneNumber"
                label="Phone Number"
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.phoneNumber &&
                  Boolean(formik.errors.phoneNumber)
                }
               
                helperText={
                  formik.touched.phoneNumber && formik.errors.phoneNumber
                    ? (formik.errors.phoneNumber as string)
                    : undefined
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, sm: 12 }}>
              <TextField
                fullWidth
                type="number"
                id="whatsappNumber"
                name="whatsappNumber"
                label="Whatsapp Number"
                value={formik.values.whatsappNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.whatsappNumber &&
                  Boolean(formik.errors.whatsappNumber)
                }
            
                helperText={
                  formik.touched.whatsappNumber && formik.errors.whatsappNumber
                    ? (formik.errors.whatsappNumber as string)
                    : undefined
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="passportStatus-label">
                  Having Passport
                </InputLabel>
                <Select
                  labelId="passportStatus-label"
                  id="passportStatus"
                  name="passportStatus"
                  label="Having Passport"
                  value={formik.values.passportStatus}
                  onChange={(e) =>
                    formik.setFieldValue("passportStatus", e.target.value)
                  }
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
                  value={formik.values.passportNumber}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "passportNumber",
                      e.target.value.toUpperCase(),
                    )
                  }
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.passportNumber &&
                    Boolean(formik.errors.passportNumber)
                  }
                 
                  helperText={
                    formik.touched.passportNumber &&
                    formik.errors.passportNumber
                      ? (formik.errors.passportNumber as string)
                      : undefined
                  }
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 12 }}>
              <TextField
                fullWidth
                multiline
                id="address"
                name="address"
                label="Address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
               
                helperText={
                  formik.touched.address && formik.errors.address
                    ? (formik.errors.address as string)
                    : undefined
                }
              />
            </Grid>

            <Grid size={14}>
              <Typography
                variant="h6"
                color="text.primary"
                sx={{ mt: 4, mb: 1, fontWeight: 600 }}
              >
                Professional Experience
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                id="experienceInMonths"
                name="experienceInMonths"
                label="Experience (in months)"
                value={formik.values.experienceInMonths}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                id="bio"
                name="bio"
                label="Bio"
                value={formik.values.bio}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid size={12} className="flex justify-end gap-4 flex-wrap">
              <Button variant="contained" type="submit" disabled={updating}>
                {updating ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountDetails;
