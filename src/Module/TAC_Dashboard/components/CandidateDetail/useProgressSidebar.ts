import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { escalateLeadAction } from "@/Services/APIs/tac/tac.actions";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";

export const useProgressSidebar = (candidate: CandidateLead, escalateTo: string, setEscalateTo: (val: string) => void) => {
  const escalationForm = useFormik({
    initialValues: { toId: escalateTo || "", reason: "" },
    enableReinitialize: true,
    validationSchema: Yup.object({
      toId: Yup.string().required("Please select a TAC to escalate to."),
      reason: Yup.string().trim().required("Reason is required for escalation."),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await escalateLeadAction({ leadId: candidate._id, toId: values.toId, reason: values.reason });
        toast.success("Escalation request submitted successfully!", { id: "escalation-submit-toast" });
        resetForm();
        setEscalateTo("");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to submit escalation.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fe = (field: string) => !!(escalationForm.touched[field as keyof typeof escalationForm.touched] && escalationForm.errors[field as keyof typeof escalationForm.errors]);
  const fh = (field: string) => escalationForm.touched[field as keyof typeof escalationForm.touched] ? (escalationForm.errors[field as keyof typeof escalationForm.errors] as string) : undefined;

  return { escalationForm, fe, fh };
};