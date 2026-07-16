import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getCandidateDocumentsAction } from "@/Services/APIs/Documents/document.actions";
import { getSlotsAction } from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import { approveRejectDocumentAction } from "../../../../Services/APIs/tacHead/document.action";

export const useDocumentActionModal = ({ open, lead, setOpen, refreshData }: any) => {
    const [action, setAction] = useState<"verified" | "rejected" | "">("");
    const [remarks, setRemarks] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [fullLeadData, setFullLeadData] = useState<any>(null);
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [slots, setSlots] = useState<any[]>([]);
    const [fetchingSlots, setFetchingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);

    useEffect(() => {
        const fetchFullLeadDetails = async () => {
            if (open && lead?._id) {
                setFetchingDetails(true);
                setAction(""); setRemarks(""); setSelectedDate(""); setSelectedSlot(null); setSlots([]); setFullLeadData(null);

                const res = await getCandidateDocumentsAction(lead._id);
                if (res?.success && res?.data?.lead) {
                    setFullLeadData(res.data.lead);
                } else {
                    toast.error("Failed to fetch complete document details.");
                    setFullLeadData(lead);
                }
                setFetchingDetails(false);
            }
        };
        fetchFullLeadDetails();
    }, [open, lead]);

    useEffect(() => {
        const fetchSlots = async () => {
            const consultantId = lead?.preferences?.consultantId?._id || lead?.preferences?.consultantId?.id;
            if (action === "verified" && selectedDate && consultantId) {
                setFetchingSlots(true);
                const res = await getSlotsAction({ consultantId, date: selectedDate });
                setSlots(res?.data?.success !== false ? (res?.data?.data || []) : []);
                setFetchingSlots(false);
            }
        };
        fetchSlots();
    }, [action, selectedDate, lead]);

    const handleSubmit = async () => {
        if (!action) return toast.error("Please select an action (Approve/Reject)");
        if (action === "verified" && (!selectedDate || !selectedSlot))
            return toast.error("Please select an Assessment date and slot.");

        const payload: any = { leadId: lead._id, status: action, remarks };
        if (action === "verified" && selectedSlot) {
            payload.schedule = { date: selectedDate, from: selectedSlot.from, to: selectedSlot.to };
        }

        setSubmitLoading(true);
        const res = await approveRejectDocumentAction(payload);
        setSubmitLoading(false);

        if (res?.success !== false) {
            toast.success(`Documents ${action} successfully!`);
            setOpen(false);
            refreshData();
        } else {
            toast.error(res?.message || "Failed to process the request");
        }
    };

    return {
        action, setAction, remarks, setRemarks, submitLoading, fullLeadData,
        fetchingDetails, selectedDate, setSelectedDate, slots, fetchingSlots,
        selectedSlot, setSelectedSlot, handleSubmit
    };
};