import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { updateUserData } from "@/Redux/Auth/user.slice";
import {
  userDetailsAction,
  getInquiryDetailsAction,
} from "@/Services/APIs/Inquiry/inquiry.action";
import { getJourneyTimelineAction } from "@/Services/APIs/Assessment/assessment.actions";

export const useInquiryProgress = (
  userData: any,
  fetchExternalSources: (
    referedType: string,
    setFieldValue: (field: string, value: string) => void,
  ) => Promise<void>,
  setFormikValues: (updateFn: (prev: any) => any) => void,
  setFieldValue: (field: string, value: any) => void,
) => {
  const dispatch = useDispatch();
  const checkedLeadIdRef = useRef<string | null>(null);

  const [activeStepperStep, setActiveStepperStep] = useState<number>(0);
  const [formStep, setFormStep] = useState<0 | 1>(0);
  const [inquiryId, setInquiryId] = useState<string>("");

  const formStepRef = useRef<0 | 1>(0);
  useEffect(() => {
    formStepRef.current = formStep;
  }, [formStep]);

  // Fresh user profile fetch
  useEffect(() => {
    const fetchFreshProfile = async () => {
      const userId = userData?.id || userData?._id;
      if (!userId || userData?.leadId) return;

      try {
        const res = await userDetailsAction({ userId });
        if (res.data?.success && res.data?.data) {
          const actualProfileData = res.data.data.user || res.data.data;
          dispatch(updateUserData(actualProfileData));
        }
      } catch (err) {
        console.error("Fresh profile fetch error:", err);
      }
    };

    fetchFreshProfile();
  }, [userData?.id, userData?._id, userData?.leadId, dispatch]);

  // Timeline progress sync
  useEffect(() => {
    const fetchRealProgress = async () => {
      const existingLeadId =
        userData?.leadId || userData?.candidateProfile?.leadId;

      if (!existingLeadId) {
        setActiveStepperStep(0);
        return;
      }

      try {
        const res = await getJourneyTimelineAction({ leadId: existingLeadId });
        if (res?.data?.success && res?.data) {
          setActiveStepperStep(res?.data?.data?.activeStep);
        } else {
          setActiveStepperStep(1);
        }
      } catch (error) {
        console.error("Failed to sync actual stepper progress:", error);
        setActiveStepperStep(1);
      }
    };

    fetchRealProgress();
  }, [userData?.leadId, userData?.candidateProfile?.leadId]);

  // Existing lead detail prefill
  useEffect(() => {
    const existingLeadId =
      userData?.leadId || userData?.candidateProfile?.leadId;

    if (!existingLeadId || checkedLeadIdRef.current === existingLeadId) {
      return;
    }

    const reverseTypeMap: Record<string, string> = {
      web_app: "web-app",
      telecall: "call",
      social: "social",
      refer: "reffer",
    };

    const reverseRefTypeMap: Record<string, string> = {
      institute: "institution",
      pca: "pca",
      pcra: "pcra",
      other: "other",
    };

    const fetchExistingLeadData = async () => {
      checkedLeadIdRef.current = existingLeadId;

      try {
        const res = await getInquiryDetailsAction(existingLeadId);

        if (res && res.data?.success && res.data?.data) {
          const lead = res.data.data;
          setInquiryId(existingLeadId);
          setFormStep(1);

          const dbSourceType = lead.source?.type;
          const uiReferedFrom = dbSourceType
            ? reverseTypeMap[dbSourceType] || "web-app"
            : "web-app";

          const dbRefType = lead.source?.refType;
          const uiReferedType = dbRefType
            ? reverseRefTypeMap[dbRefType] || dbRefType
            : "";

          const dbRefName = lead.source?.refName;
          const isOtherReferral = uiReferedType === "other";

          if (uiReferedType && uiReferedType !== "other") {
            await fetchExternalSources(uiReferedType, setFieldValue);
          }

          setFormikValues((prev: any) => ({
            ...prev,
            fullName: lead.fullName || prev.fullName,
            email: lead.contact?.email || prev.email,
            phoneNumber: lead.contact?.phone
              ? String(lead.contact.phone)
              : prev.phoneNumber,
            whatsappNumber: lead.contact?.whatsapp
              ? String(lead.contact.whatsapp)
              : prev.whatsappNumber,
            inquiryCategory: lead.inqForType || prev.inquiryCategory,
            inquiryFor: lead.inqForPosition || prev.inquiryFor,
            referedFrom: uiReferedFrom,
            referedType: uiReferedType,
            referedBy: !isOtherReferral ? dbRefName || "" : "other",
            otherReferedBy: isOtherReferral ? dbRefName || "" : "",
          }));
        } else {
          setInquiryId("");
          setFormStep(0);

          dispatch(
            updateUserData({
              leadId: undefined,
              candidateProfile: {
                ...userData?.candidateProfile,
                leadId: undefined,
              },
            }),
          );

          setFieldValue("inquiryCategory", "");
          setFieldValue("inquiryFor", "");
        }
      } catch (error) {
        console.error("Lead fetch error:", error);
        setInquiryId("");
        setFormStep(0);
        setFieldValue("inquiryCategory", "");
        setFieldValue("inquiryFor", "");
      }
    };

    fetchExistingLeadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.leadId, userData?.candidateProfile?.leadId]);

  return {
    activeStepperStep,
    formStep,
    setFormStep,
    inquiryId,
    setInquiryId,
    checkedLeadIdRef,
    formStepRef,
  };
};