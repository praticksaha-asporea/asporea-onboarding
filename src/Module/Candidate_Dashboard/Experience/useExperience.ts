import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  ExperienceOption,
  AdditionalDocument,
} from "@/Types/Frontend_Payload/experience.types";
import {
  saveMappedDocumentsAction,
  getPositionDetailsAction,
  checkDocumentStatusAction,
} from "@/Services/APIs/Documents/document.actions";
import { saveExperienceTypeAction } from "@/Services/APIs/experience/experience.actions";
import { uploadFileAction } from "@/Utils/common";

export const experienceTypes: ExperienceOption[] = [
  {
    id: "fresher",
    title: "Fresher",
    description:
      "Starting your career journey. No prior work experience needed.",
    icon: "ri-graduation-cap-line",
  },
  {
    id: "domestic",
    title: "Domestic Experience",
    description: "Professional experience gained within your home country.",
    icon: "ri-briefcase-line",
  },
  {
    id: "abroad",
    title: "Abroad Experience",
    description: "Valuable work experience acquired in international settings.",
    icon: "ri-trophy-line",
  },
  {
    id: "free",
    title: "Freelancer",
    description: "Self-employed or contract-based professional work history.",
    icon: "ri-clipboard-line",
  },
];

export const useExperience = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const leadId = reduxUser?.leadId || reduxUser?.user?.leadId || "";

  const [selectedExperience, setSelectedExperience] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [additionalDocs, setAdditionalDocs] = useState<AdditionalDocument[]>(
    [],
  );
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedFilesMap, setSelectedFilesMap] = useState<
    Record<string, File[]>
  >({});
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [isReduxReady, setIsReduxReady] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [positionId, setPositionId] = useState<string>("");

  useEffect(() => {
    const urlParam = searchParams?.get("positionId");
    if (urlParam) {
      setPositionId(urlParam);
      sessionStorage.setItem("selectedPositionId", urlParam);
    } else {
      const storedId = sessionStorage.getItem("selectedPositionId") || "";
      setPositionId(storedId);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setIsReduxReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkAccessAndStatus = async () => {
      if (!isReduxReady) return;
      if (!leadId) {
        toast.error("Please generate inquiry first", { id: "guard-toast" });
        router.push("/inquiry");
        return;
      }

      setCheckingStatus(true);
      try {
        const res = await checkDocumentStatusAction(leadId);
        if (res?.success && res.data) {
          const currentStatus = res.data.status;

          if (
            currentStatus === "inquiry_pending" ||
            currentStatus === "inquiry_submitted"
          ) {
            toast.error("Please schedule pre-counselling first", {
              id: "guard-toast",
            });
            router.push(`/pre-counselling?leadId=${leadId}`);
            return;
          }

          const docCompletedStatuses = [
            "doc_submitted",
            "doc_verified",
            "exp_submitted",
            "exp_verified",
            "assess_scheduled",
            "assessment_scheduled",
            "assessment_submitted",
            "assess_completed",
          ];
          const isDocUploaded =
            res.data.documentStatus === "uploaded" ||
            res.data.documentStatus === "verified" ||
            docCompletedStatuses.includes(currentStatus);

          if (!isDocUploaded) {
            toast.error("Please upload documents first", { id: "guard-toast" });
            router.push(`/document-upload?leadId=${leadId}`);
            return;
          }

          const submittedStages = [
            "exp_submitted",
            "exp_verified",
            "assess_scheduled",
            "assessment_scheduled",
            "assessment_submitted",
            "assess_completed",
          ];
          if (submittedStages.includes(currentStatus)) {
            setIsAlreadySubmitted(true);
            if (res.data.experienceType) {
              setSelectedExperience(res.data.experienceType);
            }
          }
        }
      } catch (error) {
        console.error("Status check failed:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkAccessAndStatus();
  }, [isReduxReady, leadId, router]);

  useEffect(() => {
    const fetchDynamicDocs = async () => {
      if (!positionId) {
        setLoadingDocs(false);
        return;
      }
      setLoadingDocs(true);
      const res = await getPositionDetailsAction(positionId);
      if (res?.success) {
        const required = res.data.requiredDocuments || [];
        const mandatory = res.data.mandatoryDocuments || [];

        const docMap = new Map();
        required.forEach((d: any) =>
          docMap.set(d._id, { ...d, isMandatory: false }),
        );
        mandatory.forEach((d: any) =>
          docMap.set(d._id, { ...d, isMandatory: true }),
        );

        const allUniqueDocs = Array.from(
          docMap.values(),
        ) as AdditionalDocument[];
        const filteredDocs = allUniqueDocs.filter(
          (d) => d.section === "additional",
        );
        setAdditionalDocs(filteredDocs);
      }
      setLoadingDocs(false);
    };

    fetchDynamicDocs();
  }, [positionId]);

  const handleFilesUpdate = (typeId: string, files: File[]) => {
    setSelectedFilesMap((prev) => ({ ...prev, [typeId]: files }));
  };

  const handleSubmit = async () => {
    if (!leadId)
      return toast.error("Lead ID missing. Please refresh or login again.");
    if (!selectedExperience)
      return toast.error("Please select an experience type.");

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
        const docSaveRes = await saveMappedDocumentsAction({
          leadId,
          documents: mappedDocs,
          position: positionId
        });

        if (!docSaveRes?.success) {
          toast.error(docSaveRes?.message || "Failed to save additional documents.");
          setIsSubmitting(false);
          return;
        }
      }

      const expRes = await saveExperienceTypeAction({
        leadId,
        experienceType: selectedExperience,
      });
      if (expRes?.success) {
        toast.success("Experience details saved successfully!");
        router.push("/applicationtracking");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
    handleSubmit,
  };
};
