"use client";

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

 
import { useAccount } from "./useAccount"; 



const AccountDetails = () => {
  
  const {
    formik,
    fileInput,
    imgSrc,
    fetching,
    updating,
    handleFileInputChange,
    handleFileInputReset,
    reduxUser
  } = useAccount();

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
          <Avatar
            alt={`${reduxUser?.firstName ?? ""} ${reduxUser?.lastName ?? ""}`}
            src={imgSrc}
            className="w-20 h-20 border-[3px] border-divider"
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
            {reduxUser.role === "user" && (

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
            )}
            {reduxUser.role === "user" && formik.values.passportStatus === "having" && (
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
            {reduxUser.role === "tac" && (
              <>
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
              </>
            )}
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