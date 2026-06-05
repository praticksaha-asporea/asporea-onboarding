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

const ApplicationTracking = () => {
  const { router, leadId, isPopupOpen, setIsPopupOpen, loading, journeyData, isReduxReady } = useApplicationTracking();

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
          <Typography variant="body1" className="text-[var(--mui-palette-secondary)] mb-6">
            Please generate an inquiry first to see your application status.
          </Typography>
          <Button variant="contained" onClick={() => router.push("/inquiry")} className="rounded-xl px-8 py-2.5 normal-case bg-[var(--mui-palette-primary-main)] shadow-none">
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

  return (
    <Box className="w-full flex justify-center">
      <Card className="w-full max-w-[900px] p-6 md:p-12 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <Typography variant="h4" className="mb-6">Application Status Tracking</Typography>

        <TrackingStepper activeStep={journeyData.activeStep} showTechnical={journeyData.technical?.isVisible} />

        <Box className="mt-5">
          <Typography variant="h5" className="font-medium mb-4">Your Application Journey</Typography>

          <JourneyCard
            title="Inquiry Submission"
            status={journeyData.inquiry.status}
            dateLabel="On" date={journeyData.inquiry.date}
            description="A Talent Acquisition Consultant will be assigned to you shortly to guide you through the next stages."
          />

          <JourneyCard
            title="Pre-Counselling Readiness"
            status={journeyData.preCounselling.status}
            dateLabel="On" date={journeyData.preCounselling.date}
            description="Please confirm your readiness for pre-counselling sessions. This is a crucial step."
          />

          <JourneyCard
            title="Document Verification"
            status={journeyData.documents.status}
            dateLabel="On" date={journeyData.documents.date}
            description={journeyData.documents.status === "Verified" ? "All uploaded documents have been verified and approved. Good job!" : "Your uploaded documents are under review."}
          />

          <JourneyCard
            title="Experience Verification"
            status={journeyData.experience.status}
            dateLabel="On" date={journeyData.experience.date}
            description={journeyData.experience.type ? `Your experience type has been confirmed as '${journeyData.experience.type}'.` : "Your experience details are under review."}
          />

          <JourneyCard
            title="Assessment"
            status={journeyData.assessment.status}
            dateLabel={journeyData.assessment.status === "Scheduled" ? "Scheduled For" : journeyData.assessment.status === "Completed" ? "Completed On" : undefined}
            date={journeyData.assessment.date}
            description={journeyData.assessment.status === "Completed" ? "Your assessment has been evaluated successfully." : journeyData.assessment.status === "Scheduled" ? `Your Assessment is successfully Scheduled. Please be ready on your selected slot.` : journeyData.assessment.canSchedule ? "Your initial online assessment is pending. Please schedule it by the deadline." : "Wait for Pre-Counselling phase to be completed by Consultant."}
            buttonLabel={journeyData.assessment.hasResult ? null : journeyData.assessment.status === "Scheduled" ? "Scheduled" : journeyData.assessment.canSchedule ? "Schedule Assessment" : "Wait for Pre-Counselling"}
            disabledButton={!journeyData.assessment.canSchedule || journeyData.assessment.status === "Scheduled"}
            onClick={() => journeyData.assessment.canSchedule && journeyData.assessment.status !== "Scheduled" && setIsPopupOpen(true)}
            secondaryButtonLabel={journeyData.assessment.hasResult ? "View Result" : null}
            onSecondaryClick={() => router.push("/assessment?view=result")}
          />

          {journeyData.technical?.isVisible && (
            <JourneyCard
              title="Technical Round" status={journeyData.technical.status} disabledCard={false}
              dateLabel={journeyData.technical.hasResult ? "On" : undefined} date={journeyData.technical.date}
              description="Your technical round has been evaluated."
              buttonLabel={journeyData.technical.hasResult ? "View Result" : null} disabledButton={false}
              onClick={() => router.push("/assessment?view=technical")}
            />
          )}
        </Box>
      </Card>

      <AssessmentDialog isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} onProceed={() => { setIsPopupOpen(false); router.push("/assessment"); }} />
    </Box>
  );
};

export default ApplicationTracking;