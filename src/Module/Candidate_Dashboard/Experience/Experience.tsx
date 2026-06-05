"use client";

import React, { Suspense } from "react";
import clsx from "clsx";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { Alert, AlertTitle, CircularProgress } from "@mui/material";

import { useExperience, experienceTypes } from "@/Module/Candidate_Dashboard/Experience/useExperience";
import { ExperienceCard } from "@/Components/Experience/ExperienceCard";
import { ExperienceAccordion } from "@/Components/Experience/ExperienceAccordion";
import { ExperienceUploadCard } from "@/Components/Experience/ExperienceUploadCard";

const ExperienceContent = () => {
  const {
    leadId,
    selectedExperience,
    setSelectedExperience,
    isSubmitting,
    additionalDocs,
    loadingDocs,
    isAlreadySubmitted,
    isReduxReady,
    checkingStatus,
    handleFilesUpdate,
    handleSubmit
  } = useExperience();

  if (!isReduxReady || checkingStatus) {
    return (
      <Box className="w-full flex justify-center items-center min-h-[500px]">
        <CircularProgress size={40} />
        <Typography className="ml-4 text-gray-500 font-medium">Verifying ...</Typography>
      </Box>
    );
  }

  if (!leadId) return null;

  return (
    <Box className="w-full flex justify-center">
      <Card className="w-full max-w-[1000px] p-6 md:p-12 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <Box className="text-left mb-12">
          <Typography variant="subtitle2" className="mb-3 tracking-[0.5px]">
            Step 4 of 6: Experience Selection
          </Typography>
          <Typography variant="h4" className="mb-2">
            Select Your Experience Type
          </Typography>
          <Typography variant="body1" className="text-[13px] font-medium leading-[1.2] max-w-[900px]">
            Please select the option that best describes your professional background. This helps us tailor your application process.
          </Typography>
        </Box>

        <Grid container spacing={4} className={clsx("mb-10", isAlreadySubmitted && "opacity-60 pointer-events-none")}>
          {experienceTypes.map((type) => (
            <ExperienceCard
              key={type.id}
              type={type}
              isSelected={selectedExperience === type.id}
              onSelect={() => setSelectedExperience(selectedExperience === type.id ? null : type.id)}
            />
          ))}
        </Grid>

        {loadingDocs ? (
          <Box className="flex justify-center p-10">
            <CircularProgress size={30} />
          </Box>
        ) : additionalDocs.length > 0 ? (
          <Box className={clsx("mt-8", isAlreadySubmitted && "opacity-60 pointer-events-none")}>
            <ExperienceAccordion title="Additional Documents" defaultExpanded={true}>
              <Grid container spacing={3}>
                {additionalDocs.map((doc) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={doc._id}>
                    <ExperienceUploadCard
                      title={doc.title}
                      subtitle={doc.subTitle || (doc.supportedExtensions?.length ? `Supported format: ${doc.supportedExtensions.join(", ")}` : "")}
                      allowedFormats={doc.supportedExtensions}
                      isMandatory={doc.isMandatory}
                      multiple={doc.multiple}
                      onFilesChange={(files: File[]) => handleFilesUpdate(doc._id, files)}
                    />
                  </Grid>
                ))}
              </Grid>

              <Alert severity="info" className="mt-6 rounded-xl">
                <AlertTitle>Optional, but recommended</AlertTitle>
                Upload relevant documents of your experience only if you did not already upload them in the previous Document Upload section. Valid documents include experience letters, appointment letters, or recent pay slips.
              </Alert>
            </ExperienceAccordion>
          </Box>
        ) : (
          <Box className="mt-8 p-6 text-center border-2 border-dashed border-[var(--mui-palette-divider)] rounded-xl">
            <Typography variant="body1" className="text-[var(--mui-palette-primary) tracking-wide]">
              No additional documents required for the selected position.
            </Typography>
          </Box>
        )}

        <Box className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          <Box>
            {isAlreadySubmitted && (
              <Typography variant="h4" className="text-[var(--mui-palette-text-primary)] font-medium text-sm flex items-center gap-2">
                <i className="ri-checkbox-circle-fill text-xl text-[var(--mui-palette-primary)]"></i> Experience details already submitted.
              </Typography>
            )}
          </Box>
          <Box className="flex gap-4">
            <Button
              variant="contained"
              disabled={!selectedExperience || isSubmitting}
              className="rounded-xl normal-case text-sm shadow-md hover:bg-blue-700 hover:shadow-lg px-8"
              onClick={handleSubmit}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Continue to Assessment"}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

const Experience = () => {
  return (
    <Suspense fallback={<Box className="w-full flex justify-center p-10"><CircularProgress /></Box>}>
      <ExperienceContent />
    </Suspense>
  );
};

export default Experience;