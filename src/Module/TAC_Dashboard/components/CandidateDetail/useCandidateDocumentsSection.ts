import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { getPositionDetailsAction, saveMappedDocumentsAction, getCandidateDocumentsAction } from "@/Services/APIs/Documents/document.actions";
import { uploadFileAction } from "@/Utils/common";
import { DocumentRequirement, GroupedDocuments } from "@/Types/Frontend_Payload/document.types";
import { DocumentBaseCandidate } from "@/Types/Frontend_Payload/Candidate.types";
import { UploadedDoc } from "@/Types/Frontend_Payload/document.types";



export const SECTION_ORDER: Array<{ key: string; label: string }> = [
  { key: "resume", label: "Resume" },
  { key: "document", label: "Documents" },
  { key: "experience", label: "Experience Certificates" },
  { key: "academic", label: "Academic Certificates" },
  { key: "additional", label: "Additional" },
];

export function getFileType(path: string): "image" | "pdf" | "other" {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return "other";
}

export const useCandidateDocumentsSection = (candidate: DocumentBaseCandidate) => {
  const docs = candidate.documents ?? {};
  const leadId: string = candidate._id;

  const positionObj = docs.position;
  const positionId: string = typeof positionObj === "object" && positionObj !== null
    ? (positionObj as { _id: string })._id
    : (positionObj as string) ?? "";

  const uploadedDocs: UploadedDoc[] = Array.isArray(docs.uploadedDocs) ? docs.uploadedDocs : [];
  const [uploadedDocsState, setUploadedDocsState] = useState<UploadedDoc[]>(uploadedDocs);

  const grouped: Record<string, UploadedDoc[]> = {};
  (uploadedDocsState || []).forEach((doc) => {
    const key = doc.section || "additional";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(doc);
  });

  const [previewDoc, setPreviewDoc] = useState<UploadedDoc | null>(null);
  const [loadingMissing, setLoadingMissing] = useState(false);
  const [allPositionDocs, setAllPositionDocs] = useState<DocumentRequirement[]>([]);
  const [missingDocs, setMissingDocs] = useState<GroupedDocuments>({ resume: [], document: [], experience: [], academic: [], additional: [] });
  const [hasMissingLoaded, setHasMissingLoaded] = useState(false);
  const [selectedFilesMap, setSelectedFilesMap] = useState<Record<string, File[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const recomputeMissing = useCallback((allDocs: DocumentRequirement[], currentUploaded: UploadedDoc[]) => {
    const uploadedTypeIds = new Set(currentUploaded.map((d: any) => d.typeId ?? d._id));
    const missing = allDocs.filter((d) => !uploadedTypeIds.has(d._id));
    setMissingDocs({
      resume: missing.filter((d) => d.section === "resume"),
      document: missing.filter((d) => d.section === "document"),
      experience: missing.filter((d) => d.section === "experience"),
      academic: missing.filter((d) => d.section === "academic"),
      additional: missing.filter((d) => d.section === "additional"),
    });
  }, []);

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
      } else { toast.error(res?.data?.message ?? "Failed to load document requirements"); }
    } finally { setLoadingMissing(false); }
  }, [positionId, hasMissingLoaded, uploadedDocsState, recomputeMissing]);

  useEffect(() => { if (positionId) loadMissingDocs(); }, [positionId, loadMissingDocs]);

  const handleFilesUpdate = (typeId: string, files: File[]) => { setSelectedFilesMap((prev) => ({ ...prev, [typeId]: files })); };
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
          } else { toast.error(`Failed to upload ${file.name}`); setIsSaving(false); return; }
        }
      }
      if (mappedDocs.length > 0) {
        const saveRes = await saveMappedDocumentsAction({ leadId, documents: mappedDocs, position: positionId });
        if (saveRes?.data?.success) {
          const refreshed = await getCandidateDocumentsAction({ leadId });
          if (refreshed?.data?.success) {
            const freshDocs: UploadedDoc[] = refreshed?.data?.data?.lead?.documents?.uploadedDocs ?? [];
            setUploadedDocsState(freshDocs);
            recomputeMissing(allPositionDocs, freshDocs);
          }
          setSelectedFilesMap({});
          toast.success("Documents uploaded successfully.");
        } else { toast.error(saveRes?.data?.message ?? "Failed to save documents"); }
      }
    } catch { toast.error("An error occurred during upload"); } finally { setIsSaving(false); }
  };

  const totalMissing = missingDocs.resume.length + missingDocs.document.length + missingDocs.experience.length + missingDocs.academic.length + missingDocs.additional.length;

  return { uploadedDocs: uploadedDocsState, grouped, previewDoc, setPreviewDoc, loadingMissing, missingDocs, isSaving, hasPendingFiles, handleFilesUpdate, handleUploadMissing, totalMissing, positionId };
};