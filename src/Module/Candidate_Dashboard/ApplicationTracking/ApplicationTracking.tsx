"use client";

import React from "react";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import { useApplicationTracking } from "@/Module/Candidate_Dashboard/ApplicationTracking/useApplicationTracking";
import { TrackingStepper } from "@/Components/ApplicationTracking/TrackingStepper";
import { JourneyCard } from "@/Components/ApplicationTracking/JourneyCard";
import { AssessmentDialog } from "@/Components/ApplicationTracking/AssessmentDialog";
import { CamelCase } from "@/Utils/common";

const ApplicationTracking = () => {
  const {
    router,
    leadId,
    isPopupOpen,
    setIsPopupOpen,
    loading,
    journeyData,
    isReduxReady,
  } = useApplicationTracking();

  if (!isReduxReady) {
    return (
      <Box className="w-full flex justify-center p-10">
        <CircularProgress />
      </Box>
    );
  }

  if (!leadId) {
    return (
      <Box className="w-full flex justify-center p-4 sm:p-10">
        <Card className="w-full max-w-[600px] p-10 text-center rounded-[24px] shadow-sm min-h-[300px] flex flex-col justify-center items-center mt-10">
          <i className="ri-folder-info-line text-6xl text-gray-400 mb-4"></i>
          <Typography
            variant="body1"
            className="text-[var(--mui-palette-secondary)] mb-6"
          >
            Please generate an inquiry first to see your application status.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/inquiry")}
            className="rounded-xl px-8 py-2.5 normal-case bg-[var(--mui-palette-primary-main)] shadow-none"
          >
            Generate Inquiry
          </Button>
        </Card>
      </Box>
    );
  }

  if (loading || !journeyData) {
    return (
      <Box className="w-full flex justify-center p-10">
        <CircularProgress />
      </Box>
    );
  }
  const docStatus = journeyData.documents?.status?.toLowerCase() || "";
  const expStatus = journeyData.experience?.status?.toLowerCase() || "";
  let assessDescription = "";
  const isDocsUploaded =
    docStatus !== "" && docStatus !== "na" && docStatus !== "pending";

  const isExpSubmitted =
    (expStatus !== "" && expStatus !== "na" && expStatus !== "pending") ||
    !!journeyData.experience?.type;
  const isExpVerified =
    expStatus === "verified" || expStatus === "exp_verified";
  const arePrerequisitesMet = isDocsUploaded && isExpSubmitted;
  // console.log(journeyData.technical,28441);


  if (journeyData.assessment.status === "Completed") {
    assessDescription = "Your assessment has been evaluated successfully.";
  } else if (
    journeyData.assessment.status === "Scheduled"
  ) {
    if (
      journeyData.documents.status === "Verified" &&
      journeyData.experience.status === "Verified"
    ) {
      assessDescription = "Your Documents & Experiences are verified.";
      if (journeyData.assessment.assessLatestStatus?.status === "rejected") {
        assessDescription = "You are failed to this assessment.";

      }
      else if (journeyData.assessment.assessLatestStatus?.status === "completed") {
        assessDescription = "You are passsed to this assessment.";

      }
    }
    else if (
      journeyData.documents.status === "Verified" &&
      journeyData.experience.status === "Waiting for Technical Round"
    ) {
      assessDescription =
        "You will need to complete technical round to verify experience.";
    }
    else if (
      journeyData.documents.status === "Verified" &&
      journeyData.experience.status === "Filled"
    ) {
      assessDescription =
        "Your Documents are verified. Now waiting for experience check.";
    }
    else if (
      journeyData.documents.status === "Waiting For Approval"
    ) {
      assessDescription = "Your Documents are waiting for approval.";
    }
    else if (
      journeyData.documents.status === "Rejected" &&
      journeyData.experience.status === "Rejected"
    ) {
      assessDescription = "Your Documents & Experiences are rejected.";
    }
    else if (
      journeyData.documents.status === "Rejected"
    ) {
      assessDescription = "Your Documents are rejected.";
    }
    else if (journeyData.assessment.assessLatestStatus?.token?.generated) {
      assessDescription =
        "Your Assessment token has been generated. Please be within the Branch Premises.";
    }
    else {
      assessDescription =
        "Your Assessment is successfully Scheduled. Please be ready on your selected slot.";
    }

  }
  else if (!arePrerequisitesMet && journeyData.assessment.canSchedule) {
    assessDescription =
      "Documents Submission and Experience Submission are mandatory before scheduling. Please complete them from your dashboard first.";
  } else if (journeyData.assessment.canSchedule) {
    assessDescription =
      "Your initial online assessment is pending. Please schedule it by the deadline.";
  } else {
    assessDescription = "Wait for Pre-Counselling phase completion.";
    if (journeyData.assessment.assessLatestStatus?.status === "rejected") {
      assessDescription = "You are failed to this assessment.";

    }
  }

  return (
    <Box className="w-full flex justify-center">
      <Card className="w-full max-w-[900px] p-6 md:p-12 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <Typography variant="h4" className="mb-6">
          Application Status Tracking
        </Typography>

        <TrackingStepper
          activeStep={journeyData.activeStep}
          showTechnical={journeyData.technical?.isVisible}
        />

        <Box className="mt-5">
          <Typography variant="h5" className="font-medium mb-4">
            Your Application Journey
          </Typography>

          <JourneyCard
            title="Inquiry Submission"
            status={journeyData.inquiry.status}
            dateLabel="On"
            date={journeyData.inquiry.date}
            description="A Talent Acquisition Consultant will be assigned to you shortly to guide you through the next stages."
          />

          <JourneyCard
            title="Pre-Counselling Readiness"
            status={journeyData.preCounselling.status}
            dateLabel={
              journeyData.preCounselling.status === "pre_scheduled"
                ? "Scheduled For"
                : journeyData.preCounselling.status === "Completed"
                  ? "Completed On"
                  : "On"
            }
            date={journeyData.preCounselling.date}
            description={
              journeyData.preCounselling.status === "Completed"
                ? "Your pre-counselling session has been successfully completed and verified by the consultant."
                : journeyData.preCounselling.status === "pre_scheduled"
                  ? "Your pre-counselling session is successfully scheduled. Please be available at your selected date and time slot."
                  : "Please confirm your readiness for pre-counselling sessions. This is a crucial step."
            }
          />
          <JourneyCard
            title="Document Verification"
            status={journeyData.documents.status}
            dateLabel="On"
            date={journeyData.documents.date}
            description={
              docStatus === "waiting for approval"
                ? "Your documents have been submitted to the TAC Head and are currently waiting for approval."
                : docStatus === "verified"
                  ? "All uploaded documents have been verified and approved. Good job!"
                  : docStatus === "rejected"
                    ? "Some of your documents were rejected. Please review and upload valid files."
                    : !isDocsUploaded
                      ? "Please upload your required documents."
                      : "Your uploaded documents are under review."
            }
          />
          <JourneyCard
            title="Experience Verification"
            status={journeyData.experience.status}
            dateLabel="On"
            date={journeyData.experience.date}
            description={
              expStatus === "waiting for technical round"
                ? "Your profile has been referred for a technical round evaluation. Please wait for your slot scheduling."
                : expStatus === "verified"
                  ? "Your experience certificates and history have been successfully verified."
                  : expStatus === "rejected"
                    ? "Your experience details were rejected. Please update with valid details."
                    : !isExpSubmitted
                      ? "Please fill and submit your experience details for review."
                      : journeyData.experience.type
                        ? `Your experience type has been confirmed as '${journeyData.experience.type === "free" ? 'Freelancer' : CamelCase(journeyData.experience.type)}'.`
                        : "Your experience details are under review."
            }
          />
          <JourneyCard
            title="Assessment"
            status={journeyData.assessment.status}
            dateLabel={
              journeyData.assessment.status === "Scheduled"
                ? "Scheduled For"
                : journeyData.assessment.status === "Completed"
                  ? "Completed On"
                  : undefined
            }
            date={journeyData.assessment.date}
            description={assessDescription}
            buttonLabel={
              journeyData.assessment.hasResult
                ? null
                : journeyData.assessment.status === "Scheduled"
                  ? "Scheduled"
                  : journeyData.assessment.status === "Rejected" ?
                    "Rejected" :
                    journeyData.assessment.canSchedule
                      ? arePrerequisitesMet
                        ? "Schedule Assessment"
                        : "Doc. & Exp."
                      : "Wait for Pre-Counselling"
            }
            disabledButton={
              !journeyData.assessment.canSchedule ||
              journeyData.assessment.status === "Scheduled" ||
              (!arePrerequisitesMet && journeyData.assessment.canSchedule)
            }
            onClick={() =>
              journeyData.assessment.canSchedule &&
              journeyData.assessment.status !== "Scheduled" &&
              arePrerequisitesMet &&
              setIsPopupOpen(true)
            }
            secondaryButtonLabel={
              journeyData.assessment.hasResult ? "View Result" : null
            }
            onSecondaryClick={() => router.push("/assessment?view=result")}
          />

          {journeyData.technical?.isVisible && (
            <JourneyCard
              title="Technical Round"
              status={journeyData.technical.status}
              disabledCard={false}
              dateLabel={journeyData.technical.hasResult ? "On" : undefined}
              date={journeyData.technical.date}
              description="Your technical round has been evaluated."
              buttonLabel={
                journeyData.technical.hasResult ? "View Result" : null
              }
              disabledButton={false}
              onClick={() => router.push("/assessment?view=technical")}
            />
          )}
        </Box>
      </Card>

      <AssessmentDialog
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onProceed={() => {
          setIsPopupOpen(false);
          router.push(`/assessment?leadId=${leadId}`);
        }}
      />
    </Box>
  );
};

export default ApplicationTracking;
