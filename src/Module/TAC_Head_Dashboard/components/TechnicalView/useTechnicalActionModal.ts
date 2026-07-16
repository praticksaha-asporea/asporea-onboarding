import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import toast from "react-hot-toast";
import { getCandidateDocumentsAction } from "@/Services/APIs/Documents/document.actions";
import { getSlotsAction } from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import { technicalExperienceAction } from "@/Services/APIs/tacHead/experience.action";

interface UseTechnicalActionModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  lead: any;
  refreshData: () => void;
}

export const useTechnicalActionModal = ({ open, setOpen, lead, refreshData }: UseTechnicalActionModalProps) => {
  const [fullLeadData, setFullLeadData] = useState<any>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<any[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
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
      const consultantId = lead?.preferences?.consultantId?._id || lead?.preferences?.consultantId?.id;
      if (selectedDate && consultantId) {
        setFetchingSlots(true);
        const res = await getSlotsAction({ consultantId, date: selectedDate });
        setSlots(res?.data?.success !== false ? (res?.data?.data || []) : []);
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
      achievedScore: yup
        .number()
        .typeError("Please enter achieved score")
        .required("Please enter achieved score")
        .min(0, "Achieved score cannot be negative")
        .max(yup.ref("totalScore"), "Achieved score cannot be greater than total score"),
      totalScore: yup
        .number()
        .typeError("Please enter total score")
        .required("Please enter total score")
        .min(1, "Total score must be at least 1")
        .max(100, "Total score cannot exceed 100"),
      answered: yup
        .number()
        .typeError("Please enter number of questions answered")
        .required("Please enter number of questions answered")
        .min(0, "Answered questions cannot be negative")
        .max(yup.ref("questions"), "Answered questions cannot exceed total questions"),
      questions: yup
        .number()
        .typeError("Please enter total number of questions")
        .required("Please enter total number of questions")
        .min(1, "Questions must be at least 1")
        .max(100, "Questions cannot exceed 100"),
      timeTaken: yup.string().required("Please enter total time taken for this round"),
      remarks: yup.string().max(500).optional(),
    }),
    onSubmit: async (values) => {
      const currentIsPassing = Number(values.achievedScore) >= passingMarks && passingMarks > 0;
      if (currentIsPassing && (!selectedDate || !selectedSlot)) {
        toast.error("Candidate has passed! Please schedule the next assessment slot.");
        return;
      }
      
      const formData = new FormData();
      formData.append("leadId", lead?._id);
      formData.append("type", values.expType);
      formData.append("achievedScore", values.achievedScore);
      formData.append("totalScore", values.totalScore);
      formData.append("answered", values.answered);
      formData.append("questions", values.questions);
      formData.append("timeTaken", values.timeTaken);
      formData.append("feedback", values.remarks);
      
      if (values.breakdownPdf) {
        formData.append("breakdownPdf", values.breakdownPdf);
      }
      if (currentIsPassing && selectedDate && selectedSlot) {
        formData.append("scheduleDate", selectedDate);
        formData.append("scheduleFrom", selectedSlot.from);
        formData.append("scheduleTo", selectedSlot.to);
      }

      const res = await technicalExperienceAction(formData);
      if (res?.success !== false) {
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
        const res = await getCandidateDocumentsAction(lead._id, true);
        if (res?.success && res?.data?.lead) {
          setFullLeadData(res.data.lead);
          technicalReviewForm.setFieldValue("totalScore", res?.data?.generalSettings?.technical?.fullMarks);
          setPassingMarks(res?.data?.generalSettings?.technical?.passingMarks || 0);
        } else {
          toast.error("Failed to fetch complete document details for this candidate.");
          setFullLeadData(lead);
        }
        setFetchingDetails(false);
      }
    };
    fetchFullLeadDetails();
  }, [open, lead]);

  const isPassing = Number(technicalReviewForm.values.achievedScore) >= passingMarks && passingMarks > 0;

  return {
    fullLeadData,
    fetchingDetails,
    selectedDate,
    setSelectedDate,
    slots,
    fetchingSlots,
    selectedSlot,
    setSelectedSlot,
    technicalReviewForm,
    isPassing,
  };
};