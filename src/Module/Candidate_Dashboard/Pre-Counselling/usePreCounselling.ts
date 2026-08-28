 "use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import { bookSlotAction } from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import { preTACData } from "@/Types/object.types";

import { usePreCounsellingStatus } from "./Sub-hooks/usePreCounsellingStatus";
import { useBranchSelection } from "./Sub-hooks/useBranchSelection";
import { useCvUpload } from "./Sub-hooks/useCvUpload";
import { useTacAndSlots, CounsellingMode } from "./Sub-hooks/useTacAndSlots";
import { useCaptcha } from "./Sub-hooks/useCaptcha";

export const usePreCounselling = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const reduxLeadId = reduxUser?.leadId || reduxUser?.user?.leadId || "";
  const leadId = searchParams?.get("leadId") || reduxLeadId;

  const serverNow = new Date();
  const utcTime = serverNow.getTime() + serverNow.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + 330 * 60000);
  const todayStr = istTime.toISOString().split("T")[0];

  const [mode, setMode] = useState<CounsellingMode>("offline");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [profileTac, setProfileTac] = useState<preTACData | null>(null);

 
  const status = usePreCounsellingStatus(leadId, reduxUser, router);

   
  const branch = useBranchSelection(reduxUser);

   
  const tacAndSlots = useTacAndSlots(
    branch.selectedBranchId,  
    mode,
    todayStr,
    status.existingBooking,
  );

  const { setSelectedBranchId } = branch;

   
  const cv = useCvUpload(status.existingResumeUrl);

  
  const captcha = useCaptcha();

 
  const canConfirm =
    !!branch.selectedBranchId &&
    !!mode &&
    (!!cv.resumeFile || !!status.existingResumeUrl) &&
    !!captcha.captchaVerified &&
    !!tacAndSlots.selectedTacId === !!tacAndSlots.selectedSlot;

  const handleConfirm = async () => {
    if (!leadId) {
      return toast.error("Missing inquiry details. Please go back and try again.");
    }
    if (!branch.selectedBranchId) {
      return toast.error("Please select a branch.");
    }
    if (!mode) {
      return toast.error("Please select a consultation mode.");
    }
    if (!cv.resumeFile && !status.existingResumeUrl) {
      return toast.error("Please upload your CV.");
    }
    if (!!tacAndSlots.selectedTacId !== !!tacAndSlots.selectedSlot) {
      return toast.error(
        tacAndSlots.selectedTacId
          ? "Please select an available time slot."
          : "Please select a preferred TAC.",
      );
    }
    if (!captcha.captchaVerified) {
      return toast.error("Please complete the CAPTCHA verification.");
    }

    setBookingLoading(true);
    try {
      const payload = new FormData();
      payload.append("leadId", leadId);
      payload.append("branchId", branch.selectedBranchId);

      if (tacAndSlots.selectedTacId) {
        payload.append("consultantId", tacAndSlots.selectedTacId);
        payload.append("date", tacAndSlots.date);
        payload.append("from", tacAndSlots.selectedSlot?.from as string);
        payload.append("to", tacAndSlots.selectedSlot?.to as string);
      }
      payload.append("method", mode === "online" ? "on" : "off");

      if (cv.resumeFile) payload.append("resumeFile", cv.resumeFile);

      const res = await bookSlotAction(payload);
      if (res?.data?.success) {
        status.setLeadData(res?.data?.data);
        toast.success("Pre-Counselling scheduled successfully!");
        setShowConfirmPopup(true);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // Branch badalne par TAC aur Slot reset karne ki wrapper Function
  const handleBranchSelectWithReset = async (newBranchId: string) => {
    const success = await branch.handleBranchSelect(newBranchId);
    if (success) {
      tacAndSlots.setSelectedTacId("");
      tacAndSlots.setSelectedSlot(null);
    }
  };

  return {
    leadId,
    todayStr,
    isReduxReady: status.isReduxReady,
    isValidLead: status.isValidLead,
    isCompleted: status.isCompleted,
    existingBooking: status.existingBooking,

    locationDenied: branch.locationDenied,
    branches: branch.branches,
    loadingBranches: branch.loadingBranches,
    selectedBranchId: branch.selectedBranchId,
    setSelectedBranchId,
    showScheduling: status.showScheduling,
    handleReschedule: status.handleReschedule,
    handleBranchSelect: handleBranchSelectWithReset,
    mode,
    setMode,

    handleDragOver: cv.handleDragOver,
    handleDragLeave: cv.handleDragLeave,
    handleDrop: cv.handleDrop,
    onFileInputChange: cv.onFileInputChange,
    resumeFile: cv.resumeFile,
    isDragging: cv.isDragging,
    fileInputRef: cv.fileInputRef,
    previewUrl: cv.previewUrl,
    isPreviewOpen: cv.isPreviewOpen,
    setIsPreviewOpen: cv.setIsPreviewOpen,
    isPdf: cv.isPdf,

    tacs: tacAndSlots.tacs,
    loadingTacs: tacAndSlots.loadingTacs,
    tacSearch: tacAndSlots.tacSearch,
    setTacSearch: tacAndSlots.setTacSearch,
    selectedTacId: tacAndSlots.selectedTacId,
    setSelectedTacId: tacAndSlots.setSelectedTacId,

    date: tacAndSlots.date,
    setDate: tacAndSlots.setDate,
    slots: tacAndSlots.slots,
    loadingSlots: tacAndSlots.loadingSlots,
    selectedSlot: tacAndSlots.selectedSlot,
    setSelectedSlot: tacAndSlots.setSelectedSlot,

    captchaValue: captcha.captchaValue,
    captchaVerified: captcha.captchaVerified,
    handleCaptchaChange: captcha.handleCaptchaChange,
    handleCaptchaVerify: captcha.handleCaptchaVerify,
    handleCaptchaRefresh: captcha.handleCaptchaRefresh,

    bookingLoading,
    showConfirmPopup,
    setShowConfirmPopup,
    canConfirm,
    handleConfirm,
    profileTac,
    setProfileTac,
    cancellationRequest: status.cancellationRequest,
    showCancel: status.showCancel,
    handleCancelReason: status.handleCancelReason,
    reduxUser,
    cancelReason: status.cancelReason,
    setCancelReason: status.setCancelReason,
    canReschedule: status.canReschedule,
    leadData: status.leadData,
  };
};

export type { CounsellingMode };