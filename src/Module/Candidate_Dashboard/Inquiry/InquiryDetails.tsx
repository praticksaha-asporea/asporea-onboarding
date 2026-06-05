"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Dialog, DialogContent, CircularProgress } from "@mui/material";
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
import { getJourneyTimelineAction } from "@/Services/APIs/Assessment/assessment.actions";
import {
  Box,
  capitalize,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Step,
  StepContent,
  StepLabel,
  Stepper,
} from "@mui/material";

import {
  useInquiry,
  inquiryValidationSchema,
  inquirySteps,
  makeFieldHelpers,
} from "./useInquiry";

// ─── Component ────────────────────────────────────────────────────────────────

const InquiryDetails = () => {
  const router = useRouter();
  const {
    branches,
    consultants,
    externalSources,
    preferences,
    isPreferenceError,
    submitting,
    showInquiryPopup,
    setShowInquiryPopup,
    generatedInqNo,
    generatedLeadId,
    loadingConsultants,
    loadingSources,
    userData,
    fetchConsultants,
    fetchExternalSources,
    handlePreferenceToggle,
    handleSubmit,
    getInitialValues,
    assignedTAC
  } = useInquiry();

  const [hasExistingData, setHasExistingData] = useState(false);
const [activeStepperStep, setActiveStepperStep] = useState<number>(0);  

useEffect(() => {
    const fetchRealProgress = async () => {
      const existingLeadId = userData?.leadId || userData?.user?.leadId;
      
      if (!existingLeadId) {
        setActiveStepperStep(0);  
        return;
      }

      try {
        
        const res = await getJourneyTimelineAction(existingLeadId);
        if (res?.success && res?.data) {
           
           setActiveStepperStep(res.data.activeStep);
        } else {
           setActiveStepperStep(1);  
        }
      } catch (error) {
        console.error("Failed to sync actual stepper progress:", error);
        setActiveStepperStep(1);
      }
    };

    fetchRealProgress();
  }, [userData?.leadId]);
 

  useEffect(() => {
    const existingLeadId = userData?.leadId || userData?.user?.leadId;

    if (existingLeadId) {
      
      setHasExistingData(true);

      
       
    }
  }, [userData]);  

  const formik = useFormik({
    initialValues: getInitialValues(),
    enableReinitialize: true,
    validationSchema: inquiryValidationSchema,
    onSubmit: (values, { setSubmitting }) => {
      handleSubmit(values, setSubmitting);
    },
  });

  useEffect(() => {
    fetchConsultants(formik.values.prefferedBranch);
    formik.setFieldValue("prefferedConsultant", "");
  }, [formik.values.prefferedBranch]);

  useEffect(() => {
    if (!formik.values.referedType) return;

    fetchExternalSources(
      formik.values.referedType,
      formik.setFieldValue
    );
  }, [formik.values.referedType]);

  const selectedBranchName =
    (branches as any[]).find((b) => b._id === formik.values.prefferedBranch)
      ?.title || "our branch";

  const { err, helperText } = makeFieldHelpers(
    formik.errors as Record<string, any>,
    formik.submitCount,
  );
  const isFormDisabled = hasExistingData || generatedInqNo !== "";
  const currentStepperStep = isFormDisabled ? 1 : 0;
  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">Generate Inquiry</Typography>
              <Typography variant="subtitle1" className="pb-5">
                Please fill out the form below to register an inquiry
              </Typography>

              <form onSubmit={formik.handleSubmit}>
                 
                {isFormDisabled && (
                  <Box
                    className="mb-6 p-4 rounded-xl bg-[var(--mui-palette-primary-dark)]   flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in"
                    style={{
                      backgroundColor: "rgba(25, 118, 210, 0.08)",
                      borderColor: "rgba(25, 118, 210, 0.3)",
                    }}
                  >
                    <Box className="flex items-center gap-3 text-left">
                      <Box className="w-14 h-14 rounded-full  bg-[var(--mui-palette-primary)] flex items-center justify-center text-[var(--mui-palette-text-secondary)] shrink-0 shadow-sm">
                        <i className="ri-information-line text-xl"></i>
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          className="font-bold text-[var(--mui-palette-text-primary)] leading-tight"
                        >
                          Inquiry Already Submitted!
                        </Typography>
                        <Typography
                          variant="body2"
                          className="text-[var(--mui-palette-text-primary)] mt-2 font-medium  "
                        >
                             Please proceed to the Pre-Counselling section.
                        </Typography>
                      </Box>
                    </Box>

                    
                    <Button
                      variant="contained"
                      onClick={() => {
                        const existingLeadId =
                          userData?.leadId || userData?.user?.leadId;
                        const existingVisitOption =
                          userData?.visitOption ?? userData?.user?.visitOption;
                        const existingConsultant =
                          userData?.prefferedConsultant ||
                          userData?.user?.prefferedConsultant;
                        const method = existingVisitOption === 2 ? "on" : "off";

                        router.push(
                          `/pre-counselling?leadId=${existingLeadId}&consultantId=${existingConsultant || ""}&method=${method}`,
                        );
                      }}
                      className="rounded-xl normal-case bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 shrink-0 shadow-none text-xs sm:text-sm"
                    >
                      Go to Pre-Counselling
                    </Button>
                  </Box>
                )}

                <div
                  className={`transition-all duration-500 ease-in-out ${
                    isFormDisabled
                      ? "blur-[2.5px] opacity-60 pointer-events-none select-none"
                      : ""
                  }`}
                >
                  <Card>
                    <CardContent className="mbe-5">
                      <Grid container spacing={5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            name="fullName"
                            label="Full Name"
                            value={formik.values.fullName}
                            placeholder="Kunal Chettri"
                            onChange={formik.handleChange}
                            disabled={isFormDisabled}
                            error={err("fullName")}
                            helperText={helperText("fullName")}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            name="email"
                            label="Email Address"
                            value={formik.values.email}
                            placeholder="kunal.chettri@gmail.com"
                            onChange={formik.handleChange}
                            disabled={isFormDisabled}
                            error={err("email")}
                            helperText={helperText("email")}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            type="tel"
                            name="phoneNumber"
                            label="Phone Number"
                            value={formik.values.phoneNumber}
                            placeholder="9876543210"
                            onChange={formik.handleChange}
                            disabled={isFormDisabled}
                            error={err("phoneNumber")}
                            helperText={helperText("phoneNumber")}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            type="tel"
                            name="whatsappNumber"
                            label="WhatsApp Number"
                            value={formik.values.whatsappNumber}
                            placeholder="9876543210"
                            onChange={formik.handleChange}
                            disabled={isFormDisabled}
                            error={err("whatsappNumber")}
                            helperText={helperText("whatsappNumber")}
                          />
                        </Grid>

                        {/* Branch */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControl fullWidth error={err("prefferedBranch")}>
                            <InputLabel>Preferred Branch</InputLabel>
                            <Select
                              label="Preferred Branch"
                              name="prefferedBranch"
                              value={formik.values.prefferedBranch}
                              onChange={formik.handleChange}
                              disabled={isFormDisabled}
                            >
                              {branches.map((branch: any, index: number) => (
                                <MenuItem key={branch._id} value={branch._id}>
                                  {branch.title}
                                  {branch.distanceKm !== undefined &&
                                    ` (${index === 0 ? "Recommend - " : ""}${
                                      branch.distanceKm < 1
                                        ? "Within 1 Km"
                                        : `${branch.distanceKm.toFixed(2)} Km`
                                    })`}
                                </MenuItem>
                              ))}
                            </Select>

                            {err("prefferedBranch") && (
                              <FormHelperText>
                                {helperText("prefferedBranch")}
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Grid>

                        {/* Consultant */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControl
                            fullWidth
                            disabled={
                              loadingConsultants ||
                              !formik.values.prefferedBranch
                            }
                            error={err("prefferedConsultant")}
                          >
                            <InputLabel>
                              {loadingConsultants
                                ? "Loading..."
                                : "Preferred Consultant"}
                            </InputLabel>
                            <Select
                              name="prefferedConsultant"
                              label="Preferred Consultant"
                              value={formik.values.prefferedConsultant}
                              onChange={formik.handleChange}
                              disabled={isFormDisabled}
                            >
                              <MenuItem value="">
                                <em>None (No Consultant)</em>
                              </MenuItem>
                              {consultants.length === 0 ? (
                                <MenuItem value="" disabled>
                                  No TAC found
                                </MenuItem>
                              ) : (
                                consultants.map((tac) => (
                                  <MenuItem key={tac._id} value={tac._id} disabled={isFormDisabled}>
                                    {`${tac.firstName} ${tac.lastName}`}
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                            {err("prefferedConsultant") && (
                              <FormHelperText>
                                {helperText("prefferedConsultant")}
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Grid>

                        {/* Visit Option */}
                        <Grid size={{ xs: 12 }}>
                          <FormControl fullWidth error={err("visitOption")}>
                            <RadioGroup
                              name="visitOption"
                              value={Number(formik.values.visitOption)}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  "visitOption",
                                  Number(e.target.value),
                                )
                              }
                            >
                              <FormControlLabel
                                value={0}
                                control={<Radio />}
                                label="Are you currently now in this branch? (Only use while you are in branch premises)"
                                disabled={isFormDisabled}
                              />
                              <FormControlLabel
                                value={1}
                                control={<Radio />}
                                label="Are you visiting this branch? (Only use while you are outside and willing to visit in-person)"
                                disabled={isFormDisabled}
                              />
                              <FormControlLabel
                                value={2}
                                control={<Radio />}
                                label="Want to visit online rather than in-person branch visit"
                                disabled={isFormDisabled}
                              />
                            </RadioGroup>
                            <FormHelperText className="py-2">
                              NOTE: Online Schedule you can choose from next
                              screen, if you have a preferred consultant.
                            </FormHelperText>
                          </FormControl>
                        </Grid>

                        {/* Address */}
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            name="fullAddress"
                            label="Full Address"
                            value={formik.values.fullAddress}
                            placeholder={`123 Talent Lane, Darjeeling,\nWest Bengal,\n700001`}
                            multiline
                            rows={3}
                            onChange={formik.handleChange}
                            disabled={isFormDisabled}
                            error={err("fullAddress")}
                            helperText={helperText("fullAddress")}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Referral */}

                  <Card className="mt-5">
                    <CardContent className="mbe-5">
                      <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                          <FormControl fullWidth error={err("referedFrom")}>
                            <FormLabel component="legend">
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
                                label="Asporea Website/App"
                                disabled={isFormDisabled}
                              />
                              <FormControlLabel
                                value="call"
                                control={<Radio />}
                                label="Tele Caller"
                                disabled={isFormDisabled}
                              />
                              <FormControlLabel
                                value="social"
                                control={<Radio />}
                                label="Social Media"
                                disabled={isFormDisabled}
                              />
                              <FormControlLabel
                                value="reffer"
                                control={<Radio />}
                                label="Referral"
                                disabled={isFormDisabled}
                              />
                            </RadioGroup>
                            {err("referedFrom") && (
                              <FormHelperText>
                                {helperText("referedFrom")}
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Grid>

                        {formik.values.referedFrom === "reffer" && (
                          <>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <FormControl fullWidth error={err("referedType")}>
                                <FormLabel component="legend">
                                  Referred By
                                </FormLabel>
                                <RadioGroup
                                  row
                                  name="referedType"
                                  value={formik.values.referedType || ""}
                                  onChange={formik.handleChange}
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

                            <Grid size={{ xs: 12, md: 6 }}>
                              <FormControl
                                fullWidth
                                disabled={
                                  loadingSources ||
                                  formik.values.referedType === "other"
                                }
                                error={err("referedBy")}
                              >
                                <InputLabel>
                                  {loadingSources
                                    ? "Loading..."
                                    : `Name of ${capitalize(formik.values.referedType || "Referrer")}`}
                                </InputLabel>
                                <Select
                                  name="referedBy"
                                  label={`Name of ${capitalize(formik.values.referedType || "Referrer")}`}
                                  value={formik.values.referedBy}
                                  onChange={(e) => {
                                    formik.handleChange(e);
                                    if (e.target.value === "other") {
                                      formik.setFieldValue(
                                        "referedType",
                                        "other",
                                      );
                                    }
                                  }}
                                >
                                  <MenuItem value="">
                                    <em>None</em>
                                  </MenuItem>
                                  {externalSources.map((src) => (
                                    <MenuItem key={src._id} value={src._id}>
                                      {`${src.firstName} ${src.lastName || ""}`}
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

                            {formik.values.referedType === "other" && (
                              <Grid size={{ xs: 12 }}>
                                <TextField
                                  fullWidth
                                  name="otherReferedBy"
                                  label="Please specify referrer name"
                                  value={formik.values.otherReferedBy || ""}
                                  placeholder="Eg: John Singh"
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
                </div>
                <CardContent className="mbe-5 mt-4">
                  <Grid container spacing={5}>
                    <Grid
                      size={{ xs: 12 }}
                      className="flex gap-4 flex-wrap justify-end"
                    >
                      <Button
                        variant="contained"
                        type="submit"
                        disabled={
                          submitting || formik.isSubmitting || isFormDisabled
                        }
                        className="rounded-xl normal-case text-sm shadow-md"
                      >
                        {submitting || formik.isSubmitting ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </form>
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
                    Application Progress
                  </Typography>
              <Stepper activeStep={activeStepperStep} orientation="vertical">
  {inquirySteps.map((step, index) => (
    <Step key={step.label}>
      <StepLabel
        optional={
          index < activeStepperStep ? (
            <Typography variant="caption" className="text-[var(--mui-palette-success-main)] text-[12px] font-bold">Completed</Typography>
          ) : index === activeStepperStep ? (
            <Typography variant="caption" className="text-[var(--mui-palette-primary-main)] text-[12px] font-bold">Active</Typography>
          ) : (
            <Typography variant="caption" className="text-[var(--mui-palette-text-secondary)] text-[12px]">Pending</Typography>
          )
        }
      >
        {step.label}
      </StepLabel>
      <StepContent>
        <Typography>{step.description}</Typography>
      </StepContent>
    </Step>
  ))}
</Stepper>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <FormControl
                    className="mbs-4 mie-4"
                    error={formik.submitCount > 0 && isPreferenceError}
                  >
                    <Typography variant="h5" className="pb-5">
                      Contact Preferences
                    </Typography>
                    <FormGroup>
                      <FormControlLabel
                        label="Receive updates via Email"
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
                    <FormHelperText
                      className="pt-3"
                      error={formik.submitCount > 0 && isPreferenceError}
                    >
                      {formik.submitCount > 0 && isPreferenceError
                        ? "At least choose one preference to proceed"
                        : null}
                    </FormHelperText>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* ── Confirmation Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={showInquiryPopup}
        onClose={(_e, reason) => {
          if (reason !== "backdropClick") setShowInquiryPopup(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent className="text-center p-8">
          <Typography variant="h4" className="mt-4">
            Inquiry Submitted
          </Typography>
          <Typography variant="h6" className="mt-2 mb-8" color="primary">
            ID: {generatedInqNo}
          </Typography>

          <Box className="mb-8">
            {formik.values.prefferedConsultant || assignedTAC != null ? (
              formik.values.visitOption === 0 ? (
                <Typography
                  variant="body1"
                  className="mb-4 leading-loose text-red-500 font-normal"
                >
                  As you are now inside our{" "}
                  <span className="underline">{selectedBranchName}</span>{" "}
                  Branch.
                  <br />
                  Be ready for Pre-Counselling.
                </Typography>
              ) : formik.values.visitOption === 1 ? (
                <Typography
                  variant="body1"
                  className="mb-4 text-red-500 leading-loose font-normal"
                >
                  As you are visiting our{" "}
                  <span className="underline font-bold">
                    {selectedBranchName}
                  </span>{" "}
                  Branch.
                  <br />
                  For Pre-counselling, please reach the Reception Counter.
                </Typography>
              ) : (
                <Typography variant="body1" className="mb-4">
                  You are assigned to a Talent Acquisition Consultant (TAC).
                  <br />
                  Be ready for Pre-Counselling.
                </Typography>
              )
            ) : (
              <Typography
                variant="body1"
                className="mb-4 leading-loose text-red-500 font-normal"
              >
                As you&apos;re in{" "}
                <span className="font-bold">{selectedBranchName}</span> Branch.
                <br />
                For Pre-counselling, please reach the Reception Counter.
                <br />
                The FOE(Front Office Executive) will generate a token on your
                behalf.
              </Typography>
            )}

            {formik.values.prefferedConsultant ? (
              <Button
                variant="contained"
                className="normal-case rounded-[50px] py-[9.6px] px-10"
                href={`/pre-counselling?leadId=${generatedLeadId}&consultantId=${formik.values.prefferedConsultant}&method=${formik.values.visitOption === 2 ? "on" : "off"}`}
              >
                Schedule Pre-Counselling
              </Button>
            ) : (
              <Button
                variant="contained"
                className="normal-case rounded-[50px] py-[9.6px] px-10"
                onClick={() => setShowInquiryPopup(false)}
              >
                Close
              </Button>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InquiryDetails;
