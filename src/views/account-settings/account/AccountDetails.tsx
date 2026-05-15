"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";

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

type Data = {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  phoneNumber: number | string;
  whatsappNumber: number | string;
  address: string;
  state: string;
  zipCode: string;
  country: string;
  language: string;
  timezone: string;
  currency: string;
  passportStatus: string;
  passportNumber: string;
  experienceInMonths: number | string;
  bio: string;
};

const initialData: Data = {
  firstName: "",
  lastName: "",
  email: "",
  organization: "",
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
  experienceInMonths: "",
  bio: "",
};

const AccountDetails = () => {
  const dispatch = useDispatch();

  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );

  // console.log(" REDUX STORE DATA:", reduxUser);

  const [formData, setFormData] = useState<Data>(initialData);
  const [fileInput, setFileInput] = useState<string>("");
  const [imgSrc, setImgSrc] = useState<string>("/images/avatars/1.png");

  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (reduxUser && reduxUser.firstName) {
        setFormData({
          firstName: reduxUser.firstName || "",
          lastName: reduxUser.lastName || "",
          email: reduxUser.email || "",
          organization: reduxUser.organization || "",
          phoneNumber: reduxUser.phoneNumber || "",
          whatsappNumber: reduxUser.whatsappNumber || "",
          address: reduxUser.address || "",
          state: reduxUser.state || "",
          zipCode: reduxUser.zipCode || "",
          country: reduxUser.country || "india",
          language: reduxUser.language || "english",
          timezone: reduxUser.timezone || "gmt-0530",
          currency: reduxUser.currency || "inr",
          passportStatus: reduxUser.passportStatus || "not",
          passportNumber:
            reduxUser.passportNo || reduxUser.passportNumber || "",
          experienceInMonths: reduxUser.experienceInMonths || "",
          bio: reduxUser.bio || "",
        });
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

          setFormData({
            firstName: fullUserData.firstName || "",
            lastName: fullUserData.lastName || "",
            email: fullUserData.email || reduxUser?.email || "",
            organization: fullUserData.organization || "",
            phoneNumber: fullUserData.phoneNumber || "",
            whatsappNumber: fullUserData.whatsappNumber || "",
            address: fullUserData.address || "",
            state: fullUserData.state || "",
            zipCode: fullUserData.zipCode || "",
            country: fullUserData.country || "india",
            language: fullUserData.language || "english",
            timezone: fullUserData.timezone || "gmt-0530",
            currency: fullUserData.currency || "inr",
            passportStatus: fullUserData.passportStatus || "not",
            passportNumber: fullUserData.passportNumber || "",
            experienceInMonths: fullUserData.experienceInMonths || "",
            bio: fullUserData.bio || "",
          });

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

  const handleFormChange = (field: keyof Data, value: Data[keyof Data]) => {
    setFormData({ ...formData, [field]: value });
  };

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
  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const userId = reduxUser?.id || reduxUser?._id;

      if (!userId) {
        alert("Session expired. Please login again.");
        return;
      }

      const payload = {
        id: userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        address: formData.address,

        passportStatus: formData.passportStatus,

        passportNo:
          formData.passportStatus === "having" ? formData.passportNumber : "",

        enquired: "yes",
      };

      const res = await axiosClient.patch(`/user/profile-update`, payload);

      if (res.data?.success) {
        alert("Profile Updated Successfully! 🎉");
        dispatch(updateUserData(res.data.data));
      }
    } catch (error) {
      console.error("Update Profile Error:", error);
      alert("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
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
        <form onSubmit={handleUpdateProfile}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleFormChange("firstName", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleFormChange("lastName", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                disabled
                onChange={(e) => handleFormChange("email", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, sm: 12 }}>
              <TextField
                fullWidth
                type="number"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleFormChange("phoneNumber", e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, sm: 12 }}>
              <TextField
                fullWidth
                type="number"
                label="Whatsapp Number"
                value={formData.whatsappNumber}
                onChange={(e) =>
                  handleFormChange("whatsappNumber", e.target.value)
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Having Passport</InputLabel>
                <Select
                  label="Having Passport"
                  value={formData.passportStatus}
                  onChange={(e) =>
                    handleFormChange("passportStatus", e.target.value)
                  }
                >
                  <MenuItem value="having">Yes</MenuItem>
                  <MenuItem value="not">No</MenuItem>
                  <MenuItem value="applied">Applied</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.passportStatus === "having" && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Passport Number"
                  value={formData.passportNumber}
                  onChange={(e) =>
                    handleFormChange("passportNumber", e.target.value)
                  }
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 12 }}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                multiline
                aria-colspan={3}
                onChange={(e) => handleFormChange("address", e.target.value)}
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
                label="Experience (in months)"
                value={formData.experienceInMonths}
                onChange={(e) =>
                  handleFormChange("experienceInMonths", e.target.value)
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Bio"
                value={formData.bio}
                onChange={(e) => handleFormChange("bio", e.target.value)}
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
