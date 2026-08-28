import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  checkBookingStatusAction,
  cancelBookingAction,
} from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import {
  ExistingBooking,
  IPopulatedLead,
} from "@/Types/Frontend_Payload/precounselling.types";
import { ILead } from "@/lib/models/Lead.model";
import { confirmToast } from "@/Utils/confirmToast";

export const usePreCounsellingStatus = (
  leadId: string,
  reduxUser: any,
  router: any,
) => {
  const [isReduxReady, setIsReduxReady] = useState(false);
  const [isValidLead, setIsValidLead] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [existingBooking, setExistingBooking] =
    useState<ExistingBooking | null>(null);
  const [leadData, setLeadData] = useState<ILead | null>(null);
  const [showScheduling, setShowScheduling] = useState(true);
  const [canReschedule, setCanReschedule] = useState(false);
  const [existingResumeUrl, setExistingResumeUrl] = useState<string | null>(
    null,
  );

  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsReduxReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReduxReady) return;
    if (!leadId) {
      toast.error("Please generate inquiry first");
      router.push("/inquiry");
    }
  }, [isReduxReady, leadId, router]);

  useEffect(() => {
    if (reduxUser && !leadData) {
      const leadObj =
        (typeof reduxUser?.leadId === "object" ? reduxUser?.leadId : null) ||
        (typeof reduxUser?.user?.leadId === "object"
          ? reduxUser?.user?.leadId
          : null) ||
        reduxUser?.lead ||
        reduxUser?.user ||
        reduxUser;

      if (leadObj?.inqNo) {
        setLeadData(leadObj as ILead);
      }
    }
  }, [reduxUser, leadData]);

  useEffect(() => {
    const checkStatus = async () => {
      if (!leadId) return;
      try {
        const res = await checkBookingStatusAction({ leadId });
        if (res?.data?.success && res.data?.data) {
          const rawData = res.data.data;
          const bookingData =
            rawData.existingBooking !== undefined
              ? rawData.existingBooking
              : rawData;
          const populatedLead =
            rawData.lead ||
            (typeof bookingData?.leadId === "object"
              ? (bookingData?.leadId as IPopulatedLead)
              : null);

          if (populatedLead) {
            setLeadData(populatedLead as unknown as ILead);
            if (populatedLead?.candidateResume?.path) {
              setExistingResumeUrl(populatedLead.candidateResume.path);
            }
          }

          if (bookingData && (bookingData._id || bookingData.schedule)) {
            setExistingBooking(bookingData);
            setShowScheduling(false);

            const scheduleDate = bookingData.schedule?.date;
            const scheduleFrom = bookingData.schedule?.from || "00:00";

            if (scheduleDate) {
              const datePart = new Date(scheduleDate)
                .toISOString()
                .split("T")[0];
              const scheduleDateTime = new Date(`${datePart} ${scheduleFrom}`);
              const thirtyMinutesBeforeSchedule = new Date(
                scheduleDateTime.getTime() - 30 * 60 * 1000,
              );

              setCanReschedule(
                Date.now() > thirtyMinutesBeforeSchedule.getTime(),
              );
            }

            if (bookingData.status?.toLowerCase() === "completed") {
              setIsCompleted(true);
            }
          }
        } else if (res?.data?.message?.toLowerCase().includes("not found")) {
          setIsValidLead(false);
        }
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } };
        if (error?.response?.status === 404) setIsValidLead(false);
      }
    };
    checkStatus();
  }, [leadId]);

  const cancellationRequest = async () => {
    const confirmed = await confirmToast(
      `Are you sure to cancel this appointment !`,
    );
    if (!confirmed) return;

    const targetLeadId =
      typeof existingBooking?.leadId === "object"
        ? existingBooking.leadId._id
        : existingBooking?.leadId || leadId;

    try {
      const res = await cancelBookingAction({
        leadId: targetLeadId,
        actionBy: reduxUser?._id,
        cancelReason: cancelReason,
      });
      if (res?.data?.success) {
        setExistingBooking(null);
        toast.success("Cancellation request sent successfully!");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error(
        error?.response?.data?.message ?? "Failed to send cancellation request",
      );
    }
  };

  const handleCancelReason = () => {
    setShowCancel((prev) => !prev);
  };

  const handleReschedule = () => {
    setShowScheduling((prev) => !prev);
    setShowCancel(false);
  };

  return {
    isReduxReady,
    isValidLead,
    isCompleted,
    existingBooking,
    setExistingBooking,
    leadData,
    setLeadData,
    showScheduling,
    setShowScheduling,
    canReschedule,
    existingResumeUrl,
    setExistingResumeUrl,
    showCancel,
    cancelReason,
    setCancelReason,
    handleReschedule,
    handleCancelReason,
    cancellationRequest,
  };
};
