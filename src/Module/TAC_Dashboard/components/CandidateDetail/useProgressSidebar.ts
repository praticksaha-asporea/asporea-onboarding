import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { confirmToast } from "@/Utils/confirmToast";
import { transferLeadAction } from "@/Services/APIs/tac/tac.actions";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";

export const useProgressSidebar = (candidate: CandidateLead, transferTo: string, setTransferTo: (val: string) => void) => {
  const transferForm = useFormik({
    initialValues: { toId: transferTo || "", reason: "" },
    enableReinitialize: true,
    validationSchema: Yup.object({
      toId: Yup.string().required("Please select a TAC to transfer to."),
      reason: Yup.string().trim().required("Reason is required for transfer."),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const isConfirmed = await confirmToast("Are you sure you want to transfer this lead directly to the selected TAC?");
      if (!isConfirmed) {
        setSubmitting(false);
        return; 
      }
      try {
        await transferLeadAction({ leadId: candidate._id, toId: values.toId, reason: values.reason });
        toast.success("Transfer request submitted successfully!", { id: "escalation-submit-toast" });
        resetForm();
        setTransferTo("");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to submit transfer.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fe = (field: string) => !!(transferForm.touched[field as keyof typeof transferForm.touched] && transferForm.errors[field as keyof typeof transferForm.errors]);
  const fh = (field: string) => transferForm.touched[field as keyof typeof transferForm.touched] ? (transferForm.errors[field as keyof typeof transferForm.errors] as string) : undefined;

  return { transferForm, fe, fh };
};