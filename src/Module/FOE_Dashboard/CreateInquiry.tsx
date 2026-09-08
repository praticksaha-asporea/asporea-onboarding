"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import { useTheme, lighten, IconButton, InputAdornment } from "@mui/material";
import { MuiOtpInput } from "mui-one-time-password-input";
import { LoadCanvasTemplate } from "react-simple-captcha";

import { useCreateInquiry } from "./useCreateInquiry";
import { positionDBData } from "@/Types/object.types";
interface CreateInquiryProps {
  onSuccess?: () => void;
}
const CreateInquiry: React.FC<CreateInquiryProps> = ({ onSuccess }) => {
  const {
    formik,
    err,
    helperText,
    otpSent,
    setOtpSent,
    otp,
    setOtp,
    sendingOtp,
    submitting,
    categoryOptions,
    positionData,
    handleCategoryChange,
    externalSources,
    loadingSources,
  } = useCreateInquiry(onSuccess);
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const bgGradient = `linear-gradient(270deg, var(--mui-palette-primary-main), ${lighten(theme.palette.primary.main, 0.5)} 100%)`;
  return (
    <Box className="max-w-5xl mx-auto p-4 md:p-6">
      <Card className="rounded-2xl  shadow-2xl">
        <Box
          className="p-6 md:p-8 text-center"
          style={{ background: bgGradient }}
        >
          <Typography
            variant="h4"
            className="font-medium text-[var(--mui-palette-common-white)] mb-2"
          >
            Add Candidate & Generate inquiry
          </Typography>
          <Typography
            variant="body2"
            className="text-[var(--mui-palette-common-white)]"
          >
            Enter candidate details. Candidate will receive an OTP to complete
            verification.
          </Typography>
        </Box>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={4}>
              {/* STEP 1: BASIC DETAILS */}
              <Grid size={{ xs: 12 }}>
                <Box
                  className="p-3 px-8 rounded-xl  mb-2 w-fit mx-auto text-center"
                  style={{ background: bgGradient }}
                >
                  <Typography
                    className="font-medium text-[var(--mui-palette-common-white)]

  "
                  >
                    Step 1: Basic & Contact Details
                  </Typography>
                </Box>
              </Grid>

              {/* Full Name */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name="fullName"
                  label="Full Name"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={err("fullName")}
                  helperText={helperText("fullName")}
                />
              </Grid>

              {/* Email Address */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email Address"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={err("email")}
                  helperText={helperText("email")}
                />
              </Grid>

              {/* Phone Number */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name="phoneNumber"
                  label="Phone Number"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={err("phoneNumber")}
                  helperText={helperText("phoneNumber")}
                />
              </Grid>

              {/* WhatsApp Number */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name="whatsappNumber"
                  label="WhatsApp Number"
                  value={formik.values.whatsappNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={err("whatsappNumber")}
                  helperText={helperText("whatsappNumber")}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={err("password")}
                  helperText={helperText("password")}
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          <i
                            className={
                              showPassword ? "ri-eye-off-line" : "ri-eye-line"
                            }
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {/* Inquiry Category Select */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={err("inquiryCategory")}>
                  <InputLabel id="foe-category-label">Inquiry For</InputLabel>
                  <Select
                    labelId="foe-category-label"
                    id="foe-category"
                    name="inquiryCategory"
                    label="Inquiry For"
                    value={formik.values.inquiryCategory || ""}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    {categoryOptions.map((option) =>
                      option.kind === "header" ? (
                        <ListSubheader
                          key={option.key}
                          sx={{ pl: option.level === 0 ? 2 : 4 }}
                        >
                          {option.label}
                        </ListSubheader>
                      ) : (
                        <MenuItem
                          key={option.key}
                          value={option.value}
                          sx={{
                            pl:
                              option.level === 1
                                ? 4
                                : option.level >= 2
                                  ? 6
                                  : 2,
                          }}
                        >
                          {option.label}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                  {err("inquiryCategory") && (
                    <FormHelperText>
                      {helperText("inquiryCategory")}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Inquiry Position Select */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl
                  fullWidth
                  error={err("inquiryFor")}
                  disabled={!formik.values.inquiryCategory}
                >
                  <InputLabel id="foe-position-label">
                    {formik.values.inquiryCategory
                      ? "Select Position"
                      : "Select Category First"}
                  </InputLabel>
                  <Select
                    labelId="foe-position-label"
                    id="foe-position"
                    name="inquiryFor"
                    label={
                      formik.values.inquiryCategory
                        ? "Select Position"
                        : "Select Category First"
                    }
                    value={formik.values.inquiryFor || ""}
                    onChange={formik.handleChange}
                  >
                    {Array.isArray(positionData) &&
                      positionData.map((p: positionDBData) => (
                        <MenuItem key={p._id} value={p._id}>
                          {p.title}
                        </MenuItem>
                      ))}
                  </Select>
                  {err("inquiryFor") && (
                    <FormHelperText>{helperText("inquiryFor")}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Passport Status */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={err("passportStatus")}>
                  <InputLabel id="foe-passport-label">
                    Passport Status
                  </InputLabel>
                  <Select
                    labelId="foe-passport-label"
                    id="foe-passport"
                    name="passportStatus"
                    label="Passport Status"
                    value={formik.values.passportStatus || "not"}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (e.target.value !== "having")
                        formik.setFieldValue("passportNo", "");
                    }}
                  >
                    <MenuItem value="not">Not Having</MenuItem>
                    <MenuItem value="applied">Applied</MenuItem>
                    <MenuItem value="having">Having</MenuItem>
                  </Select>
                  {err("passportStatus") && (
                    <FormHelperText>
                      {helperText("passportStatus")}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Passport Number (If having) */}
              {formik.values.passportStatus === "having" && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    name="passportNo"
                    label="Passport Number"
                    value={formik.values.passportNo || ""}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "passportNo",
                        e.target.value.toUpperCase(),
                      )
                    }
                    error={err("passportNo")}
                    helperText={helperText("passportNo")}
                  />
                </Grid>
              )}

              {/* STEP 2: ADDITIONAL DETAILS */}
              <Grid size={{ xs: 12 }} className="mt-4">
                <Divider className="mb-4" />
                <Box
                  className="p-3 px-8 rounded-xl   mb-2 w-fit mx-auto text-center"
                  style={{ background: bgGradient }}
                >
                  <Typography className="font-medium text-white">
                    Step 2: Qualifications & Referral Details
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={err("nationality")}>
                  <InputLabel id="foe-nationality-label">
                    Nationality
                  </InputLabel>
                  <Select
                    labelId="foe-nationality-label"
                    id="foe-nationality"
                    name="nationality"
                    label="Nationality"
                    value={formik.values.nationality || ""}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="indian">Indian</MenuItem>
                    <MenuItem value="nepalese">Nepalese</MenuItem>
                    <MenuItem value="bhutanese">Bhutanese</MenuItem>
                    <MenuItem value="tibetan">Tibetan</MenuItem>
                    <MenuItem value="bangladeshi">Bangladeshi</MenuItem>
                  </Select>
                  {err("nationality") && (
                    <FormHelperText>{helperText("nationality")}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Latest Academic */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={err("latestAcademic")}>
                  <InputLabel id="foe-academic-label">
                    Latest Academic Qualification
                  </InputLabel>
                  <Select
                    labelId="foe-academic-label"
                    id="foe-academic"
                    name="latestAcademic"
                    label="Latest Academic Qualification"
                    value={formik.values.latestAcademic || ""}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="secondary">Secondary</MenuItem>
                    <MenuItem value="higher_secondary">
                      Higher Secondary
                    </MenuItem>
                    <MenuItem value="graduate">Graduate</MenuItem>
                    <MenuItem value="post_graduate">Post Graduate</MenuItem>
                  </Select>
                  {err("latestAcademic") && (
                    <FormHelperText>
                      {helperText("latestAcademic")}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Technical Qualification */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name="latestTechnical"
                  label="Latest Technical Qualification"
                  value={formik.values.latestTechnical || ""}
                  onChange={formik.handleChange}
                />
              </Grid>

              {/* Work Experience */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="workExperience"
                  label="Work Experience"
                  value={formik.values.workExperience || ""}
                  onChange={formik.handleChange}
                />
              </Grid>

              {/* How did you hear about us? */}
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth error={err("referedFrom")}>
                  <FormLabel
                    component="legend"
                    className="font-semibold text-sm mb-2"
                  >
                    How did you hear about us?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="referedFrom"
                    value={formik.values.referedFrom}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (e.target.value !== "reffer") {
                        formik.setFieldValue("referedType", "");
                        formik.setFieldValue("referedBy", "");
                        formik.setFieldValue("otherReferedBy", "");
                      }
                    }}
                  >
                    <FormControlLabel
                      value="web-app"
                      control={<Radio />}
                      label="Asporea website/app"
                    />
                    <FormControlLabel
                      value="call"
                      control={<Radio />}
                      label="Tele caller"
                    />
                    <FormControlLabel
                      value="social"
                      control={<Radio />}
                      label="Social media"
                    />
                    <FormControlLabel
                      value="reffer"
                      control={<Radio />}
                      label="Referral"
                    />
                  </RadioGroup>
                  {err("referedFrom") && (
                    <FormHelperText>{helperText("referedFrom")}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Referral Type Section */}
              {formik.values.referedFrom === "reffer" && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth error={err("referedType")}>
                      <FormLabel
                        component="legend"
                        className="font-semibold text-sm mb-2"
                      >
                        Referred By Type
                      </FormLabel>
                      <RadioGroup
                        row
                        name="referedType"
                        value={formik.values.referedType || ""}
                        onChange={(e) => {
                          formik.handleChange(e);
                          formik.setFieldValue("referedBy", "");
                        }}
                      >
                        <FormControlLabel
                          value="pca"
                          control={<Radio />}
                          label="PCA"
                        />
                        <FormControlLabel
                          value="pcra"
                          control={<Radio />}
                          label="PCRA"
                        />
                        <FormControlLabel
                          value="institution"
                          control={<Radio />}
                          label="Institution"
                        />
                        <FormControlLabel
                          value="other"
                          control={<Radio />}
                          label="Other"
                        />
                      </RadioGroup>
                      {err("referedType") && (
                        <FormHelperText>
                          {helperText("referedType")}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {formik.values.referedType !== "other" &&
                    formik.values.referedType !== "" && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl
                          fullWidth
                          error={err("referedBy")}
                          disabled={loadingSources}
                        >
                          <InputLabel id="foe-referrer-label">
                            {loadingSources
                              ? "Loading Sources..."
                              : "Name of Referrer"}
                          </InputLabel>
                          <Select
                            labelId="foe-referrer-label"
                            id="foe-referrer"
                            name="referedBy"
                            label={
                              loadingSources
                                ? "Loading Sources..."
                                : "Name of Referrer"
                            }
                            value={formik.values.referedBy || ""}
                            onChange={formik.handleChange}
                          >
                            {externalSources.map((src: any) => (
                              <MenuItem key={src._id} value={src._id}>
                                {src.name ||
                                  `${src.firstName || ""} ${src.lastName || ""}`.trim()}
                              </MenuItem>
                            ))}
                          </Select>
                          {err("referedBy") && (
                            <FormHelperText>
                              {helperText("referedBy")}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                    )}

                  {formik.values.referedType === "other" && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        name="otherReferedBy"
                        label="Referrer Details / Name"
                        value={formik.values.otherReferedBy || ""}
                        onChange={formik.handleChange}
                        error={err("otherReferedBy")}
                        helperText={helperText("otherReferedBy")}
                      />
                    </Grid>
                  )}
                </>
              )}
              {!otpSent && (
                <Grid size={{ xs: 12 }}>
                  <Divider className="my-2" />
                  <Box className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4">
                    <Box className="flex items-center justify-center [&_div]:flex [&_div]:items-center [&_div]:gap-2.5 dark:[&_canvas]:invert dark:[&_canvas]:hue-rotate-180 dark:[&_a]:text-blue-400 dark:[&_a]:text-lg">
                      <LoadCanvasTemplate
                        reloadText="↻"
                        reloadColor="#125da3"
                      />
                    </Box>

                    {/* Google Search Bar Styled Compact TextField */}
                    <Box className="flex flex-col">
                      <TextField
                        size="small"
                        name="captchaValue"
                        placeholder="Enter Captcha"
                        value={formik.values.captchaValue}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={err("captchaValue")}
                        helperText={helperText("captchaValue")}
                        autoComplete="off"
                        sx={{
                          width: { xs: "100%", sm: "210px" },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "99px",
                            backgroundColor:
                              "var(--mui-palette-background-paper)",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                            transition: "all 0.2s ease-in-out",
                            "& fieldset": {
                              border: "none",
                            },
                            "&:hover fieldset": {
                              border: "none",
                            },
                            "&.Mui-focused fieldset": {
                              border: "none",
                              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                            },
                          },
                          "& .MuiFormHelperText-root": {
                            marginLeft: "14px",
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* OTP Section */}
            <Box className="mt-10 p-6 rounded-2xl flex flex-col items-center justify-center">
              {!otpSent ? (
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={sendingOtp}
                  className="px-10 py-3 rounded-full  text-base font-medium  normal-case"
                  style={{ background: bgGradient }}
                >
                  {sendingOtp ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Send OTP to Candidate"
                  )}
                </Button>
              ) : (
                <Box className="w-full max-w-md flex flex-col items-center gap-4">
                  <Typography
                    className="text-center font-medium text-[var(--mui-palette-success-main)]
 flex items-center gap-2"
                  >
                    <i className="ri-checkbox-circle-fill text-xl" />
                    OTP sent to candidate's phone/email
                  </Typography>
                  <Box className="w-full max-w-sm my-2">
                    <MuiOtpInput
                      value={otp}
                      onChange={(newValue) => setOtp(newValue)}
                      length={6}
                      autoFocus
                    />
                  </Box>

                  <Box className="flex gap-3 w-full mt-2">
                    <Button
                      className="flex-1 normal-case shadow-2xl bg-[var(--mui-palette-warning-main)] text-white rounded-xl"
                      onClick={() => setOtpSent(false)}
                      disabled={submitting}
                    >
                      Resend / Edit Form
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="success"
                      className="flex-1 normal-case bg-[var(--mui-palette-success-main)] rounded-xl font-medium"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <CircularProgress size={22} color="inherit" />
                      ) : (
                        "Verify & Create"
                      )}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateInquiry;
