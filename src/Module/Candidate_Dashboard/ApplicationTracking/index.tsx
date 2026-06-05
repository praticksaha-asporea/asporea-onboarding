"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import { getJourneyTimelineAction } from "@/Services/APIs/Assessment/assessment.actions";

// MUI Imports
import Stepper from "@mui/material/Stepper";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import {
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  lighten,
  Stack,
  Step,
  StepConnector,
  stepConnectorClasses,
  StepIconProps,
  StepLabel,
  styled,
  CircularProgress,
} from "@mui/material";

const Stepper_steps = ({
  activeStep,
  showTechnical,
}: {
  activeStep: number;
  showTechnical: boolean;
}) => {
  const steps = [
    "Inquiry",
    "Counselling",
    "Documents",
    "Experience",
    "Assessment",
  ];
  if (showTechnical) {
    steps.push("Technical Round");
  }

  const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 22,
    },

    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundColor: "#eaeaf0",
        backgroundImage: "none",
      },
    },

    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundImage: `linear-gradient(270deg, ${lighten(theme.palette.primary.main, 0.5)}, var(--mui-palette-primary-main) 100%)`,
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      height: 3,
      border: 0,
      backgroundColor: "#eaeaf0",
      borderRadius: 1,
      ...theme.applyStyles("dark", {
        backgroundColor: theme.palette.grey[800],
      }),
    },
  }));

  const ColorlibStepIconRoot = styled("div")<{
    ownerState: { completed?: boolean; active?: boolean };
  }>(({ theme }) => ({
    backgroundColor: "#ccc",
    zIndex: 1,
    color: "#fff",
    width: 50,
    height: 50,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.grey[700],
    }),
    variants: [
      {
        props: ({ ownerState }) => ownerState.active,
        style: {
          backgroundColor: "#ccc",
          backgroundImage: "none",
          boxShadow: "0 0 0 5px rgba(204, 204, 204, 0.3)",
        },
      },
      {
        props: ({ ownerState }) => ownerState.completed,
        style: {
          backgroundImage: `linear-gradient(270deg, ${lighten(theme.palette.primary.main, 0.5)}, var(--mui-palette-primary-main) 100%)`,
          boxShadow: "none",
        },
      },
    ],
  }));

  function ColorlibStepIcon(props: StepIconProps) {
    const { active, completed, className, icon } = props;

    const icons: { [index: string]: React.ReactElement<unknown> } = {
      1: <i className="material-symbols--help-outline" />,
      2: <i className="material-symbols--check-circle-outline" />,
      3: <i className="material-symbols--file-upload" />,
      4: <i className="material-symbols--work-outline" />,
      5: <i className="material-symbols--emoji-events" />,
      6: <i className="material-symbols-light--list-alt-outline" />,
    };

    return (
      <ColorlibStepIconRoot
        ownerState={{ completed, active }}
        className={className}
      >
        {icons[String(icon)]}
      </ColorlibStepIconRoot>
    );
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 12 }}>
        <Card className="p-2 sm:p-6 rounded-xl shadow-md">
          <Stack className="w-full" spacing={4}>
            <Stepper
              alternativeLabel
              activeStep={activeStep}
              connector={<ColorlibConnector />}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel StepIconComponent={ColorlibStepIcon}>
                    <span className="hidden md:inline">{label}</span>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const isSuccess = ["Completed", "Verified", "Done", "Passed"].includes(
    status,
  );
  const isInfo = ["Uploaded", "Filled", "Scheduled"].includes(status);

  return (
    <Box
      className={`text-[12px] font-bold capitalize tracking-[0.2px]
        ${isSuccess ? "text-[var(--mui-palette-primary)] " : ""}
        ${isInfo ? "text-[var(--mui-palette-secondary)]" : ""}
        ${!isSuccess && !isInfo ? "text-[var(--mui-palette-text-secondary)]" : ""}
      `}
    >
      {status}
    </Box>
  );
};

const JourneyCard = ({
  title,
  status,
  dateLabel,
  date,
  description,
  buttonLabel,
  disabledButton,
  onClick,
  secondaryButtonLabel,
  onSecondaryClick,
  disabledCard,
}: any) => {
  return (
    <Card
      variant="outlined"
      className={`mb-6 p-6 sm:p-8 rounded-[16px]   shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 ${disabledCard ? "opacity-50 pointer-events-none" : "hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"}`}
    >
      <Box className="flex justify-between items-start mb-6">
        <Typography variant="h6" className="text-[0.9rem] mt-1">
          {title}
        </Typography>

        <Box className="flex flex-col items-end gap-2">
          <StatusBadge status={status} />
          {dateLabel && date && (
            <Typography
              variant="caption"
              className="font-normal whitespace-nowrap text-[var(--mui-palette-text-secondary)]"
            >
              {dateLabel}:{" "}
              <span className="font-normal text-[var(--mui-palette-text-secondary)]">
                {date}
              </span>
            </Typography>
          )}
        </Box>
      </Box>

      <Typography variant="body2" className=" leading-[1.6] mb-6">
        {description}
      </Typography>

      <Box className="flex justify-end items-center pt-5 gap-4">
        {secondaryButtonLabel && (
          <Button
            variant="outlined"
            onClick={onSecondaryClick}
            className="rounded-[8px] px-6 py-2 normal-case text-white bg-var(--mui-palette-primary-main) shadow-none hover:bg-[#1565c0] hover:shadow-none transition-colors duration-150 disabled:bg-[#e3f2fd] disabled:text-[#93c5fd] disabled:cursor-not-allowed"
          >
            {secondaryButtonLabel}
          </Button>
        )}
        {buttonLabel && (
          <Button
            variant="contained"
            disabled={disabledButton}
            onClick={onClick}
            className={`rounded-[8px] px-6 py-2 normal-case text-white shadow-none transition-colors duration-150
      ${
        buttonLabel === "Scheduled"
          ? "bg-[var(--mui-palette-primary-main)] !text-white disabled:!bg-[var(--mui-palette-primary-main)] disabled:!text-white opacity-65 cursor-not-allowed pointer-events-none"
          : "bg-[var(--mui-palette-primary-main)] hover:bg-[var(--mui-palette-primary-dark)] disabled:bg-[var(--mui-palette-action-disabledBackground)] disabled:text-[var(--mui-palette-action-disabled)]"
      }
    `}
          >
            {buttonLabel}
          </Button>
        )}
      </Box>
    </Card>
  );
};

// Main Page Component
const ApplicationTracking = () => {
  const router = useRouter();
  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const leadId = reduxUser?.leadId || reduxUser?.user?.leadId || "";

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [journeyData, setJourneyData] = useState<any>(null);
  const [isReduxReady, setIsReduxReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReduxReady(true);
    }, 500); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchJourney = async () => {
      if (!leadId) return;
      try {
        setLoading(true);
        const res = await getJourneyTimelineAction(leadId);

        if (res?.success && res.data) {
          setJourneyData(res.data);
        } else {
          toast.error(res?.message || "Failed to fetch application timeline", {
            id: "journey-error",
          });
        }
      } catch (err) {
        toast.error("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchJourney();
  }, [leadId]);

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
        <Card className="w-full max-w-[600px] p-10 text-center rounded-[24px] shadow-sm   min-h-[300px] flex flex-col justify-center items-center mt-10">
          <i className="ri-folder-info-line text-6xl text-gray-400 mb-4"></i>
          
          <Typography variant="body1" className="text-[var(--mui-palette-secondary)] mb-6">
            Please generate an inquiry first to see your application status.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/inquiry')}
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

  return (
    
    <Box className="w-full flex justify-center">
      <Card className="w-full max-w-[900px] p-6 md:p-12 rounded-[24px]   shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <Typography variant="h4" className="mb-6">
          Application Status Tracking
        </Typography>

        <Stepper_steps
          activeStep={journeyData.activeStep}
          showTechnical={journeyData.technical.isVisible}
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
            dateLabel="On"
            date={journeyData.preCounselling.date}
            description="Please confirm your readiness for pre-counselling sessions. This is a crucial step."
          />

          <JourneyCard
            title="Document Verification"
            status={journeyData.documents.status}
            dateLabel="On"
            date={journeyData.documents.date}
            description={
              journeyData.documents.status === "Verified"
                ? "All uploaded documents have been verified and approved. Good job!"
                : "Your uploaded documents are under review."
            }
          />

          <JourneyCard
            title="Experience Verification"
            status={journeyData.experience.status}
            dateLabel="On"
            date={journeyData.experience.date}
            description={
              journeyData.experience.type
                ? `Your experience type has been confirmed as '${journeyData.experience.type}'.`
                : "Your experience details are under review."
            }
          />

          {/* DYNAMIC ASSESSMENT CARD */}
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
            description={
              journeyData.assessment.status === "Completed"
                ? "Your assessment has been evaluated successfully."
                : journeyData.assessment.status === "Scheduled"
                  ? `Your Assessment is successfully Scheduled. Please be ready on your selected slot.`
                  : journeyData.assessment.canSchedule
                    ? "Your initial online assessment is pending. Please schedule it by the deadline."
                    : "Wait for Pre-Counselling phase to be completed by Consultant."
            }
            buttonLabel={
              journeyData.assessment.hasResult
                ? null
                : journeyData.assessment.status === "Scheduled"
                  ? "Scheduled"
                  : journeyData.assessment.canSchedule
                    ? "Schedule Assessment"
                    : "Wait for Pre-Counselling"
            }
            disabledButton={
              !journeyData.assessment.canSchedule ||
              journeyData.assessment.status === "Scheduled"
            }
            onClick={() =>
              journeyData.assessment.canSchedule &&
              journeyData.assessment.status !== "Scheduled" &&
              setIsPopupOpen(true)
            }
            secondaryButtonLabel={
              journeyData.assessment.hasResult ? "View Result" : null
            }
            onSecondaryClick={() => router.push("/assessment?view=result")}
          />

          {journeyData.technical.isVisible && (
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

      <Dialog
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "rounded-[24px] pt-12 pb-10 px-8 relative overflow-hidden",
        }}
      >
        <DialogContent className="flex flex-col items-center text-center">
          <IconButton
            onClick={() => setIsPopupOpen(false)}
            className="absolute right-5 top-5 text-gray-500"
          >
            <i className="material-symbols--close-rounded" />
          </IconButton>
          <Typography variant="h4">Assessment</Typography>
          <Box className="mb-8">
            <Typography variant="body1" className="mt-2 mb-4 px-8">
              You are assigned to a Talent Acquisition <br />
              Consultant (TAC). <br />
              Be ready for e-Assessment with Original Documents
            </Typography>
            <Button
              onClick={() => {
                setIsPopupOpen(false);
                router.push("/assessment");
              }}
              className="bg-[var(--mui-palette-primary-main)] hover:bg-[--mui-palette-primary-main] text-white rounded-full text-[16px] normal-case"
            >
              Request e-Assessment
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ApplicationTracking;
