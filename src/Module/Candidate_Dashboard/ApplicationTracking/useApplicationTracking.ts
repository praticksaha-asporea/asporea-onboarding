import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getJourneyTimelineAction } from "@/Services/APIs/Assessment/assessment.actions";
import { JourneyData } from "@/Types/Frontend_Payload/tracking.types";
import { CamelCase } from "@/Utils/common";

export const useApplicationTracking = () => {
  const router = useRouter();
  const reduxUser = useSelector((state: any) => state.userSlice?.userData || state.user?.userData);
  const leadId = reduxUser?.leadId || reduxUser?.user?.leadId || "";

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [isReduxReady, setIsReduxReady] = useState(false);

  let docStatus = "";
  let expStatus = "";
  let assessDescription = "";
  let docDescription = "";
  let expDescription = "";
  let preCounsellingDescription = "";
  let assessButtonLabel: null | string = "";
  let arePrerequisitesMet = false;

  useEffect(() => {
    const timer = setTimeout(() => setIsReduxReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchJourney = async () => {
      if (!leadId) return;
      try {
        setLoading(true);
        const res = await getJourneyTimelineAction(leadId);
        console.log("Journey Timeline Response:", res);

        if (res?.success && res.data) {
          setJourneyData(res.data);

          docStatus = res?.data?.documents?.status;
          expStatus = res?.data?.experience?.status;
          const isDocsUploaded = docStatus !== "" && docStatus !== "na" && docStatus !== "pending";

          docDescription = docStatus === "waiting for approval"
            ? "Your documents have been submitted to the TAC Head and are currently waiting for approval."
            : docStatus === "verified"
              ? "All uploaded documents have been verified and approved. Good job!"
              : docStatus === "rejected"
                ? "Some of your documents were rejected. Please review and upload valid files."
                : !isDocsUploaded
                  ? "Please upload your required documents."
                  : "Your uploaded documents are under review.";

          const isExpSubmitted =
            (expStatus !== "" && expStatus !== "na" && expStatus !== "pending") ||
            !!res.data.experience?.type;
          arePrerequisitesMet = isDocsUploaded && isExpSubmitted;
          expDescription =
            expStatus === "waiting for technical round"
              ? "Your profile has been referred for a technical round evaluation. Please wait for your slot scheduling."
              : expStatus === "verified"
                ? "Your experience certificates and history have been successfully verified."
                : expStatus === "rejected"
                  ? "Your experience details were rejected. Please update with valid details."
                  : !isExpSubmitted
                    ? "Please fill and submit your experience details for review."
                    : res?.data?.experience?.type
                      ? `Your experience type has been confirmed as '${res?.data?.experience?.type === "free" ? 'Freelancer' : CamelCase(res?.data?.experience?.type)}'.`
                      : "Your experience details are under review."
            ;

          preCounsellingDescription = res?.data.preCounselling.status === "Completed"
            ? "Your pre-counselling session has been successfully completed and verified by the consultant."
            : res?.data.preCounselling.status === "pre_scheduled"
              ? "Your pre-counselling session is successfully scheduled. Please be available at your selected date and time slot."
              : "Please confirm your readiness for pre-counselling sessions. This is a crucial step.";

          assessButtonLabel = res?.data.assessment.hasResult
            ? null
            : res?.data.assessment.status === "Scheduled"
              ? "Scheduled"
              : res?.data.assessment.status === "Rejected" ?
                "Rejected" :
                res?.data.assessment.canSchedule
                  ? arePrerequisitesMet
                    ? "Schedule Assessment"
                    : "Doc. & Exp."
                  : "Wait for Pre-Counselling";

          if (res.data.assessment.status === "Completed") {
            assessDescription = "Your assessment has been evaluated successfully.";
          } else if (
            res.data.assessment.status === "Scheduled"
          ) {
            if (
              docStatus === "Verified" &&
              expStatus === "Verified"
            ) {
              assessDescription = "Your Documents & Experiences are verified.";
              if (res.data.assessment.assessLatestStatus?.status === "rejected") {
                assessDescription = "You are failed to this assessment.";

              }
              else if (res.data.assessment.assessLatestStatus?.status === "completed") {
                assessDescription = "You are passsed to this assessment.";

              }
            }
            else if (
              docStatus === "Verified" &&
              expStatus === "Waiting for Technical Round"
            ) {
              assessDescription =
                "You will need to complete technical round to verify experience.";
            }
            else if (
              docStatus === "Verified" &&
              expStatus === "Filled"
            ) {
              assessDescription =
                "Your Documents are verified. Now waiting for experience check.";
            }
            else if (
              docStatus === "Waiting For Approval"
            ) {
              assessDescription = "Your Documents are waiting for approval.";
            }
            else if (
              docStatus === "Rejected" &&
              expStatus === "Rejected"
            ) {
              assessDescription = "Your Documents & Experiences are rejected.";
            }
            else if (
              docStatus === "Rejected"
            ) {
              assessDescription = "Your Documents are rejected.";
            }
            else if (res.data.assessment.assessLatestStatus?.token?.generated) {
              assessDescription =
                "Your Assessment token has been generated. Please be within the Branch Premises.";
            }
            else {
              assessDescription =
                "Your Assessment is successfully Scheduled. Please be ready on your selected slot.";
            }

          }
          else if (!arePrerequisitesMet && res.data.assessment.canSchedule) {
            assessDescription =
              "Documents Submission and Experience Submission are mandatory before scheduling. Please complete them from your dashboard first.";
          } else if (res.data.assessment.canSchedule) {
            assessDescription =
              "Your initial online assessment is pending. Please schedule it by the deadline.";
          } else {
            assessDescription = "Wait for Pre-Counselling phase completion.";
            if (res.data.assessment.assessLatestStatus?.status === "rejected") {
              assessDescription = "You are failed to this assessment.";

            }
          }
        } else {
          toast.error(res?.message || "Failed to fetch application timeline", { id: "journey-error" });
        }
      } catch (err) {
        toast.error("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchJourney();
  }, [leadId]);

  return {
    router, leadId, isPopupOpen, setIsPopupOpen, loading, journeyData, isReduxReady, preCounsellingDescription, docDescription,
    expDescription, assessDescription, assessButtonLabel, arePrerequisitesMet
  };
};