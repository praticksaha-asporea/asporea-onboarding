import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  scheduleAssessmentAction,
  getTechnicalResultAction,
} from "@/Services/APIs/Assessment/assessment.actions";
import { getSlotsAction } from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import {
  Slot,
  Checklist,
  NotificationChannels,
  TechData,
} from "@/Types/Frontend_Payload/assessment.types";
import { getJourneyTimelineAction } from "@/Services/APIs/Assessment/assessment.actions";

export const useAssessment = () => {
  const router = useRouter();
  const searchParams = useSearchParams();


  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const leadId = reduxUser?.leadId || reduxUser?.user?.leadId || "";
  const consultantId =
    reduxUser?.prefferedConsultant ||
    reduxUser?.user?.prefferedConsultant ||
    "";
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

  const [techData, setTechData] = useState<TechData | null>(null);
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
    email: true,
    whatsapp: false,
    sms: false,
  });
  const statusCardRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    const checkAssessmentStatus = async () => {
      if (!leadId || !isBookingMode) {
        setCheckingStatus(false);
        return;
      }
      try {
        setCheckingStatus(true);
        const res = await getJourneyTimelineAction(leadId);
        if (res?.success && res.data?.assessment) {
          if (res.data.assessment.status === "Scheduled") {
            setIsAlreadyScheduled(true);
            setScheduledDetails(res.data.assessment);
          }
        }
      } catch (err) {
        console.error("Error verifying assessment status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkAssessmentStatus();
  }, [leadId, isBookingMode]);
  

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
      if (!consultantId || !isBookingMode || isAlreadyScheduled) return;  
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await getSlotsAction(consultantId, date);
        if (res?.success) setSlots(res.data);
        else {
          toast.error(res?.message || "Failed to fetch slots");
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
  }, [date, consultantId, isBookingMode]);

  useEffect(() => {
    const fetchTechData = async () => {
      if (isTechnicalResult && leadId) {
        setLoadingTech(true);
        const res = await getTechnicalResultAction(leadId);
        if (res?.success) setTechData(res.data);
        setLoadingTech(false);
      }
    };
    fetchTechData();
  }, [isTechnicalResult, leadId]);

  const handleScheduleAssessment = async () => {
    if (!leadId || !consultantId)
      return toast.error("Session missing. Please refresh and try again.");
    if (!selectedSlot)
      return toast.error("Please select an available time slot.");
    if (!isChecklistComplete)
      return toast.error("Please confirm all readiness checklists.");

    setIsSubmitting(true);
    try {
      const payload = {
        leadId,
        consultantId,
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
  };
};
