"use client";

import Grid from "@mui/material/Grid";
import Cropper from "react-easy-crop";
import { useState, ChangeEvent } from "react";
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
import { Avatar, Dialog, Box, IconButton, Slider, FormHelperText } from "@mui/material";
import toast from "react-hot-toast";
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
    reduxUser,
    setFileInput,
    setImgSrc,
  } = useAccount();

  const [openPreview, setOpenPreview] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  if (fetching) {
    return (
      <Card className="flex justify-center items-center h-64">
        <CircularProgress />
        <Typography className="ml-4">Loading Profile Data...</Typography>
      </Card>
    );
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 800 * 1024) {
        toast.error("File is too large! Max allowed size is 800KB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setTempImageSrc(reader.result as string);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = async () => {
    try {
      const image = new Image();
      image.src = tempImageSrc!;
      await new Promise((resolve) => (image.onload = resolve));

      const canvas = document.createElement("canvas");
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      );

      const croppedBase64 = canvas.toDataURL("image/jpeg");
      setImgSrc(croppedBase64);
      setFileInput(croppedBase64);
      setCropModalOpen(false);
      toast.success("Image cropped successfully!");
    } catch (err) {
      toast.error("Failed to crop image.");
    }
  };

  const useOriginalImg = () => {
    setImgSrc(tempImageSrc!);
    setFileInput(tempImageSrc!);
    setCropModalOpen(false);
    toast.success("Original image selected!");
  };


  return (
    <Card>
      <CardContent className="mbe-5">
        <div className="flex max-sm:flex-col items-center gap-6">
          <Avatar
            alt={`${reduxUser?.firstName ?? ""} ${reduxUser?.lastName ?? ""}`}
            src={imgSrc}
            onClick={() => setOpenPreview(true)}
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
                  accept="image/png, image/jpeg"
                  onChange={onFileChange}
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
            {fileInput && fileInput.startsWith("data:image") && !updating && (
              <Typography
                variant="body2"
                className="flex items-center gap-1 text-[var(--mui-palette-success-main)] font-medium animate-pulse mt-1"
              >
                <i className="ri-information-fill text-lg" />
                Profile picture updated in preview. Click "Save Changes" to
                apply the changes.
              </Typography>
            )}
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
            {reduxUser.role === "user" &&
              formik.values.passportStatus === "having" && (
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
            {reduxUser.role === "user" && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl
                    fullWidth
                    error={formik.touched.academic && Boolean(formik.errors.academic)}
                  >
                    <InputLabel id="academic-label">Academic Qualification</InputLabel>
                    <Select
                      labelId="academic-label"
                      id="academic"
                      name="academic"
                      label="Academic Qualification"
                      value={formik.values.academic || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <MenuItem value="secondary">Secondary</MenuItem>
                      <MenuItem value="higher_secondary">Higher secondary</MenuItem>
                      <MenuItem value="graduate">Graduate</MenuItem>
                      <MenuItem value="post_graduate">Post graduate</MenuItem>
                    </Select>
                    {formik.touched.academic && formik.errors.academic && (
                      <FormHelperText>{formik.errors.academic as string}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="technicalQualification"
                    name="technicalQualification"
                    label="Technical Qualification"
                    placeholder="e.g. MERN Stack Certification, AWS Associate"
                    value={formik.values.technicalQualification}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="nationality-label">Nationality</InputLabel>
                    <Select
                      labelId="nationality-label"
                      id="nationality"
                      name="nationality"
                      label="Nationality"
                      value={formik.values.nationality || ""}
                      onChange={(e) =>
                        formik.setFieldValue("nationality", e.target.value)
                      }
                      onBlur={formik.handleBlur}
                    >
                      <MenuItem value="indian">Indian</MenuItem>
                      <MenuItem value="nepalese">Nepalese</MenuItem>
                      <MenuItem value="bhutanese">Bhutanese</MenuItem>
                      <MenuItem value="tibetan">Tibetan</MenuItem>
                      <MenuItem value="bangladeshi">Bangladeshi</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    id="workExp"
                    name="workExp"
                    label="Work Experience Summary"
                    placeholder="Describe prior roles & responsibilities..."
                    value={formik.values.workExp}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
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
                {/* 1. Designation */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="designation"
                    name="designation"
                    label="Designation"
                    value={formik.values.designation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>
                {/* 2. Experience in Months */}
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
                {/* 3. Areas of Experience (Comma Separated) */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="areasOfExp"
                    name="areasOfExp"
                    label="Areas Of Experience (Comma separated)"
                    placeholder="e.g. Frontend, Backend, UI/UX"
                    value={formik.values.areasOfExp}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    id="industryExp"
                    name="industryExp"
                    label="Industry Experience (Comma separated)"
                    placeholder="e.g. EdTech, IT Services, Finance"
                    value={formik.values.industryExp}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="languagesKnown-label">
                      Languages Known
                    </InputLabel>
                    <Select
                      labelId="languagesKnown-label"
                      id="languagesKnown"
                      name="languagesKnown"
                      multiple
                      label="Languages Known"
                      value={formik.values.languagesKnown || []}
                      onChange={(e) =>
                        formik.setFieldValue("languagesKnown", e.target.value)
                      }
                    >
                      <MenuItem value="English">English</MenuItem>
                      <MenuItem value="Hindi">Hindi</MenuItem>
                      <MenuItem value="Spanish">Spanish</MenuItem>
                      <MenuItem value="French">French</MenuItem>
                      <MenuItem value="German">German</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="mode-label">Availability Method</InputLabel>
                    <Select
                      labelId="mode-label"
                      id="mode"
                      name="mode"
                      label="Availability Method"
                      value={formik.values.mode}
                      onChange={(e) =>
                        formik.setFieldValue("mode", e.target.value)
                      }
                    >
                      <MenuItem value="online">Online</MenuItem>
                      <MenuItem value="offline">Offline</MenuItem>
                      <MenuItem value="both">Both</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    id="specialization"
                    name="specialization"
                    label="Specializations (Comma separated)"
                    placeholder="e.g. React.js, Node.js, MERN Architecture"
                    value={formik.values.specialization}
                    onChange={formik.handleChange}
                  />
                </Grid>
                {/* <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    id="experienceInMonths"
                    name="experienceInMonths"
                    label="Experience (in months)"
                    value={formik.values.experienceInMonths}
                    onChange={formik.handleChange}
                  />
                </Grid> */}

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
      <Dialog
        open={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 4, textCenter: "center" }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Adjust Profile Picture
          </Typography>

          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: 300,
              backgroundColor: "#333",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {tempImageSrc && (
              <Cropper
                image={tempImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
              />
            )}
          </Box>

          <Box sx={{ mt: 2, px: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Zoom Control
            </Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(_, v) => setZoom(v as number)}
              size="small"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyBetween: "space-between",
              mt: 4,
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={useOriginalImg}
              fullWidth
            >
              Skip & Use Original
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={getCroppedImg}
              fullWidth
            >
              Crop & Save
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
            overflow: "visible",
          },
        }}
      >
        <Box sx={{ position: "relative", p: 1 }}>
          <IconButton
            onClick={() => setOpenPreview(false)}
            sx={{
              position: "absolute",
              top: -15,
              right: -15,
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "#fff",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
            }}
            size="small"
          >
            <i className="ri-close-line text-xl" />
          </IconButton>
          <img
            src={imgSrc}
            alt="Full view"
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              borderRadius: "16px",
              border: "4px solid #fff",
              boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            }}
          />
        </Box>
      </Dialog>
    </Card>
  );
};

export default AccountDetails;
