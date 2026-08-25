"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  bookSlotAction,
  cancelBookingAction,
  checkBookingStatusAction,
  getSlotsAction,
  getTacsListAction,
} from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import { loadCaptchaEnginge, validateCaptcha } from "react-simple-captcha";
import { Slot } from "@/Types/Frontend_Payload/assessment.types";
import { ExistingBooking } from "@/Types/Frontend_Payload/precounselling.types";
import { branchListingApi } from "@/Services/APIs/branch/branch.actions";
import { preTACData } from "@/Types/object.types";
import { confirmToast } from "@/Utils/confirmToast";

export type CounsellingMode = "online" | "offline";

export interface Branch {
  _id: string;
  title: string;
  city?: string;
  address?: string;
  distanceKm?: number;
}

export interface TAC {
  _id: string;
  name: string;
  photoUrl?: string;
  designation?: string;
  experienceYears?: number;
  rating?: number;
  languages?: string[];
  specialization?: string[];
  bio?: string;
}

// Fallback coordinates if geolocation is denied/unavailable — set to your HQ / default city.
const DEFAULT_LAT = 26.7271;
const DEFAULT_LNG = 88.3953;

export const usePreCounselling = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reduxUser = useSelector((state: any) => state.userSlice?.userData || state.user?.userData);
  const reduxLeadId = reduxUser?.leadId || reduxUser?.user?.leadId || "";
  const leadId = searchParams?.get("leadId") || reduxLeadId;

  const serverNow = new Date();
  const utcTime = serverNow.getTime() + serverNow.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + 330 * 60000);
  const todayStr = istTime.toISOString().split("T")[0];

  // ---- lead / existing-booking guard ----
  const [isReduxReady, setIsReduxReady] = useState(false);
  const [showScheduling, setShowScheduling] = useState(true);
  const [isValidLead, setIsValidLead] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [existingBooking, setExistingBooking] = useState<ExistingBooking | null>(null);
  const [activeStepperStep, setActiveStepperStep] = useState(1);
  const [canReschedule, setCanReschedule] = useState<boolean>(false);

  // ---- 1. branch (geolocation driven) ----
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  // ---- 2. mode ----
  const [mode, setMode] = useState<CounsellingMode>("offline");

  // ---- 3. cv ----
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const initialCV = { path: "" };

  // ---- 4. tac ----
  const [tacs, setTacs] = useState<preTACData[]>([]);
  const [loadingTacs, setLoadingTacs] = useState(false);
  const [tacSearch, setTacSearch] = useState("");
  const [selectedTacId, setSelectedTacId] = useState<string>("");

  // ---- 5. date -> slots ----
  const [date, setDate] = useState(todayStr);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // ---- 6. captcha ----
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // ---- 7. submit ----
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [profileTac, setProfileTac] = useState<preTACData | null>(null);

  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>("");


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
    const checkStatus = async () => {
      if (!leadId) return;
      try {
        const res = await checkBookingStatusAction({ leadId });
        if (res?.data?.success && res.data) {
          setExistingBooking(res?.data?.data);
          setShowScheduling(res?.data?.data ? false : true);
          const scheduleDate = res?.data?.data?.schedule?.date;
          const scheduleFrom = res?.data?.data?.schedule?.from;

          const datePart = new Date(scheduleDate)
            .toISOString()
            .split("T")[0];

          const scheduleDateTime = new Date(
            `${datePart} ${scheduleFrom}`
          );

          const thirtyMinutesBeforeNow = new Date(Date.now() - 30 * 60 * 1000);
          // console.log(scheduleDateTime, thirtyMinutesFromNow);

          setCanReschedule(scheduleDateTime > thirtyMinutesBeforeNow);
          if (res?.data.data.status?.toLowerCase() === "completed") setIsCompleted(true);
        } else if (res?.data?.message?.toLowerCase().includes("not found")) {
          setIsValidLead(false);
        }
      } catch (err: any) {
        if (err?.response?.status === 404) setIsValidLead(false);
      }
    };
    checkStatus();
  }, [leadId]);

  // ---- geolocation -> branches ----
  const fetchBranches = useCallback(async (lat: number, lng: number) => {
    setLoadingBranches(true);
    try {
      const response = await branchListingApi({ lat, lng });
      const list = response?.data?.data?.data || [];
      setBranches(list);
      // if (list.length === 1) setSelectedBranchId(list[0]._id);
    } catch (error) {
      console.error("Branch fetch error:", error);
      toast.error("Failed to fetch nearby branches");
    } finally {
      setLoadingBranches(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationDenied(true);
      fetchBranches(DEFAULT_LAT, DEFAULT_LNG);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        fetchBranches(latitude, longitude);
      },
      () => {
        // setLocationDenied(true);
        // toast.error("Couldn't access your location — showing default branches");
        // fetchBranches(DEFAULT_LAT, DEFAULT_LNG);
      },
      { timeout: 8000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- branch + mode -> tac list ----
  useEffect(() => {
    const fetchTacs = async () => {
      if (!selectedBranchId) {
        setTacs([]);
        return;
      }
      setLoadingTacs(true);
      try {
        const payload = { page: 1, limit: 10, search: tacSearch, mode, branchId: selectedBranchId };
        const res = await getTacsListAction(payload);
        const list = res?.data?.data?.tacList || [];
        // console.log(list);

        setTacs(list);
        // setSelectedTacId((prev) => (list.some((t: TAC) => t._id === prev) ? prev : ""));
      } catch (err) {
        console.error("TAC fetch error:", err);
        // toast.error("Failed to fetch TAC list");
        setTacs([]);
      } finally {
        setLoadingTacs(false);
      }
    };
    fetchTacs();
  }, [selectedBranchId, mode, tacSearch]);

  // ---- tac + date -> slots ----
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedTacId) {
        setSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const res = await getSlotsAction({ consultantId: selectedTacId, date });
        if (res?.data?.success) setSlots(res?.data?.data);
        else {
          toast.error(res?.data?.message || "Failed to fetch slots");
          setSlots([]);
        }
      } finally {
        setLoadingSlots(false);
        setSelectedSlot(null);
      }
    };
    fetchSlots();
  }, [selectedTacId, date]);

  // ---- captcha ----
  useEffect(() => {
    loadCaptchaEnginge(5);
  }, []);

  const handleCaptchaChange = (value: string) => {
    setCaptchaValue(value);
    setCaptchaVerified(false);
  };

  const handleCaptchaVerify = () => {
    if (!captchaValue.trim()) return;
    setCaptchaVerified(validateCaptcha(captchaValue));
  };

  const handleCaptchaRefresh = () => {
    loadCaptchaEnginge(5);
    setCaptchaValue("");
    setCaptchaVerified(false);
  };

  // ---- submit ----
  const canConfirm =
    !!selectedBranchId &&
    !!mode &&
    !!resumeFile &&
    !!captchaVerified &&
    (!!selectedTacId === !!selectedSlot);


  const handleConfirm = async () => {
    if (!leadId) {
      return toast.error(
        "Missing inquiry details. Please go back and try again."
      );
    }

    if (!selectedBranchId) {
      return toast.error("Please select a branch.");
    }

    if (!mode) {
      return toast.error("Please select a consultation mode.");
    }

    if (!resumeFile) {
      return toast.error("Please upload your CV.");
    }

    if (!!selectedTacId !== !!selectedSlot) {
      return toast.error(
        selectedTacId
          ? "Please select an available time slot."
          : "Please select a preferred TAC."
      );
    }

    if (!captchaVerified) {
      return toast.error("Please complete the CAPTCHA verification.");
    }

    setBookingLoading(true);
    try {
      // const payload = {
      //   leadId,
      //   branchId: selectedBranchId,
      //   consultantId: selectedTacId,
      //   date,
      //   from: selectedSlot.from,
      //   to: selectedSlot.to,
      //   method: mode === "online" ? "on" : "off",
      //   resumeFile
      // };

      const payload = new FormData();
      payload.append("leadId", leadId);
      payload.append("branchId", selectedBranchId);

      if (selectedTacId) {
        payload.append("consultantId", selectedTacId);
        payload.append("date", date);
        payload.append("from", selectedSlot?.from as string);
        payload.append("to", selectedSlot?.to as string);
      }
      payload.append("method", mode === "online" ? "on" : "off");

      if (resumeFile) payload.append("resumeFile", resumeFile);

      const res = await bookSlotAction(payload);
      if (res?.data?.success) {
        toast.success("Pre-Counselling scheduled successfully!");
        setShowConfirmPopup(true);
      }
    } finally {
      setBookingLoading(false);
    }
  };



  const existingResume =
    initialCV &&
      typeof initialCV === "object" &&
      "path" in initialCV
      ? initialCV.path
      : undefined;

  const isPdf = resumeFile
    ? resumeFile.type === "application/pdf"
    : existingResume?.toLowerCase().includes(".pdf") ?? false;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setResumeFile(file);
      // preForm.setFieldValue("resumeFile", file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFileChange(e.dataTransfer.files[0]);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFileChange(e.target.files[0]);
  };


  useEffect(() => {
    let objectUrl: string | null = null;
    if (resumeFile) {
      objectUrl = URL.createObjectURL(resumeFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(existingResume ?? null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [resumeFile, existingResume]);

  const cancellationRequest = async () => {
    const confirmed = await confirmToast(`Are you sure to cancel this appointment !`);
    if (!confirmed) return;

    try {
      const res = await cancelBookingAction({ leadId: existingBooking?.leadId, actionBy: reduxUser?._id, cancelReason: cancelReason });
      if (res?.data?.success) {
        setExistingBooking(null);
        toast.success("Cancellation request sent successfully!");
      }
    } catch (err: any) {
      console.error(err?.response?.data?.message ?? "Failed to send cancellation request");
    }
  }

  const handleCancelReason = () => {
    setShowCancel((prev) => !prev);
    setShowScheduling(false);
    setShowScheduling(true);
  }

  const handleReschedule = () => {
    setShowScheduling((prev) => !prev);
    setShowCancel(false);
  }

  return {
    leadId,
    todayStr,
    isReduxReady,
    isValidLead,
    isCompleted,
    existingBooking,
    activeStepperStep,

    coords,
    locationDenied,
    branches,
    loadingBranches,
    selectedBranchId,
    setSelectedBranchId,
    showScheduling, handleReschedule,

    mode,
    setMode,

    handleDragOver, handleDragLeave, handleDrop,
    onFileInputChange,
    resumeFile, isDragging, fileInputRef, previewUrl, isPreviewOpen, setIsPreviewOpen, isPdf,

    tacs,
    loadingTacs,
    tacSearch,
    setTacSearch,
    selectedTacId,
    setSelectedTacId,

    date,
    setDate,
    slots,
    loadingSlots,
    selectedSlot,
    setSelectedSlot,

    captchaValue,
    captchaVerified,
    handleCaptchaChange,
    handleCaptchaVerify,
    handleCaptchaRefresh,

    bookingLoading,
    showConfirmPopup,
    setShowConfirmPopup,
    canConfirm,
    handleConfirm,
    profileTac, setProfileTac,
    cancellationRequest,
    showCancel,
    handleCancelReason,
    reduxUser,
    cancelReason,
    setCancelReason,
    canReschedule
  };
};