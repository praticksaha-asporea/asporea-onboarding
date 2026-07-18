"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";

import { SectionAccordion } from "@/Components/Documents/SectionAccordion";
import { UploadCard } from "@/Components/Documents/UploadCard";
import { CamelCase, uploadFileAction } from "@/Utils/common";
import {
  getPositionDetailsAction,
  saveMappedDocumentsAction,
  getCandidateDocumentsAction,
} from "@/Services/APIs/Documents/document.actions";
import { DocumentRequirement, GroupedDocuments } from "@/Types/Frontend_Payload/document.types";

// ── Types ────────────────────────────────────────────────────────────────────

interface UploadedDoc {
  _id: string;
  title: string;
  section: string;
  path: string;   // e.g. /uploads/filename.pdf
  status: string;
}

interface CandidateDocumentsSectionProps {
  /** The full candidate object from the TAC API */
  candidate: any;
}

// Sections rendered in order
const SECTION_ORDER: Array<{ key: string; label: string }> = [
  { key: "resume", label: "Resume" },
  { key: "document", label: "Documents" },
  { key: "experience", label: "Experience Certificates" },
  { key: "academic", label: "Academic Certificates" },
  { key: "additional", label: "Additional" },
];

// ── File preview helpers ──────────────────────────────────────────────────────

function getFileType(path: string): "image" | "pdf" | "other" {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return "other";
}

// ── Sub-component: uploaded file preview card ─────────────────────────────────

const UploadedFileCard: React.FC<{ doc: UploadedDoc; onPreview: (doc: UploadedDoc) => void }> = ({
  doc,
  onPreview,
}) => {
  const fileType = getFileType(doc.path);

  return (
    <Card
      variant="outlined"
      className="rounded-[14px] p-3 flex flex-col gap-2 cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={() => onPreview(doc)}
    >
      {/* Thumbnail / icon */}
      <Box className="w-full h-28 rounded-lg overflow-hidden flex items-center justify-center bg-[var(--mui-overlays-1)]">
        {fileType === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.path}
            alt={doc.title}
            className="object-contain w-full h-full"
          />
        ) : (
          <Box className="flex flex-col items-center gap-1">
            <i
              className={`text-4xl text-[var(--mui-palette-primary-main)] ${fileType === "pdf" ? "ri-file-pdf-2-line" : "ri-file-line"
                }`}
            />
            <Typography className="text-[10px] text-[var(--mui-palette-text-secondary)] font-semibold uppercase">
              {doc.path.split(".").pop()}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Title + status */}
      <Box className="flex items-center justify-between gap-1">
        <Typography className="text-[12px] font-bold text-[var(--mui-palette-text-primary)] leading-tight line-clamp-2 flex-1">
          {doc.title}
        </Typography>
        {doc.status !== 'uploaded' && (
          <Box
            className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.status === "verified"
              ? "bg-green-100 text-green-700"
              : doc.status === "rejected"
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-700"
              }`}
          >
            {CamelCase(doc.status)}
          </Box>
        )}
      </Box>

      <Typography className="text-[11px] text-[var(--mui-palette-primary-main)] font-semibold text-center">
        Click to preview
      </Typography>
    </Card>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const CandidateDocumentsSection: React.FC<CandidateDocumentsSectionProps> = ({ candidate }) => {
  const docs = candidate?.documents ?? {};
  const leadId: string = candidate?._id ?? "";
  const positionId: string = docs?.position?._id ?? docs?.position ?? "";

  const uploadedDocs: UploadedDoc[] = Array.isArray(docs?.uploadedDocs)
    ? docs.uploadedDocs
    : [];
  const [uploadedDocsState, setUploadedDocsState] = useState<UploadedDoc[]>(
    uploadedDocs
  );

  // ── Grouped uploaded docs ────────────────────────────────────────────────
  const grouped: Record<string, UploadedDoc[]> = {};

  (uploadedDocsState || []).forEach((doc) => {
    const key = doc.section || "additional";

    if (!grouped[key]) grouped[key] = [];

    grouped[key].push(doc);
  });
  // ── Preview modal ────────────────────────────────────────────────────────
  const [previewDoc, setPreviewDoc] = useState<UploadedDoc | null>(null);

  // ── Missing-docs upload section ──────────────────────────────────────────
  const [loadingMissing, setLoadingMissing] = useState(false);
  // Full position requirements — fetched once, reused for recomputing missing list
  const [allPositionDocs, setAllPositionDocs] = useState<DocumentRequirement[]>([]);
  const [missingDocs, setMissingDocs] = useState<GroupedDocuments>({
    resume: [], document: [], experience: [], academic: [], additional: [],
  });
  const [hasMissingLoaded, setHasMissingLoaded] = useState(false);
  const [selectedFilesMap, setSelectedFilesMap] = useState<Record<string, File[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  /** Recompute which docs are still missing given a (possibly updated) uploaded list */
  const recomputeMissing = useCallback(
    (allDocs: DocumentRequirement[], currentUploaded: UploadedDoc[]) => {
      const uploadedTypeIds = new Set(currentUploaded.map((d: any) => d.typeId ?? d._id));
      const missing = allDocs.filter((d) => !uploadedTypeIds.has(d._id));
      setMissingDocs({
        resume: missing.filter((d) => d.section === "resume"),
        document: missing.filter((d) => d.section === "document"),
        experience: missing.filter((d) => d.section === "experience"),
        academic: missing.filter((d) => d.section === "academic"),
        additional: missing.filter((d) => d.section === "additional"),
      });
    },
    []
  );

  const loadMissingDocs = useCallback(async () => {
    if (!positionId || hasMissingLoaded) return;
    setLoadingMissing(true);
    try {
      const res = await getPositionDetailsAction({ positionId });
      if (res?.data?.success) {
        const required: any[] = res.data?.data.requiredDocuments ?? [];
        const mandatory: any[] = res.data?.data.mandatoryDocuments ?? [];

        const docMap = new Map<string, DocumentRequirement>();
        required.forEach((d: any) => docMap.set(d._id, { ...d, isMandatory: false }));
        mandatory.forEach((d: any) => docMap.set(d._id, { ...d, isMandatory: true }));

        const allDocs = Array.from(docMap.values()) as DocumentRequirement[];
        setAllPositionDocs(allDocs);
        recomputeMissing(allDocs, uploadedDocsState);
        setHasMissingLoaded(true);
      } else {
        toast.error(res?.data?.message ?? "Failed to load document requirements");
      }
    } finally {
      setLoadingMissing(false);
    }
  }, [positionId, hasMissingLoaded, uploadedDocsState, recomputeMissing]);

  // Load missing docs once on mount (if position is known)
  useEffect(() => {
    if (positionId) loadMissingDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionId]);

  const handleFilesUpdate = (typeId: string, files: File[]) => {
    setSelectedFilesMap((prev) => ({ ...prev, [typeId]: files }));
  };

  const hasPendingFiles = Object.values(selectedFilesMap).flat().length > 0;

  const handleUploadMissing = async () => {
    if (!leadId) return toast.error("Lead ID missing");
    if (!hasPendingFiles) return toast.error("No files selected");

    setIsSaving(true);
    try {
      const mappedDocs: { typeId: string; uploadId: string }[] = [];

      for (const [typeId, files] of Object.entries(selectedFilesMap)) {
        if (!files.length) continue;
        for (const file of files) {
          const uploadRes = await uploadFileAction(file);
          if (uploadRes?.data?.success && uploadRes.data?.data?.uploadId) {
            mappedDocs.push({ typeId, uploadId: uploadRes.data.data?.uploadId });
          } else {
            toast.error(`Failed to upload ${file.name}`);
            setIsSaving(false);
            return;
          }
        }
      }

      if (mappedDocs.length > 0) {
        const saveRes = await saveMappedDocumentsAction({
          leadId,
          documents: mappedDocs,
          position: positionId,
        });
        if (saveRes?.data?.success) {
          const refreshed = await getCandidateDocumentsAction({ leadId });

          if (refreshed?.data?.success) {
            const freshDocs: UploadedDoc[] =
              refreshed?.data?.data?.lead?.documents?.uploadedDocs ?? [];
            setUploadedDocsState(freshDocs);
            // Recompute missing list immediately from the fresh uploaded docs
            // using the already-loaded position requirements — no extra fetch needed
            recomputeMissing(allPositionDocs, freshDocs);
          }

          setSelectedFilesMap({});
          toast.success("Documents uploaded successfully.");
        } else {
          toast.error(saveRes?.data?.message ?? "Failed to save documents");
        }
      }
    } catch {
      toast.error("An error occurred during upload");
    } finally {
      setIsSaving(false);
    }
  };

  const totalMissing =
    missingDocs.resume.length +
    missingDocs.document.length +
    missingDocs.experience.length +
    missingDocs.academic.length +
    missingDocs.additional.length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Uploaded docs by section ───────────────────────────────────── */}
      {uploadedDocs.length === 0 ? (
        <Box className="py-6 text-center">
          <i className="ri-folder-open-line text-4xl text-[var(--mui-palette-text-secondary)] mb-2" />
          <Typography variant="body2" className="italic text-[var(--mui-palette-text-secondary)]">
            No documents uploaded yet
          </Typography>
        </Box>
      ) : (
        SECTION_ORDER.filter(({ key }) => grouped[key]?.length > 0).map(({ key, label }) => (
          <SectionAccordion key={key} title={label} status="uploaded" defaultExpanded>
            <Grid container spacing={2}>
              {grouped[key].map((doc) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc._id}>
                  <UploadedFileCard doc={doc} onPreview={setPreviewDoc} />
                </Grid>
              ))}
            </Grid>
          </SectionAccordion>
        ))
      )}

      {/* ── Missing docs upload ─────────────────────────────────────────── */}
      {positionId && totalMissing > 0 && (
        <Box className="mt-4">
          <SectionAccordion
            title={
              loadingMissing
                ? "Loading missing documents…"
                : totalMissing > 0
                  ? `Upload Missing Documents (${totalMissing})`
                  : "Upload Missing Documents"
            }
            defaultExpanded={false}
          >
            {loadingMissing ? (
              <Box className="flex justify-center py-6">
                <CircularProgress size={28} />
              </Box>
            ) : totalMissing === 0 ? (
              <Box className="py-4 text-center">
                <i className="ri-checkbox-circle-fill text-3xl text-green-500 mb-1" />
                <Typography variant="body2" className="text-[var(--mui-palette-text-secondary)]">
                  All required documents are already uploaded.
                </Typography>
              </Box>
            ) : (
              <Box>
                {(["resume", "document", "experience", "academic", "additional"] as const).map(
                  (sectionKey) => {
                    const sectionLabel = SECTION_ORDER.find((s) => s.key === sectionKey)?.label ?? sectionKey;
                    const sectionDocs = missingDocs[sectionKey];
                    if (!sectionDocs.length) return null;
                    return (
                      <Box key={sectionKey} className="mb-5">
                        <Typography
                          variant="subtitle2"
                          className="font-bold mb-3 text-[var(--mui-palette-text-primary)] "
                        >
                          {sectionLabel} :
                        </Typography>
                        <Grid container spacing={2}>
                          {sectionDocs.map((doc) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc._id}>
                              <UploadCard
                                title={doc.title}
                                subtitle={
                                  doc.subTitle ??
                                  (doc.supportedExtensions?.length
                                    ? `Supported: ${doc.supportedExtensions.join(", ")}`
                                    : undefined)
                                }
                                allowedFormats={doc.supportedExtensions}
                                isMandatory={doc.isMandatory}
                                multiple={doc.multiple}
                                onFilesChange={(files) => handleFilesUpdate(doc._id, files)}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    );
                  }
                )}

                <Box className="flex justify-end mt-4">
                  <Button
                    variant="contained"
                    disabled={!hasPendingFiles || isSaving}
                    onClick={handleUploadMissing}
                    className="!rounded-xl !normal-case !font-bold !px-8"
                  >
                    {isSaving ? <CircularProgress size={22} color="inherit" /> : "Upload Documents"}
                  </Button>
                </Box>
              </Box>
            )}
          </SectionAccordion>
        </Box>
      )}

      {/* ── File preview modal ─────────────────────────────────────────── */}
      <Dialog
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: "rounded-[20px] relative overflow-hidden" }}
      >
        <DialogContent className="p-0">
          {/* Header bar */}
          <Box className="flex items-center justify-between px-5 py-3 border-b border-[var(--mui-palette-divider)]">
            <Box>
              <Typography variant="subtitle1" className="font-bold leading-tight">
                {previewDoc?.title}
              </Typography>
              <Typography variant="caption" className="text-[var(--mui-palette-text-secondary)]">
                {CamelCase(previewDoc?.section ?? "")} &bull;{" "}
                <span
                  className={
                    previewDoc?.status === "verified"
                      ? "text-green-600 font-semibold"
                      : previewDoc?.status === "rejected"
                        ? "text-red-500 font-semibold"
                        : "text-blue-600 font-semibold"
                  }
                >
                  {CamelCase(previewDoc?.status ?? "")}
                </span>
              </Typography>
            </Box>
            <Box className="flex items-center gap-2">
              {/* Download link */}
              <a href={previewDoc?.path ?? "#"} download target="_blank" rel="noreferrer">
                <IconButton size="small" title="Download">
                  <i className="ri-download-2-line text-xl" />
                </IconButton>
              </a>
              <IconButton size="small" onClick={() => setPreviewDoc(null)}>
                <i className="ri-close-line text-xl" />
              </IconButton>
            </Box>
          </Box>

          {/* Preview area */}
          <Box className="flex items-center justify-center bg-[var(--mui-overlays-1)] min-h-[60vh]">
            {previewDoc && getFileType(previewDoc.path) === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewDoc.path}
                alt={previewDoc.title}
                className="max-w-full max-h-[75vh] object-contain p-4"
              />
            )}

            {previewDoc && getFileType(previewDoc.path) === "pdf" && (
              <iframe
                src={previewDoc.path}
                title={previewDoc.title}
                className="w-full min-h-[75vh] border-0"
              />
            )}

            {previewDoc && getFileType(previewDoc.path) === "other" && (
              <Box className="flex flex-col items-center gap-4 p-10">
                <i className="ri-file-line text-6xl text-[var(--mui-palette-text-secondary)]" />
                <Typography variant="body1" className="text-[var(--mui-palette-text-secondary)]">
                  Preview not available for this file type.
                </Typography>
                <a href={previewDoc.path} download target="_blank" rel="noreferrer">
                  <Button variant="contained" className="!rounded-xl !normal-case">
                    Download File
                  </Button>
                </a>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CandidateDocumentsSection;
