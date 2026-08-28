 

"use client";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Chip from "@mui/material/Chip";

import { useInquiry, inquirySteps } from "./useInquiry";

// Sub-components
import { InquiryDisabledBanner } from "../../../Components/Inquiry/InquiryDisabledBanner";
import { InquiryStep1Form } from "../../../Components/Inquiry/InquiryStep1Form";
import { InquiryStep2Form } from "../../../Components/Inquiry/InquiryStep2Form";
import { InquiryFormActions } from "../../../Components/Inquiry/InquiryFormActions";
import { InquiryProgressSidebar } from "../../../Components/Inquiry/InquiryProgressSidebar";
import { InquiryContactPreferences } from "../../../Components/Inquiry/InquiryContactPreferences";
import { LocationPermissionDialog } from "../../../Components/Inquiry/LocationPermissionDialog";
import { InquirySuccessDialog } from "../../../Components/Inquiry/InquirySuccessDialog";

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

const InquiryDetails = () => {
  const {
    externalSources,
    preferences,
    isPreferenceError,
    showInquiryPopup,
    generatedInqNo,
    loadingSources,
    userData,
    handlePreferenceToggle,
    formik,
    isFormDisabled,
    err,
    helperText,
    activeStepperStep,
    handleClosePopup,
    handleCategoryChange,
    positionData,
    formStep,
    creatingInquiry,
    updatingInquiry,
    handleCreateStep,
    handleUpdateStep,
    goBackToStep1,
    categoryOptions,
    getLocation,
    locationPermissionRequired,
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

              
              {isFormDisabled && <InquiryDisabledBanner userData={userData} />}

              {!isFormDisabled && (
                <>
                  {/* Step Indicator */}
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
                    {/* Step 1 Form */}
                    {formStep === 0 && (
                      <InquiryStep1Form
                        formik={formik}
                        err={err}
                        helperText={helperText}
                        handleCategoryChange={handleCategoryChange}
                        categoryOptions={categoryOptions}
                        positionData={positionData}
                        isFormDisabled={isFormDisabled}
                      />
                    )}

                    {/* Step 2 Form */}
                    {formStep === 1 && (
                      <InquiryStep2Form
                        formik={formik}
                        err={err}
                        helperText={helperText}
                        loadingSources={loadingSources}
                        externalSources={externalSources}
                      />
                    )}

                    {/* Form Buttons */}
                    <InquiryFormActions
                      formStep={formStep}
                      creatingInquiry={creatingInquiry}
                      updatingInquiry={updatingInquiry}
                      step1HasErrors={step1HasErrors}
                      step2HasErrors={step2HasErrors}
                      locationPermissionRequired={locationPermissionRequired}
                      goBackToStep1={goBackToStep1}
                    />
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12 }}>
              <InquiryProgressSidebar
                activeStepperStep={activeStepperStep}
                inquirySteps={inquirySteps}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <InquiryContactPreferences
                preferences={preferences}
                handlePreferenceToggle={handlePreferenceToggle}
                isPreferenceError={isPreferenceError}
                submitCount={formik.submitCount}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

     
      <LocationPermissionDialog
        open={locationPermissionRequired}
        getLocation={getLocation}
      />

      
      <InquirySuccessDialog
        open={showInquiryPopup}
        generatedInqNo={generatedInqNo}
        handleClosePopup={handleClosePopup}
      />
    </>
  );
};

export default InquiryDetails;