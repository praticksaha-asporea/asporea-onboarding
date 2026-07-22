import { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { updateAssignmentAction } from "@/Services/APIs/tac/tac.actions";
import { confirmToast } from "@/Utils/confirmToast";
import { CamelCase, isWithinSchedule } from "@/Utils/common";
import { AssignmentStatus, IAssignment } from "@/lib/models/Assignment.model";

export const usePreCounselling = (inqAssign: IAssignment, candidatePhone: string) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreLocked, setIsPreLocked] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const initialCV = inqAssign?.pre?.initialCV;

  const existingResume =
    initialCV &&
      typeof initialCV === "object" &&
      "path" in initialCV
      ? initialCV.path
      : undefined;

  // Handle preview URL creation/cleanup
  useEffect(() => {
    let objectUrl: string | null = null;
    if (resumeFile) {
      objectUrl = URL.createObjectURL(resumeFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(existingResume ?? null);
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [resumeFile, existingResume]);

  const isPdf = resumeFile
    ? resumeFile.type === "application/pdf"
    : existingResume?.toLowerCase().includes(".pdf") ?? false;

  // Handle Form lock status based on schedule and current status
  useEffect(() => {
    if (inqAssign?.status === "completed" || inqAssign?.status === "rejected") {
      setIsPreLocked(true);
    } else if (
      inqAssign?.status === "queued" &&
      isWithinSchedule(inqAssign) &&
      inqAssign?.schedule?.from !== "" &&
      inqAssign?.schedule?.to !== ""
    ) {
      setIsPreLocked(false);
    }
  }, [inqAssign]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setResumeFile(file);
      preForm.setFieldValue("resumeFile", file);
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

  // Main Formik Setup
  const preForm = useFormik({
    initialValues: {
      preStatus: inqAssign?.status ?? "na",
      additionalDetails: inqAssign?.pre?.additionalDetails ?? "",
      specificNotes: inqAssign?.pre?.specificNotes ?? "",
      advice: inqAssign?.pre?.advice ?? "",
      resumeFile: null as File | null,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      preStatus: Yup.string().trim().required("Status is required"),
      additionalDetails: Yup.string().trim().required("Additional details are required"),
      specificNotes: Yup.string().trim().optional(),
      advice: Yup.string().trim().optional(),
      resumeFile: Yup.mixed<File>().nullable().optional(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!inqAssign?._id) {
        toast.error("No pre-counselling assignment found");
        setSubmitting(false);
        return;
      }

      if (values.preStatus === "completed" || values.preStatus === "rejected") {
        const actionText = values.preStatus === "completed" ? "Completed" : "Rejected";
        const confirmed = await confirmToast(`Are you sure Candidate is ${actionText}!`);
        if (!confirmed) { setSubmitting(false); return; }
      }

      try {
        const formData = new FormData();
        formData.append("assignmentId", inqAssign._id.toString());
        formData.append("status", values.preStatus);
        formData.append("additionalDetails", values.additionalDetails);
        formData.append("specificNotes", values.specificNotes);
        formData.append("advice", values.advice);
        if (values.resumeFile) formData.append("resume", values.resumeFile);

        const preResult = await updateAssignmentAction(formData);
        if (preResult?.data?.data?.status === "completed" || preResult?.data?.data?.status === "rejected") {
          setIsPreLocked(true);
        }
        toast.success("Status Updated successfully");
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? "Save failed");
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Scroll to error
  useEffect(() => {
    if (preForm.submitCount > 0 && Object.keys(preForm.errors).length > 0) {
      const firstErrorField = Object.keys(preForm.errors)[0];
      const errorElement = document.getElementsByName(firstErrorField)[0] || document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus();
      }
    }
  }, [preForm.submitCount]);

  const updateAssignmentStatus = async (status: string) => {
    if (!inqAssign?._id) return;
    const textStatus = status === "contacted"
      ? `Are you sure?\nYou contacted ${candidatePhone}`
      : status === "not_responded"
        ? `You contacted ${candidatePhone},\nbut the candidate did not respond?`
        : "Are you sure you are available to talk with this candidate now?";

    const confirmed = await confirmToast(textStatus);
    if (!confirmed) return;

    try {
      const formData = new FormData();
      formData.append("assignmentId", inqAssign._id.toString());
      formData.append("status", status);

      await updateAssignmentAction(formData);
      toast.success(`Status updated to ${CamelCase(status)}`);

      preForm.setValues({ ...preForm.values, preStatus: status as AssignmentStatus });
      if (status === "queued") setIsPreLocked(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Update failed");
    }
  };

  return {
    preForm,
    isPreLocked,
    setIsPreLocked,
    previewUrl,
    isPreviewOpen,
    setIsPreviewOpen,
    isPdf,
    isDragging,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    onFileInputChange,
    updateAssignmentStatus
  };
};