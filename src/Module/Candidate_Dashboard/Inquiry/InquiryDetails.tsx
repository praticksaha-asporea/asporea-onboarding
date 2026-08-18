"use client";

import { useRouter } from "next/navigation";

import { CircularProgress, Dialog, DialogContent } from "@mui/material";
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
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  Chip,
} from "@mui/material";
import ListSubheader from "@mui/material/ListSubheader";
import {
  useInquiry,
  inquirySteps,
} from "./useInquiry";
import { positionDBData } from "@/Types/object.types";

// ─── Local constants ──────────────────────────────────────────────────────
// Fields validated/submitted in each step. Adjust names to match your
// formik/inquiryValidationSchema field names exactly.
const STEP1_FIELDS = [
  "fullName",
  "email",
  "phoneNumber",
  "whatsappNumber",
  "inquiryCategory",
  "inquiryFor",
];

const STEP2_FIELDS = [
  "nationality",
  "latestAcademic",
  "latestTechnical",
  "workExperience",
  "referedFrom",
  "referedType",
  "referedBy",
  "otherReferedBy",
];

// ─── Component ────────────────────────────────────────────────────────────────

const InquiryDetails = () => {
  const router = useRouter();
  const {
    externalSources,
    preferences,
    isPreferenceError,
    submitting,
    showInquiryPopup,
    generatedInqNo,
    generatedLeadId,
    loadingSources,
    userData,
    handlePreferenceToggle,
    assignedTAC,
    formik,
    isFormDisabled,
    err,
    helperText,
    activeStepperStep,
    handleClosePopup,
    // selectedBranchName,
    categories,
    handleCategoryChange,
    positionData,
    formStep,
    inquiryId,
    creatingInquiry,
    updatingInquiry,
    handleCreateStep,
    handleUpdateStep,
    goBackToStep1,
    categoryOptions,
    getLocation,
    locationPermissionRequired
  } = useInquiry();

  const step1HasErrors = STEP1_FIELDS.some((f) => err(f));
  const step2HasErrors = STEP2_FIELDS.some((f) => err(f));

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">Generate inquiry</Typography>
              <Typography variant="subtitle1" className="pb-5">
                Step {formStep + 1} of 2 —{" "}
                {formStep === 0
                  ? "Basic details create the record"
                  : "Additional details update the record"}
              </Typography>

              {isFormDisabled && (
                <Box
                  className="mb-6 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"
                  style={{
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    borderColor: "rgba(25, 118, 210, 0.3)",
                  }}
                >
                  <Box className="flex items-center gap-3 text-left">
                    <Box className="w-14 h-14 rounded-full bg-[var(--mui-palette-primary-main)] flex items-center justify-center text-white shrink-0 shadow-sm">
                      <i className="ri-information-line text-xl" />
                    </Box>
                    <Box>
                      <Typography variant="h6" className="font-bold leading-tight">
                        Inquiry already submitted
                      </Typography>
                      <Typography variant="body2" className="mt-2 font-medium">
                        Please proceed to the pre-counselling section.
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    onClick={() => {
                      const existingLeadId = userData?.leadId || userData?.user?.leadId;
                      const existingVisitOption =
                        userData?.visitOption ?? userData?.user?.visitOption;
                      const existingConsultant =
                        userData?.prefferedConsultant || userData?.user?.prefferedConsultant;
                      const method = existingVisitOption === 2 ? "on" : "off";
                      router.push(
                        `/pre-counselling?leadId=${existingLeadId}&consultantId=${existingConsultant || ""}&method=${method}`,
                      );
                    }}
                    className="rounded-xl normal-case font-semibold px-5 py-2 shrink-0 shadow-none text-xs sm:text-sm"
                  >
                    Go to pre-counselling
                  </Button>
                </Box>
              )}

              {!isFormDisabled && (
                <>
                  {/* ── Compact step indicator ─────────────────────────── */}
                  <Stepper
                    activeStep={formStep}
                    alternativeLabel
                    className="mb-8"
                  >
                    <Step completed={formStep > 0}>
                      <StepLabel
                        optional={
                          formStep > 0 ? (
                            <Typography
                              variant="caption"
                              className="text-[var(--mui-palette-success-main)] font-medium"
                            >
                              Saved
                            </Typography>
                          ) : undefined
                        }
                      >
                        Basic details
                      </StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Additional details</StepLabel>
                    </Step>
                  </Stepper>

                  {formStep === 1 && generatedInqNo && (
                    <Chip
                      icon={<i className="ri-check-line" />}
                      label={`Inquiry created — ID ${generatedInqNo}`}
                      color="success"
                      variant="outlined"
                      className="mb-5"
                    />
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (formStep === 0) {
                        handleCreateStep();
                      } else {
                        handleUpdateStep();
                      }
                    }}
                  >
                    {/* ── Step 1: basic details (create) ─────────────────── */}
                    {formStep === 0 && (
                      <Card variant="outlined">
                        <CardContent className="mbe-5">
                          <Grid container spacing={5}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                name="fullName"
                                label="Full name"
                                value={formik.values.fullName}
                                // placeholder="Samson Wolf"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={err("fullName")}
                                helperText={helperText("fullName")}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                name="email"
                                label="Email address"
                                value={formik.values.email}
                                placeholder="name@email.com"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={err("email")}
                                helperText={helperText("email")}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                type="tel"
                                name="phoneNumber"
                                label="Phone number"
                                value={formik.values.phoneNumber}
                                placeholder="9876543210"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={err("phoneNumber")}
                                helperText={helperText("phoneNumber")}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                type="tel"
                                name="whatsappNumber"
                                label="WhatsApp number"
                                value={formik.values.whatsappNumber}
                                placeholder="9876543210"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={err("whatsappNumber")}
                                helperText={helperText("whatsappNumber")}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <FormControl fullWidth error={err("inquiryCategory")}>
                                <InputLabel id="inquiry-category-label">Inquiry For</InputLabel>

                                <Select
                                  labelId="inquiry-category-label"
                                  id="inquiry-category"
                                  name="inquiryCategory"
                                  value={formik.values.inquiryCategory || ""}
                                  onChange={(e) => handleCategoryChange(e.target.value)}
                                  label="Inquiry For"
                                  disabled={isFormDisabled}
                                  MenuProps={{
                                    PaperProps: {
                                      sx: {
                                        maxHeight: "calc(100vh - 250px)",
                                        "& .MuiListSubheader-root": {
                                          backgroundColor: "#f5f8fc",
                                          color: "#0054a6",
                                          fontWeight: 600,
                                          fontSize: "14px",
                                          lineHeight: "36px",
                                        },
                                        "& .inquiry-child": { paddingLeft: "32px", fontSize: "14px" },
                                        "& .inquiry-grandchild": { paddingLeft: "52px", fontSize: "14px" },
                                      },
                                    },
                                  }}
                                >
                                  {categoryOptions.map((option) =>
                                    option.kind === "header" ? (
                                      <ListSubheader key={option.key} sx={{ pl: option.level === 0 ? 2 : 4 }}>
                                        {option.label}
                                      </ListSubheader>
                                    ) : (
                                      <MenuItem
                                        key={option.key}
                                        value={option.value}
                                        className={option.level === 1 ? "inquiry-child" : option.level >= 2 ? "inquiry-grandchild" : ""}
                                      >
                                        {option.label}
                                      </MenuItem>
                                    ),
                                  )}
                                </Select>

                                {err("inquiryCategory") && <FormHelperText>{helperText("inquiryCategory")}</FormHelperText>}
                              </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                              <FormControl
                                fullWidth
                                error={err("inquiryFor")}
                                disabled={!formik.values.inquiryCategory}
                              >
                                <InputLabel id="inquiry-position-label">
                                  {formik.values.inquiryCategory ? "Select position" : "Select a category first"}
                                </InputLabel>
                                <Select
                                  labelId="inquiry-position-label"
                                  label={
                                    formik.values.inquiryCategory
                                      ? "Select position"
                                      : "Select a category first"
                                  }
                                  name="inquiryFor"
                                  value={formik.values.inquiryFor}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  MenuProps={{ PaperProps: { sx: { maxHeight: 400 } } }}
                                >
                                  {positionData &&
                                    positionData?.map((p: positionDBData) => (
                                      <MenuItem key={p._id} value={p._id}>
                                        {p?.title}
                                      </MenuItem>
                                    )
                                    )}
                                </Select>
                                {err("inquiryFor") && (
                                  <FormHelperText>{helperText("inquiryFor")}</FormHelperText>
                                )}
                              </FormControl>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    )}

                    {/* ── Step 2: additional details (update) ────────────── */}
                    {formStep === 1 && (
                      <Card variant="outlined">
                        <CardContent className="mbe-5">
                          <Grid container spacing={5}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <FormControl fullWidth error={err("nationality")}>
                                <InputLabel id="inquiry-nationality-label">Nationality</InputLabel>
                                <Select
                                  labelId="inquiry-nationality-label"
                                  label="Nationality"
                                  name="nationality"
                                  value={formik.values.nationality || ""}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
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

                            <Grid size={{ xs: 12, md: 6 }}>
                              <FormControl fullWidth error={err("latestAcademic")}>
                                <InputLabel id="inquiry-latestAcademic-label">
                                  Latest academic qualification
                                </InputLabel>
                                <Select
                                  labelId="inquiry-latestAcademic-label"
                                  label="Latest academic qualification"
                                  name="latestAcademic"
                                  value={formik.values.latestAcademic || ""}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                >
                                  <MenuItem value="secondary">Secondary</MenuItem>
                                  <MenuItem value="higher_secondary">Higher secondary</MenuItem>
                                  <MenuItem value="graduate">Graduate</MenuItem>
                                  <MenuItem value="post_graduate">Post graduate</MenuItem>
                                </Select>
                                {err("latestAcademic") && (
                                  <FormHelperText>{helperText("latestAcademic")}</FormHelperText>
                                )}
                              </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                name="latestTechnical"
                                label="Latest technical qualification"
                                value={formik.values.latestTechnical || ""}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={err("latestTechnical")}
                                helperText={helperText("latestTechnical")}
                              />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                name="workExperience"
                                label="Work experience"
                                value={formik.values.workExperience || ""}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={err("workExperience")}
                                helperText={helperText("workExperience")}
                              />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                              <FormControl fullWidth error={err("referedFrom")}>
                                <FormLabel component="legend">How did you hear about us?</FormLabel>
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
                                  <FormControlLabel value="web-app" control={<Radio />} label="Asporea website/app" />
                                  <FormControlLabel value="call" control={<Radio />} label="Tele caller" />
                                  <FormControlLabel value="social" control={<Radio />} label="Social media" />
                                  <FormControlLabel value="reffer" control={<Radio />} label="Referral" />
                                </RadioGroup>
                                {err("referedFrom") && (
                                  <FormHelperText>{helperText("referedFrom")}</FormHelperText>
                                )}
                              </FormControl>
                            </Grid>

                            {formik.values.referedFrom === "reffer" && (
                              <>
                                <Grid size={{ xs: 12, md: 12 }}>
                                  <FormControl fullWidth error={err("referedType")}>
                                    <FormLabel component="legend">Referred by</FormLabel>
                                    <RadioGroup
                                      row
                                      name="referedType"
                                      value={formik.values.referedType || ""}
                                      onChange={formik.handleChange}
                                    >
                                      <FormControlLabel value="pca" control={<Radio />} label="PCA" />
                                      <FormControlLabel value="pcra" control={<Radio />} label="PCRA" />
                                      <FormControlLabel value="institution" control={<Radio />} label="Institution" />
                                      <FormControlLabel value="other" control={<Radio />} label="Other" />
                                    </RadioGroup>
                                    {err("referedType") && (
                                      <FormHelperText>{helperText("referedType")}</FormHelperText>
                                    )}
                                  </FormControl>
                                </Grid>

                                {formik.values.referedType !== "other" && (
                                  <Grid size={{ xs: 12, md: 12 }}>
                                    <FormControl
                                      fullWidth
                                      disabled={loadingSources || formik.values.referedType === "other"}
                                      error={err("referedBy")}
                                    >
                                      <InputLabel>
                                        {loadingSources ? "Loading..." : "Name of referrer"}
                                      </InputLabel>
                                      <Select
                                        name="referedBy"
                                        label="Name of referrer"
                                        value={formik.values.referedBy}
                                        onChange={(e) => {
                                          formik.handleChange(e);
                                          if (e.target.value === "other") {
                                            formik.setFieldValue("referedType", "other");
                                          }
                                        }}
                                      >
                                        <MenuItem value="">
                                          <em>None</em>
                                        </MenuItem>
                                        {externalSources.map((src: any) => (
                                          <MenuItem key={src._id} value={src._id}>
                                            {src.name || `${src.firstName || ""} ${src.lastName || ""}`.trim()}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                      {err("referedBy") && (
                                        <FormHelperText>{helperText("referedBy")}</FormHelperText>
                                      )}
                                    </FormControl>
                                  </Grid>
                                )}

                                {formik.values.referedType === "other" && (
                                  <Grid size={{ xs: 12, md: 12 }}>
                                    <TextField
                                      fullWidth
                                      name="otherReferedBy"
                                      label="Referrer name"
                                      value={formik.values.otherReferedBy || ""}
                                      placeholder="John Singh"
                                      onChange={formik.handleChange}
                                      error={err("otherReferedBy")}
                                      helperText={helperText("otherReferedBy")}
                                    />
                                  </Grid>
                                )}
                              </>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    )}

                    <CardContent className="mbe-5 mt-4">
                      <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }} className="flex gap-4 flex-wrap justify-between">
                          {formStep === 1 ? (
                            <Button
                              variant="outlined"
                              onClick={goBackToStep1}
                              disabled={updatingInquiry}
                              className="rounded-xl normal-case text-sm"
                            >
                              Back
                            </Button>
                          ) : (
                            <span />
                          )}

                          <Button
                            variant="contained"
                            type="submit"
                            disabled={
                              formStep === 0
                                ? creatingInquiry || step1HasErrors || locationPermissionRequired
                                : updatingInquiry || step2HasErrors || locationPermissionRequired
                            }
                            className="rounded-xl normal-case text-sm shadow-md"
                          >
                            {creatingInquiry || updatingInquiry ? (
                              <CircularProgress size={24} color="inherit" />
                            ) : formStep === 0 ? (
                              "Save and continue"
                            ) : (
                              "Submit inquiry"
                            )}
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Right: Progress + Preferences ──────────────────────────────── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12 }}>
              <Card className="hidden md:block">
                <CardContent>
                  <Typography variant="h4" className="mb-5">
                    Application progress
                  </Typography>
                  <Stepper activeStep={activeStepperStep} orientation="vertical">
                    {inquirySteps.map((step, index) => (
                      <Step key={step.label}>
                        <StepLabel
                          optional={
                            index < activeStepperStep ? (
                              <Typography
                                variant="caption"
                                className="text-[var(--mui-palette-success-main)] text-[12px] font-bold"
                              >
                                Completed
                              </Typography>
                            ) : index === activeStepperStep ? (
                              <Typography
                                variant="caption"
                                className="text-[var(--mui-palette-primary-main)] text-[12px] font-bold"
                              >
                                Active
                              </Typography>
                            ) : (
                              <Typography variant="caption" className="text-[var(--mui-palette-text-secondary)] text-[12px]">
                                Pending
                              </Typography>
                            )
                          }
                        >
                          {step.label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact preferences only matters once the record exists,
               so it's tucked next to step 2 conceptually but can stay
               visible throughout — remove the formStep check to always show it. */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <FormControl className="mbs-4 mie-4" error={formik.submitCount > 0 && isPreferenceError}>
                    <Typography variant="h5" className="pb-5">
                      Contact preferences
                    </Typography>
                    <FormGroup>
                      <FormControlLabel
                        label="Receive updates via email"
                        control={
                          <Checkbox checked={preferences.email} onChange={() => handlePreferenceToggle("email")} />
                        }
                      />
                      <FormControlLabel
                        label="Receive updates via WhatsApp"
                        control={
                          <Checkbox checked={preferences.whatsapp} onChange={() => handlePreferenceToggle("whatsapp")} />
                        }
                      />
                      <FormControlLabel
                        label="Receive updates via SMS"
                        control={
                          <Checkbox checked={preferences.sms} onChange={() => handlePreferenceToggle("sms")} />
                        }
                      />
                    </FormGroup>
                    <FormHelperText className="pt-3" error={formik.submitCount > 0 && isPreferenceError}>
                      {formik.submitCount > 0 && isPreferenceError
                        ? "Choose at least one preference to proceed"
                        : null}
                    </FormHelperText>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Dialog
        open={locationPermissionRequired}>
        <DialogContent className="text-center p-8">
          <Typography variant="h4" className="mt-4">
            Location permission required
          </Typography>
          <Typography variant="body1" className="mt-2 mb-8">
            Please allow location permission to continue
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={getLocation}
          >
            Allow location
          </Button>
        </DialogContent>
      </Dialog>
      {/* ── Confirmation Dialog (unchanged) ──────────────────────────────  */}
      <Dialog
        open={showInquiryPopup}
        onClose={(_e, reason) => {
          if (reason !== "backdropClick") {
            handleClosePopup();
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent className="text-center p-8">
          <Typography variant="h4" className="mt-4">
            Inquiry submitted
          </Typography>
          <Typography variant="h6" className="mt-2 mb-8" color="primary">
            ID: {generatedInqNo}
          </Typography>

          <Box className="mb-8">
            {/* {formik.values.prefferedConsultant || assignedTAC != null ? (
              formik.values.visitOption === 0 ? (
                <Typography variant="body1" className="mb-4 leading-loose text-red-500 font-normal">
                  As you are now inside our <span className="underline">{selectedBranchName}</span> branch.
                  <br />
                  Be ready for pre-counselling.
                </Typography>
              ) : formik.values.visitOption === 1 ? (
                <Typography variant="body1" className="mb-4 text-red-500 leading-loose font-normal">
                  As you are visiting our{" "}
                  <span className="underline font-bold">{selectedBranchName}</span> branch.
                  <br />
                  For pre-counselling, please reach the FOE (front office executive).
                </Typography>
              ) : (
                <Typography variant="body1" className="mb-4">
                  You are assigned to a talent acquisition consultant (TAC).
                  <br />
                  Be ready for pre-counselling.
                </Typography>
              )
            ) : (
              <Typography variant="body1" className="mb-4 leading-loose text-red-500 font-normal">
                As you&apos;re in <span className="font-bold">{selectedBranchName}</span> branch.
                <br />
                For pre-counselling, please reach the FOE (front office executive).
                <br />
                The FOE will generate a token on your behalf.
              </Typography>
            )}

            {formik.values.prefferedConsultant ? (
              <Button
                variant="contained"
                className="normal-case rounded-[50px] py-[9.6px] px-10"
                href={`/pre-counselling?leadId=${generatedLeadId}&consultantId=${formik.values.prefferedConsultant}&method=${formik.values.visitOption === 2 ? "on" : "off"}`}
              >
                Schedule pre-counselling
              </Button>
            ) : ( */}
            <Button
              variant="contained"
              className="normal-case rounded-[50px] py-[9.6px] px-10"
              onClick={handleClosePopup}
            >
              Close
            </Button>
            {/* )} */}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InquiryDetails;