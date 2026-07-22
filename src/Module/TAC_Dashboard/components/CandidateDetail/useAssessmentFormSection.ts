import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { updateAssignmentAssessAction, updateDocumentStatusAction, updateExpStatusAction } from "@/Services/APIs/tac/tac.actions";
import { confirmToast } from "@/Utils/confirmToast";
import { CamelCase, isWithinSchedule } from "@/Utils/common";
import { AssessBasicFormValues, ExpStatus, ExpType } from "@/Types/object.types";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";
import { IAssignment } from "@/lib/models/Assignment.model";

export const useAssessmentFormSection = (candidate: CandidateLead, assessAssign: IAssignment) => {
  const docs = candidate?.documents || {};
  const exp = candidate?.experience || {};
  const tech = candidate?.technical || {};

  const [docStatus, setDocStatus] = useState(docs.status || "na");
  const [expStatus, setExpStatus] = useState<ExpStatus>("selected");
  const [expType, setExpType] = useState<ExpType>(candidate?.experience?.type as ExpType);
  const [isPreLocked, setIsPreLocked] = useState(true);
  const [docReject, setDocReject] = useState(false);
  const [docVerify, setDocVerify] = useState(false);
  const [docRequestTL, setDocRequestTL] = useState(false);
  const [expRFT, setExpRFT] = useState(false);
  const [expVerified, setExpVerified] = useState(false);
  const [expRequestTech, setExpRequestTech] = useState(false);
  const [techStatus, setTechStatus] = useState(tech.status || "na");
  const [classifyExp, setClassifyExp] = useState(tech.classify || "");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [remarksText, setRemarksText] = useState("");
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);

  const assessBasicForm = useFormik<AssessBasicFormValues>({
    initialValues: { status: assessAssign?.status ?? "na" },
    enableReinitialize: true,
    validationSchema: Yup.object({ status: Yup.string().trim().required("Status is required") }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!assessAssign?._id) { toast.error("No assessment assignment found"); setSubmitting(false); return; }
      if (values.status === "completed") {
        const confirmed = await confirmToast(`Are you sure Pre-Counselling is Completed!`);
        if (!confirmed) { setSubmitting(false); return; }
      }
      if (values.status === "rejected") {
        const confirmed = await confirmToast(`Are you sure Candidate is Rejected!`);
        if (!confirmed) { setSubmitting(false); return; }
      }

      try {
        const formData = new FormData();
        formData.append("assignmentId", assessAssign._id.toString());
        formData.append("status", values.status ?? "");
        const assessResult = await updateAssignmentAssessAction(formData);
        if (assessResult?.data?.data?.status === "completed" || assessResult?.data?.data?.status === "rejected") {
          setIsPreLocked(true);
        }
        toast.success("Status Updated and will be sent to Candidate via Email");
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? "Save failed");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    setDocStatus(docs.status || "na");
    setExpStatus(candidate?.experience?.status as ExpStatus);
    setExpType(candidate?.experience?.type as ExpType);
    setClassifyExp(tech.classify || "");

    if (assessAssign?.status === "completed" || assessAssign?.status === "rejected") {
      setIsPreLocked(true);
    } else if (assessAssign?.status === "queued" && isWithinSchedule(assessAssign) && assessAssign?.schedule?.from != "" && assessAssign?.schedule?.to != "") {
      setIsPreLocked(false);
    }

    if (candidate?.status === "doc_awaiting_approval") {
      setDocReject(false); setDocVerify(false); setDocRequestTL(false);
      setExpRFT(false); setExpVerified(false); setShowAssessmentForm(false);
    } else {
      setDocReject(docs?.status === "uploaded");
      setDocVerify(docs?.status === "uploaded");
      setDocRequestTL(docs?.status === "uploaded");
      setExpRFT(docs?.status === "verified");
      setExpVerified(docs?.status === "verified");
      setShowAssessmentForm(docs?.status === "verified" && candidate?.experience?.status === "verified");
    }

    if (candidate?.experience?.status === "request_technical") {
      setExpRequestTech(true);
      setTechStatus("refered");
      setExpRFT(false);
      setExpVerified(false);
    }
  }, [assessAssign, candidate, docs, exp, tech]);

  const updateAssignmentStatus = async (status: string) => {
    if (!assessAssign?._id) return;
    const textStatus = status === "contacted" ? `Are you sure?\nYou contacted ${candidate.contact?.phone ?? ""}` : status === "not_responded" ? `You contacted ${candidate.contact?.phone ?? ""},\nbut the candidate did not respond?` : "Are you sure you are available to talk with this candidate now?";
    const confirmed = await confirmToast(textStatus);
    if (!confirmed) return;
    try {
      const formData = new FormData();
      formData.append("assignmentId", assessAssign._id.toString());
      formData.append("status", status);
      await updateAssignmentAssessAction(formData);
      toast.success(`Status updated to ${CamelCase(status)}`);
      assessBasicForm.setValues({ ...assessBasicForm.values, status: status });
      if (status === "queued") setIsPreLocked(false);
    } catch (err: any) {
      console.log(err?.response?.data?.message ?? "Update failed");
    }
  };

  const handleSaveAll = async () => {
    if (assessBasicForm.values.status === "rejected") {
      const confirmed = await confirmToast(`Are you sure Candidate is Rejected!`);
      if (!confirmed) return;
      const formData = new FormData();
      formData.append("assignmentId", assessAssign._id.toString());
      formData.append("status", assessBasicForm.values.status);
      await updateAssignmentAssessAction(formData);
      toast.success(`Status updated to ${CamelCase(assessBasicForm.values.status)}`);
      assessBasicForm.setValues({ ...assessBasicForm.values, status: assessBasicForm.values.status });
      setIsPreLocked(true);
    }
  };

  const updateDocumentStatus = async (status: "verified" | "rejected" | "awaiting_approval", customRemarks?: string) => {
    if (!assessAssign?._id) return;
    const messages = { verified: "Are you sure?\nYou verified these documents.", rejected: "Are you sure?\nYou are rejecting these documents.", awaiting_approval: "Are you sure?\nSend these documents for approval?" };
    const confirmed = await confirmToast(messages[status]);
    if (!confirmed) return;
    try {
      const res = await updateDocumentStatusAction({ id: assessAssign._id.toString(), status, remarks: customRemarks });
      const resDocStatus = res?.data?.data?.documents?.status;

      toast.success(`Documents marked as ${CamelCase(status)}`);
      // console.log(docReject, resDocStatus, 4444);
      setDocReject(resDocStatus === "uploaded" ? false : true);
      setDocVerify(resDocStatus === "uploaded" ? false : true);
      setDocRequestTL(resDocStatus === "uploaded" ? false : true);
      setExpRFT(resDocStatus === "verified");
      setExpVerified(resDocStatus === "verified");
      setDocStatus(resDocStatus);
    } catch (err: any) { console.log(err); }
  };

  const updateExpStatus = async (status: "verified" | "rejected" | "request_technical") => {
    if (!assessAssign?._id) return;
    const textStatus = status === "verified" ? `Are you sure?\nYou verified candidate experience.` : status === "rejected" ? `Are you sure?\nYou rejecting candidate experience.` : status === "request_technical" ? `Are you sure?\nYou want technical round for this candidate.` : ``;
    const confirmed = await confirmToast(textStatus);
    if (!confirmed) return;
    try {
      const updatedEXPLead = await updateExpStatusAction({ id: assessAssign._id.toString(), status, expType });
      toast.success(`Experience updated as ${CamelCase(status)} !`);
      if (updatedEXPLead?.data?.data?.experience?.status === "verified") { setShowAssessmentForm(true); } else { setShowAssessmentForm(false); }
      setExpRFT(false); setExpVerified(false);
      if (status === "request_technical") { setExpRequestTech(true); setTechStatus("refered"); }
      setExpStatus(updatedEXPLead?.data?.data?.experience?.status);
      setExpType(updatedEXPLead?.data?.data?.experience?.type as ExpType);
    } catch (err: any) { console.log(err); }
  };

  const currentStatus = assessBasicForm.values.status || assessAssign.status;
  const canAccess = isWithinSchedule(assessAssign);
  const isFinalStatus = ["completed", "rejected"].includes(currentStatus);
  const canCall = canAccess && !isFinalStatus && ["assigned", "not_responded"].includes(currentStatus);
  const canMarkNotResponded = canAccess && !isFinalStatus && currentStatus === "contacted";

  return {
    assessBasicForm, isPreLocked, setIsPreLocked, docStatus, setDocStatus, expStatus, setExpStatus,
    expType, setExpType, techStatus, setTechStatus, classifyExp, setClassifyExp, showRejectBox,
    setShowRejectBox, remarksText, setRemarksText, docReject, docVerify, docRequestTL, expRFT, expVerified,
    expRequestTech, showAssessmentForm, updateAssignmentStatus, handleSaveAll, updateDocumentStatus, updateExpStatus, canCall, canMarkNotResponded
  };
};