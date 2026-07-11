import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import { getJourneyTimelineAction } from "@/Services/APIs/Assessment/assessment.actions";
import { JourneyData } from "@/Types/Frontend_Payload/tracking.types";
import { CamelCase } from "@/Utils/common";

export const useApplicationTracking = () => {
  const router = useRouter();

  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData
  );

  const leadId =
    reduxUser?.leadId ||
    reduxUser?.user?.leadId ||
    "";

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [isReduxReady, setIsReduxReady] = useState(false);

  const [docStatus, setDocStatus] = useState("");
  const [expStatus, setExpStatus] = useState("");

  const [docDescription, setDocDescription] = useState("");
  const [expDescription, setExpDescription] = useState("");
  const [preCounsellingDescription, setPreCounsellingDescription] =
    useState("");
  const [assessDescription, setAssessDescription] = useState("");

  const [assessButtonLabel, setAssessButtonLabel] =
    useState<string | null>("");

  const [arePrerequisitesMet, setArePrerequisitesMet] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReduxReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Normalize status
   */
  const normalizeStatus = (status?: string) =>
    (status || "").trim().toLowerCase();

  /**
   * Document Description
   */
  const getDocumentDescription = useCallback((status: string) => {
    switch (normalizeStatus(status)) {
      case "waiting for approval":
        return "Your documents have been submitted to the TAC Head and are currently waiting for approval.";

      case "verified":
        return "All uploaded documents have been verified and approved. Good job!";

      case "rejected":
        return "Some of your documents were rejected. Please review and upload valid files.";

      case "":
      case "na":
      case "pending":
        return "Please upload your required documents.";

      default:
        return "Your uploaded documents are under review.";
    }
  }, []);

  /**
   * Experience Description
   */
  const getExperienceDescription = useCallback(
    (status: string, experienceType?: string) => {
      switch (normalizeStatus(status)) {
        case "waiting for technical round":
          return "Your profile has been referred for a technical round evaluation. Please wait for your slot scheduling.";

        case "verified":
          return "Your experience certificates and history have been successfully verified.";

        case "rejected":
          return "Your experience details were rejected. Please update with valid details.";

        case "":
        case "na":
        case "pending":
          if (!experienceType) {
            return "Please fill and submit your experience details for review.";
          }
          break;
      }

      if (experienceType) {
        return `Your experience type has been confirmed as '${experienceType === "free"
          ? "Freelancer"
          : CamelCase(experienceType)
          }'.`;
      }

      return "Your experience details are under review.";
    },
    []
  );

  /**
   * Assessment Description
   */
  const getAssessmentDescription = useCallback(
    (
      assessment: any,
      normalizedDocStatus: string,
      normalizedExpStatus: string,
      prerequisitesMet: boolean
    ) => {
      if (!assessment) return "";

      if (assessment.status === "Completed") {
        return "Your assessment has been evaluated successfully.";
      }

      if (assessment.status === "Scheduled") {
        if (
          assessment.assessLatestStatus?.status === "rejected"
        ) {
          return "You have failed this assessment.";
        }

        if (
          assessment.assessLatestStatus?.status === "completed"
        ) {
          return "You have passed this assessment.";
        }

        if (
          normalizedDocStatus === "verified" &&
          normalizedExpStatus === "verified"
        ) {
          return "Your Documents & Experience have been verified.";
        }

        if (
          normalizedDocStatus === "verified" &&
          normalizedExpStatus === "waiting for technical round"
        ) {
          return "You will need to complete the technical round to verify your experience.";
        }

        if (
          normalizedDocStatus === "verified" &&
          normalizedExpStatus === "filled"
        ) {
          return "Your documents are verified. Waiting for experience verification.";
        }

        if (
          normalizedDocStatus === "waiting for approval"
        ) {
          return "Your documents are waiting for approval.";
        }

        if (
          normalizedDocStatus === "rejected" &&
          normalizedExpStatus === "rejected"
        ) {
          return "Your documents and experience have been rejected.";
        }

        if (normalizedDocStatus === "rejected") {
          return "Your documents have been rejected.";
        }

        if (
          assessment.assessLatestStatus?.token?.generated
        ) {
          return "Your assessment token has been generated. Please be within the Branch Premises.";
        }

        return "Your assessment has been successfully scheduled. Please be ready on your selected slot.";
      }

      if (!prerequisitesMet && assessment.canSchedule) {
        return "Documents Submission and Experience Submission are mandatory before scheduling. Please complete them from your dashboard first.";
      }

      if (assessment.canSchedule) {
        return "Your initial online assessment is pending. Please schedule it by the deadline.";
      }

      if (
        assessment.assessLatestStatus?.status === "rejected"
      ) {
        return "You have failed this assessment.";
      }

      return "Wait for Pre-Counselling completion.";
    },
    []
  );

  const fetchJourney = useCallback(async () => {
    if (!leadId) return;

    try {
      setLoading(true);

      const res = await getJourneyTimelineAction(leadId);

      console.log("Journey Timeline Response:", res);

      if (!res?.success || !res?.data) {
        toast.error(
          res?.message || "Failed to fetch application timeline",
          { id: "journey-error" }
        );
        return;
      }

      const data = res.data;

      setJourneyData(data);

      // Continue in Part 2...
      const normalizedDocStatus = normalizeStatus(data.documents?.status);
      const normalizedExpStatus = normalizeStatus(data.experience?.status);

      setDocStatus(data.documents?.status || "");
      setExpStatus(data.experience?.status || "");

      const isDocsUploaded =
        !["", "na", "pending"].includes(normalizedDocStatus);

      const isExperienceSubmitted =
        !["", "na", "pending"].includes(normalizedExpStatus) ||
        !!data.experience?.type;

      const prerequisitesMet =
        isDocsUploaded && isExperienceSubmitted;

      setArePrerequisitesMet(prerequisitesMet);

      // Descriptions
      setDocDescription(
        getDocumentDescription(data.documents?.status || "")
      );

      setExpDescription(
        getExperienceDescription(
          data.experience?.status || "",
          data.experience?.type
        )
      );

      setAssessDescription(
        getAssessmentDescription(
          data.assessment,
          normalizedDocStatus,
          normalizedExpStatus,
          prerequisitesMet
        )
      );

      setPreCounsellingDescription(
        data.preCounselling?.status === "Completed"
          ? "Your pre-counselling session has been successfully completed and verified by the consultant."
          : data.preCounselling?.status === "Scheduled"
            ? "Your pre-counselling session is successfully scheduled. Please be available at your selected date and time slot."
            : "Please confirm your readiness for pre-counselling sessions. This is a crucial step."
      );

      // Assessment Button
      if (data.assessment?.hasResult) {
        setAssessButtonLabel(null);
      } else if (data.assessment?.status === "Scheduled") {
        setAssessButtonLabel("Scheduled");
      } else if (data.assessment?.status === "Rejected") {
        setAssessButtonLabel("Rejected");
      } else if (data.assessment?.canSchedule) {
        setAssessButtonLabel(
          prerequisitesMet
            ? "Schedule Assessment"
            : "Doc. & Exp."
        );
      } else {
        setAssessButtonLabel("Wait for Pre-Counselling");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    leadId,
    getAssessmentDescription,
    getDocumentDescription,
    getExperienceDescription,
  ]);

  useEffect(() => {
    if (!leadId) return;

    fetchJourney();
  }, [leadId, fetchJourney]);

  return {
    router,
    leadId,
    loading,
    journeyData,
    isReduxReady,
    isPopupOpen,
    setIsPopupOpen,
    docStatus,
    expStatus,
    docDescription,
    expDescription,
    preCounsellingDescription,
    assessDescription,
    assessButtonLabel,
    arePrerequisitesMet,
  };
};