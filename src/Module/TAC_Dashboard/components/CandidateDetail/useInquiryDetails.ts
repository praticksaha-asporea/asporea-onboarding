import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { updateLeadAction } from "@/Services/APIs/tac/tac.actions";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";


export const useInquiryDetails = (candidate: CandidateLead) => {
    const contact = candidate.contact ?? { phone: "", whatsapp: "", email: "" };
    const passport = candidate.passport ?? { status: "no", no: "" };
    const preferences = candidate.preferences ?? { visitType: "" };
    const notifPrefs = candidate.notificationPreference || { email: false, sms: false, whatsapp: false };

    const inquiryForm = useFormik({
        initialValues: {
            fullName: candidate.name ?? candidate.fullName ?? "",
            email: contact.email ?? "",
            phone: contact.phone ?? "",
            whatsapp: contact.whatsapp ?? "",
            address: candidate.address ?? "",
            passportStatus: passport.status ?? "no",
            passportNo: passport.no ?? "",
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            fullName: Yup.string().trim().required("Full name is required"),
            email: Yup.string().email("Invalid email").required("Email is required"),
            phone: Yup.string().matches(/^[0-9]{10}$/, "Must be exactly 10 digits").required("Phone is required"),
            whatsapp: Yup.string().matches(/^[0-9]{10}$/, "Must be exactly 10 digits").required("WhatsApp is required"),
            address: Yup.string().trim().required("Address is required"),
            passportStatus: Yup.string().required(),
            passportNo: Yup.string().when("passportStatus", {
                is: "having", then: (s) => s.trim().required("Passport number is required"), otherwise: (s) => s.optional(),
            }),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                await updateLeadAction({ id: candidate._id, ...values });
                toast.success("Inquiry details updated");
            } catch (err: any) {
                toast.error(err?.response?.data?.message ?? "Update failed");
            } finally {
                setSubmitting(false);
            }
        },
    });

    const fe = (field: string) => !!(inquiryForm.touched[field as keyof typeof inquiryForm.touched] && inquiryForm.errors[field as keyof typeof inquiryForm.errors]);
    const fh = (field: string) => inquiryForm.touched[field as keyof typeof inquiryForm.touched] ? (inquiryForm.errors[field as keyof typeof inquiryForm.errors] as string) : undefined;

    const getChipStyle = (isActive: boolean) => isActive ? "!bg-[var(--mui-palette-success-dark)] !text-white !font-bold !border-green-700" : "!bg-[var(--mui-palette-primary)] !text-gray-400 !border-gray-300";

    return { inquiryForm, fe, fh, getChipStyle, preferences, notifPrefs };
};