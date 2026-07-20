import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import toast from "react-hot-toast";
import { getCandidateDocumentsAction } from "@/Services/APIs/Documents/document.actions";
import { getSlotsAction } from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import { technicalExperienceAction } from "@/Services/APIs/tacHead/experience.action";

import { deepPopulatedLeadDetails, consultantSlotItem } from "@/Types/ApiResponse/documentRes.types";
import { technicalActionPayload } from "@/Types/Frontend_Payload/technical.types";
import { technicalRequestedLeadRecord } from "@/Types/ApiResponse/technicalRes.types";

interface UseTechnicalActionModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  lead: technicalRequestedLeadRecord | null;
  refreshData: () => void;
}

export const useTechnicalActionModal = ({ open, setOpen, lead, refreshData }: UseTechnicalActionModalProps) => {
  const [fullLeadData, setFullLeadData] = useState<deepPopulatedLeadDetails | technicalRequestedLeadRecord | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<consultantSlotItem[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<consultantSlotItem | null>(null);
  const [passingMarks, setPassingMarks] = useState<number>(0);

  useEffect(() => {
    if (open) {
      setSelectedDate("");
      setSelectedSlot(null);
      setSlots([]);
    }
  }, [open]);

  useEffect(() => {
    const fetchSlots = async () => {
      const consultantId = lead?.preferences?.consultantId?._id;
      if (selectedDate && consultantId) {
        setFetchingSlots(true);
        const res = await getSlotsAction({ consultantId, date: selectedDate });
        setSlots(res?.data?.success !== false ? (res?.data?.data as unknown as consultantSlotItem[] || []) : []);
        setFetchingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate, lead]);

  const technicalReviewForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      expType: lead?.experience?.type || "",
      achievedScore: "",
      totalScore: "",
      answered: "",
      questions: "",
      timeTaken: "",
      remarks: "",
      breakdownPdf: null as File | null,
    },
    validationSchema: yup.object({
      expType: yup.string().required("Please choose experience type first"),
      achievedScore: yup.number().typeError("Please enter achieved score").required("Please enter achieved score").min(0, "Achieved score cannot be negative").max(yup.ref("totalScore"), "Achieved score cannot be greater than total score"),
      totalScore: yup.number().typeError("Please enter total score").required("Please enter total score").min(1, "Total score must be at least 1").max(100, "Total score cannot exceed 100"),
      answered: yup.number().typeError("Please enter number of questions answered").required("Please enter number of questions answered").min(0, "Answered questions cannot be negative").max(yup.ref("questions"), "Answered questions cannot exceed total questions"),
      questions: yup.number().typeError("Please enter total number of questions").required("Please enter total number of questions").min(1, "Questions must be at least 1").max(100, "Questions cannot exceed 100"),
      timeTaken: yup.string().required("Please enter total time taken for this round"),
      remarks: yup.string().max(500).optional(),
    }),
    onSubmit: async (values) => {
      const currentIsPassing = Number(values.achievedScore) >= passingMarks && passingMarks > 0;
      if (currentIsPassing && (!selectedDate || !selectedSlot)) {
        toast.error("Candidate has passed! Please schedule the next assessment slot.");
        return;
      }

      const rawPayloadData: technicalActionPayload = {
        leadId: lead?._id || "",
        type: values.expType,
        achievedScore: values.achievedScore,
        totalScore: values.totalScore,
        answered: values.answered,
        questions: values.questions,
        timeTaken: values.timeTaken,
        feedback: values.remarks,
        breakdownPdf: values.breakdownPdf,
      };

      if (currentIsPassing && selectedDate && selectedSlot) {
        rawPayloadData.scheduleDate = selectedDate;
        rawPayloadData.scheduleFrom = selectedSlot.from;
        rawPayloadData.scheduleTo = selectedSlot.to;
      }

      const formData = new FormData();
      Object.entries(rawPayloadData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string | Blob);
        }
      });
      const res = await technicalExperienceAction(formData);
    if (res && res.data?.success !== false) {        
     toast.success("Technical Experience verified successfully!");
        setOpen(false);
        refreshData();
      }
    },
  });

  useEffect(() => {
    const fetchFullLeadDetails = async () => {
      if (open && lead?._id) {
        setFetchingDetails(true);
        setFullLeadData(null);
        const res = await getCandidateDocumentsAction({ leadId: lead._id, settings: true });

        // 🌟 HIGHLIGHT 4: Axios Response Double nesting 'res.data.data' perfectly resolved here!
        if (res?.data?.success && res?.data?.data?.lead) {
          setFullLeadData(res.data.data.lead);

          // Using optional chaining safely to avoid any compiler warnings
          const fullMarks = (res.data.data.generalSettings as any)?.technical?.fullMarks || 100;
          const marksRequired = (res.data.data.generalSettings as any)?.technical?.passingMarks || 0;

          technicalReviewForm.setFieldValue("totalScore", fullMarks);
          setPassingMarks(marksRequired);
        } else {
          toast.error("Failed to fetch complete document details for this candidate.");
          setFullLeadData(lead);
        }
        setFetchingDetails(false);
      }
    };
    fetchFullLeadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead]);

  const isPassing = Number(technicalReviewForm.values.achievedScore) >= passingMarks && passingMarks > 0;

  const consultant =
    (fullLeadData as deepPopulatedLeadDetails)?.preferences?.consultantId ||
    lead?.preferences?.consultantId;

  const posNode = (fullLeadData as deepPopulatedLeadDetails)?.documents?.position;
  const safePositionTitle = (posNode && typeof posNode === 'object' && 'title' in posNode)
    ? posNode.title
    : "No Position Selected";

  const modalDetails = {
    fullName: fullLeadData?.fullName || lead?.fullName || "—",
    inqNo: fullLeadData?.inqNo || lead?.inqNo || "—",
    assignedTac: consultant?.firstName && consultant?.lastName
      ? `${consultant.firstName} ${consultant.lastName}`
      : "Unassigned",
    positionApplied: safePositionTitle
  };
  return {
    fullLeadData, fetchingDetails, selectedDate, setSelectedDate, slots, fetchingSlots,
    selectedSlot, setSelectedSlot, technicalReviewForm, isPassing, modalDetails
  };
};