"use client";

import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stepper from "@mui/material/Stepper";
import { Stack, Step, StepConnector, stepConnectorClasses, StepIconProps, StepLabel, styled, lighten } from "@mui/material";

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`&.${stepConnectorClasses.active}`]: { [`& .${stepConnectorClasses.line}`]: { backgroundColor: "#eaeaf0", backgroundImage: "none" } },
  [`&.${stepConnectorClasses.completed}`]: { [`& .${stepConnectorClasses.line}`]: { backgroundImage: `linear-gradient(270deg, ${lighten(theme.palette.primary.main, 0.5)}, var(--mui-palette-primary-main) 100%)` } },
  [`& .${stepConnectorClasses.line}`]: { height: 3, border: 0, backgroundColor: "#eaeaf0", borderRadius: 1, ...theme.applyStyles("dark", { backgroundColor: theme.palette.grey[800] }) },
}));

const ColorlibStepIconRoot = styled("div")<{ ownerState: { completed?: boolean; active?: boolean } }>(({ theme }) => ({
  backgroundColor: "#ccc", zIndex: 1, color: "#fff", width: 50, height: 50, display: "flex", borderRadius: "50%", justifyContent: "center", alignItems: "center",
  ...theme.applyStyles("dark", { backgroundColor: theme.palette.grey[700] }),
  variants: [
    { props: ({ ownerState }) => ownerState.active, style: { backgroundColor: "#ccc", backgroundImage: "none", boxShadow: "0 0 0 5px rgba(204, 204, 204, 0.3)" } },
    { props: ({ ownerState }) => ownerState.completed, style: { backgroundImage: `linear-gradient(270deg, ${lighten(theme.palette.primary.main, 0.5)}, var(--mui-palette-primary-main) 100%)`, boxShadow: "none" } },
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
  return <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>{icons[String(icon)]}</ColorlibStepIconRoot>;
}

export const TrackingStepper = ({ activeStep, showTechnical }: { activeStep: number; showTechnical?: boolean }) => {
  const steps = ["Inquiry", "Counselling", "Documents", "Experience", "Assessment"];
  if (showTechnical) steps.push("Technical Round");

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 12 }}>
        <Card className="p-2 sm:p-6 rounded-xl shadow-md">
          <Stack className="w-full" spacing={4}>
            <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
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