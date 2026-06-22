import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  Position,
  GroupedDocuments,
  DocumentRequirement,
} from "@/Types/Frontend_Payload/document.types";
import {
  getPositionsListAction,
  getPositionDetailsAction,
  saveMappedDocumentsAction,
  checkDocumentStatusAction,
} from "@/Services/APIs/Documents/document.actions";
import { getJourneyTimelineAction } from "@/Services/APIs/Assessment/assessment.actions";
import { uploadFileAction } from "@/Utils/common";

export const useDocumentUpload = () => {
  const router = useRouter();
  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const leadId = reduxUser?.leadId || reduxUser?.user?.leadId || "";

  const [activeStep, setActiveStep] = useState<number>(2);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(true);
  const [isReduxReady, setIsReduxReady] = useState(false);

  const [groupedDocs, setGroupedDocs] = useState<GroupedDocuments>({
    resume: [],
    document: [],
    experience: [],
    academic: [],
    additional: [],
  });

  const [selectedFilesMap, setSelectedFilesMap] = useState<
    Record<string, File[]>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isPreLocked, setIsPreLocked] = useState(false);
  const [isValidLead, setIsValidLead] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsReduxReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkAccessAndStatus = async () => {
      if (!isReduxReady) return;
      if (!leadId) {
        toast.error("Please generate inquiry first", {
          id: "doc-guard-inquiry",
        });
        router.push("/inquiry");
        return;
      }
      setCheckingStatus(true);
      try {
        const timelineRes = await getJourneyTimelineAction(leadId);
        if (
          timelineRes?.success === false &&
          timelineRes?.message?.toLowerCase().includes("not found")
        ) {
          setIsValidLead(false);
          return;
        }
        if (timelineRes?.success && timelineRes.data) {
          const currentActiveStep = timelineRes.data.activeStep;
          const preCounsellingStatus = timelineRes.data?.preCounselling?.status;
          setActiveStep(currentActiveStep);
          if (preCounsellingStatus !== "Completed") {
            setIsPreLocked(true);
          } else {
            setIsPreLocked(false);
          }
          if (currentActiveStep < 2 && preCounsellingStatus !== "Completed") {
            toast.error(
              "Please schedule pre-counselling first and wait for completion",
              { id: "doc-guard-precoun" },
            );
            router.push(`/pre-counselling?leadId=${leadId}`);
            return;
          }
        }
        const res = await checkDocumentStatusAction(leadId);
        if (res?.success && res.data) {
          const submittedStages = [
            "doc_submitted",
            "doc_verified",
            "exp_submitted",
            "exp_verified",
            "assess_scheduled",
            "assessment_scheduled",
            "assessment_submitted",
          ];
          if (
            submittedStages.includes(res.data.status) ||
            res.data.documentStatus === "uploaded" || res.data.documentStatus === "verified"
          ) {
            setIsAlreadySubmitted(true);
          }
        }
      } catch (err: any) {
        if (
          err?.response?.status === 404 ||
          err?.response?.data?.message?.toLowerCase().includes("not found")
        ) {
          setIsValidLead(false);
        }
        console.error("Error pulling timeline or status", err);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkAccessAndStatus();
  }, [isReduxReady, leadId, router]);

  useEffect(() => {
    const fetchPositions = async () => {
      setLoadingPositions(true);
      const res = await getPositionsListAction();
      if (res?.success) setPositions(res.data);
      else toast.error(res?.message || "Failed to load positions");
      setLoadingPositions(false);
    };
    fetchPositions();
  }, []);

  useEffect(() => {
    if (!selectedPosition) {
      setGroupedDocs({
        resume: [],
        document: [],
        experience: [],
        academic: [],
        additional: [],
      });
      setHasDocuments(true);
      return;
    }
    const fetchDocs = async () => {
      setLoadingDocs(true);
      const res = await getPositionDetailsAction(selectedPosition);
      if (res?.success) {
        const required = res.data.requiredDocuments || [];
        const mandatory = res.data.mandatoryDocuments || [];
        if (required.length === 0 && mandatory.length === 0)
          setHasDocuments(false);
        else setHasDocuments(true);

        const docMap = new Map();
        required.forEach((d: any) =>
          docMap.set(d._id, { ...d, isMandatory: false }),
        );
        mandatory.forEach((d: any) =>
          docMap.set(d._id, { ...d, isMandatory: true }),
        );
        const allUniqueDocs = Array.from(
          docMap.values(),
        ) as DocumentRequirement[];

        setGroupedDocs({
          resume: allUniqueDocs.filter((d) => d.section === "resume"),
          document: allUniqueDocs.filter((d) => d.section === "document"),
          experience: allUniqueDocs.filter((d) => d.section === "experience"),
          academic: allUniqueDocs.filter((d) => d.section === "academic"),
          additional: [],
        });
      }
      setLoadingDocs(false);
    };
    fetchDocs();
  }, [selectedPosition]);

  const handleFilesUpdate = (typeId: string, files: File[]) => {
    setSelectedFilesMap((prev) => ({ ...prev, [typeId]: files }));
  };

  const handleSubmit = async () => {
    if (!leadId) return toast.error("Session expired or Lead ID missing.");

    const allRequiredDocs = [
      ...groupedDocs.resume,
      ...groupedDocs.document,
      ...groupedDocs.experience,
      ...groupedDocs.academic,
    ];

    const missingMandatory = allRequiredDocs.filter(
      (d) =>
        d.isMandatory &&
        (!selectedFilesMap[d._id] || selectedFilesMap[d._id].length === 0),
    );
    if (missingMandatory.length > 0)
      return toast.error("Please upload all mandatory documents.");

    const hasFiles = Object.values(selectedFilesMap).flat().length > 0;
    if (!hasFiles)
      return router.push(`/experience?positionId=${selectedPosition}`);

    setIsSubmitting(true);
    try {
      const mappedDocs = [];
      for (const [typeId, files] of Object.entries(selectedFilesMap)) {
        for (const file of files) {
          const uploadRes = await uploadFileAction(file);
          if (uploadRes?.success && uploadRes.data?.uploadId) {
            mappedDocs.push({ typeId, uploadId: uploadRes.data.uploadId });
          } else {
            toast.error(`Failed to upload ${file.name}`);
            setIsSubmitting(false);
            return;
          }
        }
      }
      if (mappedDocs.length > 0) {
        const saveRes = await saveMappedDocumentsAction({
          leadId,
          documents: mappedDocs,
          position: selectedPosition,
        });
        if (saveRes?.success) {
          toast.success("Documents uploaded successfully!");
          router.push(`/experience?positionId=${selectedPosition}`);
        } else
          toast.error(saveRes?.message || "Failed to save document records.");
      }
    } catch (err) {
      toast.error("An error occurred during the upload process.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    router,
    leadId,
    activeStep,
    positions,
    selectedPosition,
    setSelectedPosition,
    loadingPositions,
    loadingDocs,
    hasDocuments,
    groupedDocs,
    isSubmitting,
    isAlreadySubmitted,
    checkingStatus,
    isPreLocked,
    handleFilesUpdate,
    handleSubmit,
    isReduxReady,
    isValidLead,
  };
};
