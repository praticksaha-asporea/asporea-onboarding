import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getCandidateDocumentsAction } from "@/Services/APIs/Documents/document.actions";
import { getSlotsAction } from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import { approveRejectDocumentAction } from "../../../../Services/APIs/tacHead/document.action";
import { approveRejectDocumentPayload } from "@/Types/Frontend_Payload/document.types";
import { awaitingDocLeadRecord, deepPopulatedLeadDetails, consultantSlotItem } from "@/Types/ApiResponse/documentRes.types";

interface UseModalProps {
    open: boolean;
    lead: awaitingDocLeadRecord | null;
    setOpen: (val: boolean) => void;
    refreshData: () => void;
}

export const useDocumentActionModal = ({ open, lead, setOpen, refreshData }: UseModalProps) => {
    const [action, setAction] = useState<"verified" | "rejected" | "">("");
    const [remarks, setRemarks] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);

    const [fullLeadData, setFullLeadData] = useState<deepPopulatedLeadDetails | awaitingDocLeadRecord | null>(null);
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [slots, setSlots] = useState<consultantSlotItem[]>([]);
    const [fetchingSlots, setFetchingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<consultantSlotItem | null>(null);

    useEffect(() => {
        const fetchFullLeadDetails = async () => {
            if (open && lead?._id) {
                setFetchingDetails(true);
                setAction(""); setRemarks(""); setSelectedDate(""); setSelectedSlot(null); setSlots([]); setFullLeadData(null);

                const res = await getCandidateDocumentsAction({ leadId: lead._id });

                if (res?.data?.success && res.data.data?.lead) {
                    setFullLeadData(res.data.data.lead);
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

            const consultantId =
                (fullLeadData as deepPopulatedLeadDetails)?.preferences?.consultantId?._id ||
                lead?.preferences?.consultantId?._id;

            if (action === "verified" && selectedDate && consultantId) {
                setFetchingSlots(true);
                const res = await getSlotsAction({ consultantId, date: selectedDate });
                setSlots(res?.data?.success !== false ? (res?.data?.data as unknown as consultantSlotItem[] || []) : []);
                setFetchingSlots(false);
            }
        };
        fetchSlots();
    }, [action, selectedDate, lead, fullLeadData]);

    const handleSubmit = async () => {
        if (!lead) return;
        if (!action) return toast.error("Please select an action (Approve/Reject)");
        if (action === "verified" && (!selectedDate || !selectedSlot))
            return toast.error("Please select an Assessment date and slot.");

        const payload: approveRejectDocumentPayload = {
            leadId: lead._id,
            status: action,
            remarks
        };

        if (action === "verified" && selectedSlot) {
            payload.schedule = {
                date: selectedDate,
                from: selectedSlot.from,
                to: selectedSlot.to
            };
        }

        setSubmitLoading(true);
        const res = await approveRejectDocumentAction(payload);
        setSubmitLoading(false);

        if (res?.data?.success) {
            toast.success(`Documents ${action} successfully!`);
            setOpen(false);
            refreshData();
        } else {
            toast.error(res?.data?.message || "Failed to process the request");
        }
    };

    const consultant =
        (fullLeadData as deepPopulatedLeadDetails)?.preferences?.consultantId ||
        lead?.preferences?.consultantId;


    const modalDetails = {
        fullName: fullLeadData?.fullName || lead?.fullName || "—",
        inqNo: fullLeadData?.inqNo || lead?.inqNo || "—",

        assignedTac: consultant?.firstName && consultant?.lastName
            ? `${consultant.firstName} ${consultant.lastName}`
            : "Unassigned",

        positionApplied:
            (fullLeadData as any)?.documents?.position?.title ||
            lead?.documents?.position?.title ||
            "N/A"
    };
    return {
        action, setAction, remarks, setRemarks, submitLoading, fullLeadData,
        fetchingDetails, selectedDate, setSelectedDate, slots, fetchingSlots,
        selectedSlot, setSelectedSlot, handleSubmit,
        modalDetails
    };
};