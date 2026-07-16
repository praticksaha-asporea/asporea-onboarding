import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getSlotsAction } from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import { approveRejectEscalationAction } from "@/Services/APIs/tacHead/escalation.actions";

interface UseEscalationActionModalProps {
    open: boolean;
    setOpen: (val: boolean) => void;
    escalation: any;
    refreshData: () => void;
}

export const useEscalationActionModal = ({
    open,
    setOpen,
    escalation,
    refreshData,
}: UseEscalationActionModalProps) => {
    const [action, setAction] = useState<"approved" | "rejected" | "">("");
    const [remarks, setRemarks] = useState("");

    const [date, setDate] = useState("");
    const [slots, setSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Timezone localized string sync
    const todayStr = new Date(new Date().getTime() + 330 * 60000)
        .toISOString()
        .split("T")[0];

    // Reset values on trigger open
    useEffect(() => {
        if (open) {
            setDate(todayStr);
            setAction("");
            setRemarks("");
            setSelectedSlot(null);
        }
    }, [open, todayStr]);

    const leadStatus = escalation?.leadId?.status || "";
    const requiresSchedule = ["pre_scheduled", "assess_scheduled"].includes(leadStatus);
    const targetTacId = escalation?.toId?._id;

    // Slots fetching management hook logic
    useEffect(() => {
        const fetchTargetTacSlots = async () => {
            if (action === "approved" && requiresSchedule && targetTacId && date) {
                setSlotsLoading(true);
                setSelectedSlot(null);
                const res = await getSlotsAction({ consultantId: targetTacId, date });
                if (res?.data?.success) {
                    setSlots(res?.data?.data);
                } else {
                    setSlots([]);
                    toast.error(
                        res?.data?.message || "Failed to fetch slots for the Target TAC",
                    );
                }
                setSlotsLoading(false);
            }
        };

        fetchTargetTacSlots();
    }, [action, date, requiresSchedule, targetTacId]);

    const handleSubmit = async () => {
        if (!action) return toast.error("Please select an action (Approve/Reject)");
        if (!remarks.trim()) return toast.error("Remarks are mandatory");

        let schedulePayload = undefined;
        if (action === "approved" && requiresSchedule) {
            if (!selectedSlot) {
                return toast.error(
                    "Please select an available time slot for the Target TAC",
                );
            }
            schedulePayload = {
                date,
                from: selectedSlot.from,
                to: selectedSlot.to,
                method:
                    escalation?.leadId?.preferences?.visitType === "offline"
                        ? "off"
                        : "on",
            };
        }

        const payload = {
            escalationId: escalation._id,
            status: action,
            remarks,
            schedule: schedulePayload,
        };

        setSubmitLoading(true);
        const res = await approveRejectEscalationAction(payload);
        setSubmitLoading(false);

        if (res?.success) {
            toast.success(res.message || `Escalation ${action} successfully!`);
            setOpen(false);
            refreshData();
        }
    };

    return {
        action,
        setAction,
        remarks,
        setRemarks,
        date,
        setDate,
        slots,
        selectedSlot,
        setSelectedSlot,
        slotsLoading,
        submitLoading,
        todayStr,
        leadStatus,
        requiresSchedule,
        handleSubmit,
    };
};