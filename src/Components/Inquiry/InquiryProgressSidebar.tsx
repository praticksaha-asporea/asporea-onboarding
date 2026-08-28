import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

interface InquiryProgressSidebarProps {
  activeStepperStep: number;
  inquirySteps: { label: string }[];
}

export const InquiryProgressSidebar: React.FC<InquiryProgressSidebarProps> = ({
  activeStepperStep,
  inquirySteps,
}) => {
  return (
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
                    <Typography
                      variant="caption"
                      className="text-[var(--mui-palette-text-secondary)] text-[12px]"
                    >
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
  );
};
