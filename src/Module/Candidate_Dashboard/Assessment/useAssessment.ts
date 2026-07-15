import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";

import { updateUserData } from "@/Redux/Auth/user.slice";

import {
  scheduleAssessmentAction,
  getTechnicalResultAction,
  getAssessmentResultAction,
} from "@/Services/APIs/Assessment/assessment.actions";

import {
  getSlotsAction,
  checkBookingStatusAction,
} from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import {
  Slot,
  Checklist,
  NotificationChannels,
  TechData,
} from "@/Types/Frontend_Payload/assessment.types";
import { getJourneyTimelineAction } from "@/Services/APIs/Assessment/assessment.actions";
import { profileUpdateApi } from "@/Services/APIs/auth/auth.actions";

export const useAssessment = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );

  const reduxLeadId = reduxUser?.leadId || reduxUser?.user?.leadId || "";
  const leadId = searchParams?.get("leadId") || reduxLeadId;

  const reduxConsultantId =
    reduxUser?.prefferedConsultant ||
    reduxUser?.user?.prefferedConsultant ||
    reduxUser?.preferences?.consultantId ||
    reduxUser?.user?.preferences?.consultantId;

  let initialConsultantId = searchParams?.get("consultantId") || "";
  if (!initialConsultantId && reduxConsultantId) {
    initialConsultantId =
      typeof reduxConsultantId === "object"
        ? reduxConsultantId._id || ""
        : reduxConsultantId;
  }

  const defaultMethod =
    (reduxUser?.visitOption ?? reduxUser?.user?.visitOption) === 2
      ? "on"
      : "off";
  const viewParam = searchParams?.get("view");
  const isAssessmentResult = viewParam === "result";
  const isTechnicalResult = viewParam === "technical";
  const isBookingMode = !isAssessmentResult && !isTechnicalResult;

  const serverNow = new Date();
  const todayStr = new Date(
    serverNow.getTime() + serverNow.getTimezoneOffset() * 60000 + 330 * 60000,
  )
    .toISOString()
    .split("T")[0];

  const [fetchedConsultantId, setFetchedConsultantId] = useState<string>("");

  const finalConsultantId = initialConsultantId || fetchedConsultantId;

  const [techData, setTechData] = useState<TechData | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [loadingTech, setLoadingTech] = useState(false);
  const [date, setDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [visitMethod, setVisitMethod] = useState<"on" | "off">(defaultMethod);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false);
  const [isEditingChannels, setIsEditingChannels] = useState<boolean>(false);
  const [isAlreadyScheduled, setIsAlreadyScheduled] = useState<boolean>(false);
  const [isAssessmentCompleted, setIsAssessmentCompleted] = useState<boolean>(false);
  const [scheduledDetails, setScheduledDetails] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  const [checklist, setChecklist] = useState<Checklist>({
    documents: false,
    environment: false,
    aspirations: false,
    lighting: false,
  });

  const isChecklistComplete =
    checklist.documents &&
    checklist.environment &&
    checklist.aspirations &&
    checklist.lighting;

  const [channels, setChannels] = useState<NotificationChannels>({
    email: reduxUser?.notificationPreference?.email ?? true,
    whatsapp: reduxUser?.notificationPreference?.whatsapp ?? false,
    sms: reduxUser?.notificationPreference?.sms ?? false,
  });


  useEffect(() => {
    if (reduxUser?.notificationPreference) {
      setChannels({
        email: reduxUser.notificationPreference.email ?? true,
        whatsapp: reduxUser.notificationPreference.whatsapp ?? false,
        sms: reduxUser.notificationPreference.sms ?? false,
      });
    }
  }, [reduxUser]);


  const handleSavePreferences = async () => {
    if (!channels.email && !channels.whatsapp && !channels.sms) {
      return toast.error("Please select at least one notification channel", {
        id: "pref-toast",
      });
    }
    setIsEditingChannels(false);
    try {
      const res = await profileUpdateApi({ notificationPreference: channels })
      if (res.data?.success) {
        dispatch(
          updateUserData({
            notificationPreference: res.data.data.notificationPreference,
          }),
        );
        toast.success("Preferences updated successfully", { id: "pref-toast" });
      }
    } catch (err) {
      toast.error("Failed to update preferences", { id: "pref-toast" });
    }
  };



  const statusCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkAssessmentStatus = async () => {
      if (!leadId || !isBookingMode) {
        setCheckingStatus(false);
        return;
      }
      try {
        setCheckingStatus(true);
        const res = await getJourneyTimelineAction({ leadId });

        if (res?.data?.success && res?.data?.data?.assessment) {
          const currentStatus = res?.data?.data?.assessment?.status;


          if (currentStatus === "Scheduled" || currentStatus === "scheduled") {
            setIsAlreadyScheduled(true);
            setScheduledDetails(res?.data?.data?.assessment);
          }

          else if (currentStatus === "Completed" || currentStatus === "completed") {
            setIsAssessmentCompleted(true);
            setScheduledDetails(res?.data?.data?.assessment);
          }
        }
        if (!initialConsultantId) {
          try {
            const bookingRes = await checkBookingStatusAction({ leadId });
            if (bookingRes?.data?.success && bookingRes?.data?.data?.assignedTo) {
              const tacId =
                typeof bookingRes?.data?.data?.assignedTo === "object"
                  ? bookingRes?.data?.data?.assignedTo?._id
                  : bookingRes?.data?.data?.assignedTo;
              setFetchedConsultantId(tacId);
            }
          } catch (bookingErr) {
            console.error("Failed to fetch assignment fallback", bookingErr);
          }
        }
      } catch (err) {
        console.error("Error verifying assessment status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkAssessmentStatus();

  }, [leadId, isBookingMode, initialConsultantId]);

  useEffect(() => {
    if (typeof window !== "undefined" && viewParam) {
      setTimeout(
        () =>
          statusCardRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        500,
      );
    }
  }, [viewParam]);

  const handleChannelChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChannels({ ...channels, [event.target.name]: event.target.checked });
  };

  useEffect(() => {
    const fetchSlots = async () => {
      if (!finalConsultantId || !isBookingMode || isAlreadyScheduled) return;
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await getSlotsAction({ consultantId: finalConsultantId, date });
        if (res?.data?.success) setSlots(res?.data.data);
        else {
          toast.error(res?.data?.message || "Failed to fetch slots");
          setSlots([]);
        }
      } catch (error) {
        toast.error("Error fetching slots.");
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [date, finalConsultantId, isBookingMode, isAlreadyScheduled]);

  useEffect(() => {
    const fetchTechData = async () => {
      if (isTechnicalResult && leadId) {
        setLoadingTech(true);
        const res = await getTechnicalResultAction({ leadId });
        if (res?.data?.success) setTechData(res?.data?.data);
        setLoadingTech(false);
      }
    };
    fetchTechData();
  }, [isTechnicalResult, leadId]);


  useEffect(() => {
    const fetchAssessmentResultData = async () => {
      if (isAssessmentResult && leadId) {
        const res = await getAssessmentResultAction({ leadId });
        if (res?.data?.success) setResultData(res?.data?.data);

      }
    };
    fetchAssessmentResultData();

  }, [isAssessmentResult]);

  const handleScheduleAssessment = async () => {
    if (!leadId || !finalConsultantId)
      return toast.error("Session missing. Please refresh and try again.");
    if (!selectedSlot)
      return toast.error("Please select an available time slot.");
    if (!isChecklistComplete)
      return toast.error("Please confirm all readiness checklists.");

    setIsSubmitting(true);
    try {
      const payload = {
        leadId,
        consultantId: finalConsultantId,
        date,
        method: visitMethod,
        from: selectedSlot.from || selectedSlot.time.split("-")[0].trim(),
        to: selectedSlot.to || selectedSlot.time.split("-")[1].trim(),
      };
      const res = await scheduleAssessmentAction(payload as any);
      if (res?.success) {
        toast.success("Assessment Scheduled Successfully!");
        setIsAlreadyScheduled(true);
        setShowConfirmPopup(true);
      } else toast.error(res?.message || "Failed to schedule Assessment.");
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    router,
    isBookingMode,
    isAssessmentResult,
    isTechnicalResult,
    techData,
    loadingTech,
    date,
    setDate,
    todayStr,
    selectedSlot,
    setSelectedSlot,
    visitMethod,
    setVisitMethod,
    isSubmitting,
    checklist,
    setChecklist,
    isChecklistComplete,
    slots,
    loadingSlots,
    showConfirmPopup,
    setShowConfirmPopup,
    isEditingChannels,
    setIsEditingChannels,
    channels,
    handleChannelChange,
    statusCardRef,
    handleScheduleAssessment,
    isAlreadyScheduled,
    scheduledDetails,
    checkingStatus,
    handleSavePreferences,
    resultData,
    isAssessmentCompleted
  };
};
