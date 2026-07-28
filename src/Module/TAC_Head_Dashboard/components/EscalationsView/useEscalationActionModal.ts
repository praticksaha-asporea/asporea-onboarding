import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { CamelCase } from "@/Utils/common";
import { getSlotsAction } from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import { approveRejectEscalationAction } from "@/Services/APIs/tacHead/escalation.actions";
import { approveRejectEscalationPayload } from "@/Types/Frontend_Payload/escalation.types";
import { escalationRecord } from "@/Types/ApiResponse/escalationRes.types";

interface UseModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  escalation: escalationRecord | null;
  refreshData: () => void;
}

export const useEscalationActionModal = ({ open, setOpen, escalation, refreshData }: UseModalProps) => {
  const [action, setAction] = useState<"approved" | "rejected" | "">("");
  const [remarks, setRemarks] = useState("");

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const todayStr = new Date(new Date().getTime() + 330 * 60000).toISOString().split("T")[0];

  useEffect(() => {
    if (open) {
      setDate(todayStr);
      setAction("");
      setRemarks("");
      setSelectedSlot(null);
    }
  }, [open, todayStr]);

  const rawStatus = escalation?.leadId?.status || "";
  const leadStatus = CamelCase(rawStatus);
  const requiresSchedule = ["pre_scheduled", "assess_scheduled"].includes(rawStatus);
  const targetTacId = escalation?.toId?._id;

  useEffect(() => {
    const fetchTargetTacSlots = async () => {
      if (action === "approved" && requiresSchedule && targetTacId && date) {
        setSlotsLoading(true);
        setSelectedSlot(null);
        try {
          const res = await getSlotsAction({ consultantId: targetTacId, date });
          if (res?.data?.success) {
            setSlots(res.data.data || []);
          } else {
            setSlots([]);
            toast.error(res?.data?.message || "Failed to fetch slots");
          }
        } catch (err) {
          setSlots([]);
        } finally {
          setSlotsLoading(false);
        }
      }
    };
    fetchTargetTacSlots();
  }, [action, date, requiresSchedule, targetTacId]);

  const handleSubmit = async () => {
    if (!escalation) return;
    if (!action) return toast.error("Please select an action (Approve/Reject)");
    if (!remarks.trim()) return toast.error("Remarks are mandatory");

    let schedulePayload = undefined;
    if (action === "approved" && requiresSchedule) {
      if (!selectedSlot) return toast.error("Please select an available time slot");
      schedulePayload = {
        date,
        from: selectedSlot.from,
        to: selectedSlot.to,
        method: escalation?.leadId?.preferences?.visitType === "offline" ? ("off" as const) : ("on" as const),
      };
    }

    setSubmitLoading(true);
    try {
      
      const payload: approveRejectEscalationPayload = {
        escalationId: escalation._id,
        status: action,
        remarks,
        schedule: schedulePayload,
      };

      const res = await approveRejectEscalationAction(payload);

      if (res?.data?.success) {
        toast.success(res.data.message || `Escalation executed successfully!`);
        setOpen(false);
        refreshData();
      } else {
        toast.error(res?.data?.message || "Action failed");
      }
    } catch (err) {
      toast.error("An error occurred during submission.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const confirmButtonClass = action === "rejected"
    ? "bg-[var(--mui-palette-error-main)] hover:bg-[var(--mui-palette-error-main)]"
    : "bg-[var(--mui-palette-light-main)] hover:bg-[var(--mui-palette-light-main)]";

  const confirmButtonLabel = `Confirm ${CamelCase(action || "Action")}`;
  const isSubmitDisabled = submitLoading || !action || !remarks.trim() || (action === "approved" && requiresSchedule && !selectedSlot);

  return {
    action, setAction, remarks, setRemarks, date, setDate, slots, selectedSlot, setSelectedSlot,
    slotsLoading, submitLoading, todayStr, leadStatus, requiresSchedule, handleSubmit,
    confirmButtonClass, confirmButtonLabel, isSubmitDisabled
  };
};