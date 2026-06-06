import { useState, useEffect, ChangeEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { updateUserData } from "@/Redux/Auth/user.slice";
import axiosClient from "@/Services/AxiosConfig/axiosClient";
import {
  getSlotsAction,
  bookSlotAction,
  checkBookingStatusAction,
} from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import {
  Slot,
  ExistingBooking,
  ChecklistState,
  NotificationPreferences,
} from "@/Types/Frontend_Payload/precounselling.types";
import { checkBranchView } from "@/Services/APIs/PreCounselling/preCounselling.action";


export const usePreCounselling = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const reduxLeadId = reduxUser?.leadId || reduxUser?.user?.leadId || "";
  const reduxConsultantId =
    reduxUser?.prefferedConsultant ||
    reduxUser?.user?.prefferedConsultant ||
    "";
  const reduxVisitOption =
    reduxUser?.visitOption ?? reduxUser?.user?.visitOption;
  const reduxMethod = reduxVisitOption === 2 ? "on" : "off";

  const leadId = searchParams?.get("leadId") || reduxLeadId;
  const consultantId = searchParams?.get("consultantId") || reduxConsultantId;
  const method = searchParams?.get("method") || reduxMethod;

  const serverNow = new Date();
  const utcTime = serverNow.getTime() + serverNow.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + 330 * 60000);
  const todayStr = istTime.toISOString().split("T")[0];

  const [date, setDate] = useState(todayStr);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [existingBooking, setExistingBooking] =
    useState<ExistingBooking | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isReduxReady, setIsReduxReady] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [checklist, setChecklist] = useState<ChecklistState>({
    materials: true,
    environment: true,
    questions: true,
  });
  const [isEditingChannels, setIsEditingChannels] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: reduxUser?.notificationPreference?.email ?? true,
    whatsapp: reduxUser?.notificationPreference?.whatsapp ?? false,
    sms: reduxUser?.notificationPreference?.sms ?? false,
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsReduxReady(true), 800);
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
    const checkStatus = async () => {
      if (!leadId) return;
      setCheckingStatus(true);
      const res = await checkBookingStatusAction(leadId);
      if (res?.success && res.data) {
        setExistingBooking(res.data);
        if (res.data.schedule?.date) {
          setDate(new Date(res.data.schedule.date).toISOString().split("T")[0]);
        }
      }
      setCheckingStatus(false);
    };
    checkStatus();
  }, [leadId]);

  useEffect(() => {
    const updatePreferences = async () => {
      if (reduxUser?.notificationPreference) {
        setPreferences({
          email: reduxUser.notificationPreference.email ?? true,
          whatsapp: reduxUser.notificationPreference.whatsapp ?? false,
          sms: reduxUser.notificationPreference.sms ?? false,
        });
      }
      if (reduxUser?.branch?._id && !reduxUser?.branch?.title) {

        const res = await checkBranchView(reduxUser?.branch?._id);

        dispatch(
          updateUserData({
            branch: {
              _id: reduxUser?.branch?._id,
              title: res?.data?.title
            },
          }),
        );

      }
    }
    updatePreferences()

  }, [reduxUser]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!consultantId) return;
      setLoadingSlots(true);
      const res = await getSlotsAction(consultantId, date);
      if (res?.success) setSlots(res.data);
      else {
        toast.error(res?.message || "Failed to fetch slots");
        setSlots([]);
      }
      setLoadingSlots(false);
      setSelectedSlot(null);
    };
    fetchSlots();
  }, [date, consultantId]);

  const handlePrefChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPreferences({
      ...preferences,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSavePreferences = async () => {
    if (!preferences.email && !preferences.whatsapp && !preferences.sms) {
      return toast.error("Please select at least one notification channel", {
        id: "pref-toast",
      });
    }
    setIsEditingChannels(false);
    try {
      const res = await axiosClient.patch("/user/profile-update", {
        notificationPreference: preferences,
      });
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

  const handleConfirm = async () => {
    if (!leadId || !consultantId)
      return toast.error(
        "Missing inquiry details. Please go back and try again.",
      );
    if (!selectedSlot)
      return toast.error("Please select an available time slot");

    setBookingLoading(true);
    const payload = {
      leadId,
      consultantId,
      date,
      from: selectedSlot.from,
      to: selectedSlot.to,
      method: method,
    };
    const res = await bookSlotAction(payload);
    if (res?.success) {
      toast.success("Pre-Counselling scheduled successfully!");
      setShowConfirmPopup(true);
    }
    setBookingLoading(false);
  };

  const isChecklistComplete =
    checklist.materials && checklist.environment && checklist.questions;

  return {
    leadId,
    consultantId,
    method,
    date,
    setDate,
    todayStr,
    slots,
    selectedSlot,
    setSelectedSlot,
    existingBooking,
    checkingStatus,
    loadingSlots,
    bookingLoading,
    isReduxReady,
    showConfirmPopup,
    setShowConfirmPopup,
    checklist,
    setChecklist,
    isEditingChannels,
    setIsEditingChannels,
    preferences,
    handlePrefChange,
    handleSavePreferences,
    handleConfirm,
    isChecklistComplete,
    reduxUser
  };
};
