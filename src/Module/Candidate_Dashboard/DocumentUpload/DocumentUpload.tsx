"use client";

import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { Stack, CircularProgress } from "@mui/material";

import { useDocumentUpload } from "@/Module/Candidate_Dashboard/DocumentUpload/useDocumentUpload";
import { DocumentStepper } from "@/Components/Documents/DocumentStepper";
import { PositionSelector } from "@/Components/Documents/PositionSelector";
import { SectionAccordion } from "@/Components/Documents/SectionAccordion";
import { UploadCard } from "@/Components/Documents/UploadCard";

const DocumentUploadPage = () => {
  const {
    router, leadId, activeStep, positions, selectedPosition, setSelectedPosition,
    loadingPositions, loadingDocs, hasDocuments, groupedDocs, isSubmitting,
    isAlreadySubmitted, checkingStatus, isPreLocked, handleFilesUpdate, handleSubmit, isReduxReady, isValidLead
  } = useDocumentUpload();

  if (!isReduxReady || checkingStatus) {
    return (
      <Box className="flex justify-center items-center mt-20 mb-20 h-40">
        <CircularProgress size={40} />
        <Typography className="ml-4 text-gray-500 font-medium">Verifying...</Typography>
      </Box>
    );
  }

  if (!isValidLead) {
  return (
    <Box className="w-full flex justify-center p-4 sm:p-10 mt-10">
      <Card className="p-10 text-center rounded-[24px] shadow-sm flex flex-col items-center justify-center min-h-[300px] w-full max-w-[600px]">
        <i className="ri-error-warning-fill text-6xl text-[var(--mui-palette-error-main)] mb-4"></i>
        <Typography variant="h5" className="text-[var(--mui-palette-text-primary)] font-semibold mb-2">
          Inquiry Not Found
        </Typography>
        <Typography variant="body2" className="text-[var(--mui-palette-text-primary)]">
          The inquiry you are trying to access has been deleted or does not exist. Please generate a new inquiry.
        </Typography>
      </Card>
    </Box>
  );
}

  if (!leadId || activeStep < 2) return null;

  const renderDocumentSection = (title: string, docs: any[]) => {
    if (docs.length === 0) return null;
    return (
      <SectionAccordion title={title} defaultExpanded={true}>
        <Grid container spacing={3}>
          {docs.map((doc) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={doc._id}>
              <UploadCard
                title={doc.title}
                subtitle={doc.subTitle || (doc.supportedExtensions?.length ? `Supported format: ${doc.supportedExtensions.join(", ")}` : "")}
                allowedFormats={doc.supportedExtensions}
                isMandatory={doc.isMandatory}
                multiple={doc.multiple}
                onFilesChange={(files) => handleFilesUpdate(doc._id, files)}
              />
            </Grid>
          ))}
        </Grid>
      </SectionAccordion>
    );
  };

  return (
    <Box className="w-full flex justify-center">
      <Card className="w-full p-3 md:p-6 rounded-3xl shadow-md">
        <Typography variant="h4">Document Upload & Verification</Typography>
        <Typography variant="body1" className="text-secondary mb-6 mt-2">
          Please upload the required documents for verification. Ensure all documents are clear and valid to avoid delays.
        </Typography>

        <Card className="p-2 sm:p-6 rounded-xl shadow-md mb-6">
          <Stack className="w-full" spacing={4}>
            <DocumentStepper activeStep={activeStep} />
          </Stack>
        </Card>

        {checkingStatus ? (
          <Box className="flex justify-center items-center mt-10 mb-10 h-40"><CircularProgress /></Box>
        ) : isPreLocked ? (

          <Box className="mt-8 mb-8 p-10 text-center rounded-xl bg-[var(--mui-palette-background-paper)]   shadow-sm">
            <i className="ri-lock-line text-5xl text-[var(--mui-palette-text-primary)] mb-3 justify-self-center" />
            <Typography variant="h5" className="text-[var(--mui-palette-text-primary)]  tracking-wide">
              Access Restricted
            </Typography>
            <Typography variant="body1" className="text-[var(--mui-palette-text-primary)] mt-2 font-medium">
              Document upload will be available after your Pre-Counselling session is completed.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push(`/pre-counselling?leadId=${leadId}`)}
              className="mt-6 rounded-xl px-8 py-2.5 normal-case text-sm shadow-md font-bold"
            >
              Go to Pre-Counselling
            </Button>
          </Box>

        ) : (
          <Box>
            <Box className={`${isAlreadySubmitted ? "opacity-60 pointer-events-none" : ""}`}>
              <PositionSelector positions={positions} selected={selectedPosition} onSelect={setSelectedPosition} loading={loadingPositions} />
            </Box>

            {loadingDocs ? (
              <Box className="flex justify-center items-center mt-10 mb-10"><CircularProgress /></Box>
            ) : !hasDocuments && selectedPosition ? (
              <Box className="mt-8 mb-8 p-10 text-center rounded-xl border-2 border-dashed border-[#ccc]">
                <Typography variant="h5" className="text-[var(--mui-palette-text-primary)] font-medium tracking-wider">COMING SOON</Typography>
                <Typography variant="body2" className="text-[var(--mui-palette-text-primary)] mt-2 font-medium">
                  Document requirements for this position are currently being updated. Please check back later.
                </Typography>
              </Box>
            ) : (
              <Box className={`mt-5 ${isAlreadySubmitted ? "opacity-60 pointer-events-none" : ""}`}>
                {renderDocumentSection("Resume", groupedDocs.resume)}
                {renderDocumentSection("Documents", groupedDocs.document)}
                {renderDocumentSection("Experience Certificates", groupedDocs.experience)}
                {renderDocumentSection("Academic Certificates", groupedDocs.academic)}
              </Box>
            )}

            <Box className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
              <Box>
                {isAlreadySubmitted && (
                  <Typography variant="body2" className="text-[var(--mui-palette-text-primary)] font-medium text-sm flex items-center gap-2">
                    <i className="ri-checkbox-circle-fill text-xl"></i> Documents already submitted and are under review.
                  </Typography>
                )}
              </Box>
              <Box className="flex gap-3 items-center">
                {isAlreadySubmitted && (
                  <Button variant="contained" onClick={() => router.push(`/experience?positionId=${selectedPosition || ""}`)} className="rounded-xl px-6 py-2 normal-case text-sm bg-[var(--mui-palette-primary-main)] hover:bg-[var(--mui-palette-primary-dark)]">
                    Go to Experience
                  </Button>
                )}
                <Button variant="contained" disabled={!hasDocuments || loadingDocs || !selectedPosition || isSubmitting || isAlreadySubmitted || checkingStatus} onClick={handleSubmit} className="rounded-xl px-6 py-2 normal-case text-sm shadow-md">
                  {isSubmitting || checkingStatus ? <CircularProgress size={24} color="inherit" /> : isAlreadySubmitted ? "Submitted" : "Save & Continue"}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default DocumentUploadPage;