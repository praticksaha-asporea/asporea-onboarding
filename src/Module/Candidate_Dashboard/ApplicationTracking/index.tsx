"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// MUI Imports

import Stepper from '@mui/material/Stepper';
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { Dialog, DialogContent, Grid, IconButton, lighten, Stack, Step, StepConnector, stepConnectorClasses, StepIconProps, StepLabel, styled } from "@mui/material";


// 1. TOP STEPPER COMPONENT
const Stepper_steps = () => {
  const steps = [
    { label: 'Inquiry', status: 'completed' },
    { label: 'Counselling', status: 'completed' },
    { label: 'Documents', status: 'completed' },
    { label: 'Experience', status: 'completed' },
    { label: 'Assessment', status: 'active' },
    { label: 'Technical Round', status: 'pending' },
  ];



  const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundImage:
          `linear-gradient(270deg, ${lighten(
            theme.palette.primary.main,
            0.5
          )}, var(--mui-palette-primary-main) 100%)`
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundImage:
          `linear-gradient(270deg, ${lighten(
            theme.palette.primary.main,
            0.5
          )}, var(--mui-palette-primary-main) 100%)`,
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      height: 3,
      border: 0,
      backgroundColor: '#eaeaf0',
      borderRadius: 1,
      ...theme.applyStyles('dark', {
        backgroundColor: theme.palette.grey[800],
      }),
    },
  }));

  const ColorlibStepIconRoot = styled('div')<{
    ownerState: { completed?: boolean; active?: boolean };
  }>(({ theme }) => ({
    backgroundColor: '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[700],
    }),
    variants: [
      {
        props: ({ ownerState }) => ownerState.active,
        style: {
          backgroundImage:
            `linear-gradient(270deg, ${lighten(
              theme.palette.primary.main,
              0.5
            )}, var(--mui-palette-primary-main) 100%)`,
          boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
        },
      },
      {
        props: ({ ownerState }) => ownerState.completed,
        style: {
          backgroundImage:
            `linear-gradient(270deg, ${lighten(
              theme.palette.primary.main,
              0.5
            )}, var(--mui-palette-primary-main) 100%)`,
        },
      },
    ],
  }));

  function ColorlibStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;

    const icons: { [index: string]: React.ReactElement<unknown> } = {
      1: <i className="material-symbols--help-outline" />,
      2: <i className="material-symbols--check-circle-outline" />,
      3: <i className="material-symbols--file-upload" />,
      4: <i className="material-symbols--work-outline" />,
      5: <i className="material-symbols--emoji-events" />,
      6: <i className="material-symbols-light--list-alt-outline" />,
    };

    return (
      <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
        {icons[String(props.icon)]}
      </ColorlibStepIconRoot>
    );
  }

  return (
    <Grid container spacing={6}>
      {/* Left Section   */}
      <Grid size={{ xs: 12, md: 12 }}>
        <Card
          className="p-2 sm:p-6 rounded-xl shadow-md"
        >
          <Stack className="w-full" spacing={4}>
            <Stepper alternativeLabel activeStep={3} connector={<ColorlibConnector />}>
              {steps.map(({ label }) => (
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
  )
}

// Custom Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  const isCompleted = status === "Completed";
  return (
    <Box className="text-[12px] font-medium bg-transparent border-none p-0 capitalize tracking-[0.2px]">
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
}: any) => {
  return (
    <Card
      variant="outlined"
      className="mb-6 p-6 sm:p-8 rounded-[16px] border border-[#e5e7eb] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
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
              className="font-normal whitespace-nowrap"
            >
              {dateLabel}:{" "}
              <span style={{ fontWeight: 400, color: "#6b7280" }}>{date}</span>
            </Typography>
          )}
        </Box>
      </Box>

      {/* Description */}
      <Typography variant="body2" className=" leading-[1.6] mb-6">
        {description}
      </Typography>

      <Box className="flex justify-end items-center pt-5  gap-4">
        {/* NAYA: View Result Button */}
        {secondaryButtonLabel && (
          <Button
            variant="outlined"
            onClick={onSecondaryClick}
            className="rounded-[8px] px-6 py-2 normal-case text-white bg-[#1976d2] shadow-none hover:bg-[#1565c0] hover:shadow-none transition-colors duration-150 disabled:bg-[#e3f2fd] disabled:text-[#93c5fd] disabled:cursor-not-allowed"
          >
            {secondaryButtonLabel}
          </Button>
        )}
        {buttonLabel && (
          <Button
            variant="contained"
            disabled={disabledButton}
            onClick={onClick}
            className="rounded-[8px] px-6 py-2 normal-case text-white bg-[#1976d2] shadow-none hover:bg-[#1565c0] hover:shadow-none transition-colors duration-150 disabled:bg-[#e3f2fd] disabled:text-[#93c5fd] disabled:cursor-not-allowed"
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
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  return (
    <Box className="w-full flex justify-center">
      <Card className="w-full max-w-[900px] p-6 md:p-12 rounded-[24px] border border-[#f3f4f6] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <Typography variant="h4" className="mb-6">
          Application Status Tracking
        </Typography>

        <Stepper_steps />

        <Box className="mt-5">
          <Typography variant="h5" className="font-medium mb-4">
            Your Application Journey
          </Typography>

          <JourneyCard
            title="Inquiry Submission"
            status="Done"
            dateLabel="On"
            date="Feb 27, 2026"
            description="A Talent Acquisition Consultant will be assigned to you shortly to guide you through the next stages."
          />

          <JourneyCard
            title="Pre-Counselling Readiness"
            status="Completed"
            dateLabel="On"
            date="Feb 27, 2026"
            description="Please confirm your readiness for pre-counselling sessions. This is a crucial step."
          />

          <JourneyCard
            title="Document Verification"
            status="Uploaded"
            dateLabel="On"
            date="Feb 28, 2026"
            description="All uploaded documents (ID, Resume, Certificates) have been verified and approved. Good job!"
          />

          <JourneyCard
            title="Experience Verification"
            status="Filled"
            dateLabel="On"
            date="Feb 28, 2026"
            description="Your experience type has been confirmed as 'Domestic Professional'."
          />

          <JourneyCard
            title="Assessment"
            status="Pending"
            description="Your initial online assessment is currently in progress. Please complete it by the deadline."
            buttonLabel="Schedule Assessment"
            disabledButton={false}
            onClick={() => setIsPopupOpen(true)}
            // secondaryButtonLabel="View Result"
            onSecondaryClick={() => router.push("/assessment?view=result")}
          />

          <JourneyCard
            title="Technical Round"
            status="Pending"
            dateLabel="Scheduled"
            date="Feb 01, 2026"
            description="Assessor will decide if you will need to clear this round or no need. We will notify you of the result after assessment."
            buttonLabel="View Result"
            disabledButton={false}
            onClick={() => router.push("/assessment?view=technical")}
          />
        </Box>
      </Card>
      <Dialog
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className:
            "rounded-[24px] pt-12 pb-10 px-8 relative overflow-hidden",
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
            <Typography variant="body1" className="mt-2 mb-4 px-8"
            >
              You are assigned to a Talent Acquisition <br />
              Consultant (TAC). <br />
              Be ready for e-Assessment with Original Documents
            </Typography>

            <Button
              onClick={() => {
                setIsPopupOpen(false);
                router.push("/assessment");
              }}
              className="bg-[#1877F2] hover:bg-[--mui-palette-secondary-main] text-white rounded-full text-[16px] normal-case"
            >
              Request e-Assessment
            </Button>
          </Box>

          {/* <hr className="border-gray-200 mb-5 w-full" />

          <Box className="mb-6">
            <Typography className="text-[--mui-palette-error-light] text-[15px] leading-[1.6] mb-5">
              As you are now inside our <span className="font-bold">Siliguri</span> Branch.<br />
              Be ready For Assessment with Original Documents
            </Typography>

            <Button className="bg-[#111111]  text-white py-3 px-10 rounded-full text-[16px] normal-case min-w-[260px]">
              Generate Token
            </Button>
          </Box>

          <hr className="border-gray-200 mb-5 w-full" />

          <Typography className="text-[--mui-palette-error-light] text-[15px] leading-[1.6]">
            As you're in <span className="font-bold">Siliguri</span> Branch.<br />
            For Assessment, Please reach to Reception Counter.<br />
            Receptionist will Generate a Token behalf of you.<br />
            Be ready For Assessment with Original Documents.
          </Typography> */}

        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ApplicationTracking;
