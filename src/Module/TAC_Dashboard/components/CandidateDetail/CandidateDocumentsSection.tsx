import React from "react";
import { Box, Button, Card, CircularProgress, Dialog, DialogContent, Grid, IconButton, Typography } from "@mui/material";
import { SectionAccordion } from "@/Components/Documents/SectionAccordion";
import { UploadCard } from "@/Components/Documents/UploadCard";
import { CamelCase } from "@/Utils/common";
import { useCandidateDocumentsSection, SECTION_ORDER, getFileType} from "./useCandidateDocumentsSection";
import {DocumentBaseCandidate } from "@/Types/Frontend_Payload/Candidate.types";
import { UploadedDoc } from "@/Types/Frontend_Payload/document.types";

const UploadedFileCard: React.FC<{ doc: UploadedDoc; onPreview: (doc: UploadedDoc) => void }> = ({ doc, onPreview }) => {
  const fileType = getFileType(doc.path);
  return (
    <Card variant="outlined" className="rounded-[14px] p-3 flex flex-col gap-2 cursor-pointer hover:shadow-md transition-all duration-200" onClick={() => onPreview(doc)}>
      <Box className="w-full h-28 rounded-lg overflow-hidden flex items-center justify-center bg-[var(--mui-overlays-1)]">
        {fileType === "image" ? <img src={doc.path} alt={doc.title} className="object-contain w-full h-full" /> : (
          <Box className="flex flex-col items-center gap-1">
            <i className={`text-4xl text-[var(--mui-palette-primary-main)] ${fileType === "pdf" ? "ri-file-pdf-2-line" : "ri-file-line"}`} />
            <Typography className="text-[10px] text-[var(--mui-palette-text-secondary)] font-semibold uppercase">{doc.path.split(".").pop()}</Typography>
          </Box>
        )}
      </Box>
      <Box className="flex items-center justify-between gap-1">
        <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] leading-tight line-clamp-2 flex-1">{doc.title}</Typography>
        {doc.status !== 'uploaded' && <Box className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.status === "verified" ? "bg-green-100 text-green-700" : doc.status === "rejected" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"}`}>{CamelCase(doc.status)}</Box>}
      </Box>
      <Typography className="text-[11px] text-[var(--mui-palette-primary-main)] font-semibold text-center">Click to preview</Typography>
    </Card>
  );
};

interface CandidateDocumentsSectionProps { candidate:DocumentBaseCandidate; }

const CandidateDocumentsSection: React.FC<CandidateDocumentsSectionProps> = ({ candidate }) => {
  const { uploadedDocs, grouped, previewDoc, setPreviewDoc, loadingMissing, missingDocs, isSaving, hasPendingFiles, handleFilesUpdate, handleUploadMissing, totalMissing, positionId } = useCandidateDocumentsSection(candidate);

  return (
    <>
      {uploadedDocs.length === 0 ? (
        <Box className="py-6 text-center"><i className="ri-folder-open-line text-4xl text-[var(--mui-palette-text-secondary)] mb-2" /><Typography variant="body2" className="italic text-[var(--mui-palette-text-secondary)]">No documents uploaded yet</Typography></Box>
      ) : (
        SECTION_ORDER.filter(({ key }) => grouped[key]?.length > 0).map(({ key, label }) => (
          <SectionAccordion key={key} title={label} status="uploaded" defaultExpanded>
            <Grid container spacing={2}>
              {grouped[key].map((doc) => <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc._id}><UploadedFileCard doc={doc} onPreview={setPreviewDoc} /></Grid>)}
            </Grid>
          </SectionAccordion>
        ))
      )}
      {positionId && totalMissing > 0 && (
        <Box className="mt-4">
          <SectionAccordion title={loadingMissing ? "Loading missing documents…" : totalMissing > 0 ? `Upload Missing Documents (${totalMissing})` : "Upload Missing Documents"} defaultExpanded={false}>
            {loadingMissing ? <Box className="flex justify-center py-6"><CircularProgress size={28} /></Box> : totalMissing === 0 ? (
              <Box className="py-4 text-center"><i className="ri-checkbox-circle-fill text-3xl text-green-500 mb-1" /><Typography variant="body2" className="text-[var(--mui-palette-text-secondary)]">All required documents are already uploaded.</Typography></Box>
            ) : (
              <Box>
                {(["resume", "document", "experience", "academic", "additional"] as const).map((sectionKey) => {
                  const sectionLabel = SECTION_ORDER.find((s) => s.key === sectionKey)?.label ?? sectionKey;
                  const sectionDocs = missingDocs[sectionKey];
                  if (!sectionDocs.length) return null;
                  return (
                    <Box key={sectionKey} className="mb-5">
                      <Typography variant="subtitle2" className="font-bold mb-3 text-[var(--mui-palette-text-primary)]">{sectionLabel} :</Typography>
                      <Grid container spacing={2}>
                        {sectionDocs.map((doc) => <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc._id}><UploadCard title={doc.title} subtitle={doc.subTitle ?? (doc.supportedExtensions?.length ? `Supported: ${doc.supportedExtensions.join(", ")}` : undefined)} allowedFormats={doc.supportedExtensions} isMandatory={doc.isMandatory} multiple={doc.multiple} onFilesChange={(files) => handleFilesUpdate(doc._id, files)} /></Grid>)}
                      </Grid>
                    </Box>
                  );
                })}
                <Box className="flex justify-end mt-4">
                  <Button variant="contained" disabled={!hasPendingFiles || isSaving} onClick={handleUploadMissing} className="!rounded-xl !normal-case !font-bold !px-8">{isSaving ? <CircularProgress size={22} color="inherit" /> : "Upload Documents"}</Button>
                </Box>
              </Box>
            )}
          </SectionAccordion>
        </Box>
      )}
      <Dialog open={!!previewDoc} onClose={() => setPreviewDoc(null)} maxWidth="md" fullWidth PaperProps={{ className: "rounded-[20px] relative overflow-hidden" }}>
        <DialogContent className="p-0">
          <Box className="flex items-center justify-between px-5 py-3 border-b border-[var(--mui-palette-divider)]">
            <Box><Typography variant="subtitle1" className="font-bold leading-tight">{previewDoc?.title}</Typography><Typography variant="caption" className="text-[var(--mui-palette-text-secondary)]">{CamelCase(previewDoc?.section ?? "")} &bull; <span className={previewDoc?.status === "verified" ? "text-green-600 font-semibold" : previewDoc?.status === "rejected" ? "text-red-500 font-semibold" : "text-blue-600 font-semibold"}>{CamelCase(previewDoc?.status ?? "")}</span></Typography></Box>
            <Box className="flex items-center gap-2"><a href={previewDoc?.path ?? "#"} download target="_blank" rel="noreferrer"><IconButton size="small" title="Download"><i className="ri-download-2-line text-xl" /></IconButton></a><IconButton size="small" onClick={() => setPreviewDoc(null)}><i className="ri-close-line text-xl" /></IconButton></Box>
          </Box>
          <Box className="flex items-center justify-center bg-[var(--mui-overlays-1)] min-h-[60vh]">
            {previewDoc && getFileType(previewDoc.path) === "image" && <img src={previewDoc.path} alt={previewDoc.title} className="max-w-full max-h-[75vh] object-contain p-4" />}
            {previewDoc && getFileType(previewDoc.path) === "pdf" && <iframe src={previewDoc.path} title={previewDoc.title} className="w-full min-h-[75vh] border-0" />}
            {previewDoc && getFileType(previewDoc.path) === "other" && (
              <Box className="flex flex-col items-center gap-4 p-10"><i className="ri-file-line text-6xl text-[var(--mui-palette-text-secondary)]" /><Typography variant="body1" className="text-[var(--mui-palette-text-secondary)]">Preview not available for this file type.</Typography><a href={previewDoc.path} download target="_blank" rel="noreferrer"><Button variant="contained" className="!rounded-xl !normal-case">Download File</Button></a></Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default CandidateDocumentsSection;