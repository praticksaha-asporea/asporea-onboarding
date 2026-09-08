"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { loadCaptchaEnginge, validateCaptcha } from "react-simple-captcha";

import {
  foeSendCandidateOtpAction,
  foeCreateInquiryAction,
} from "@/Services/APIs/foe/foe.action";
import { useInquiryCategories } from "@/Module/Candidate_Dashboard/Inquiry/Sub-hooks/useInquiryCategories";
import { useInquiryReferrals } from "@/Module/Candidate_Dashboard/Inquiry/Sub-hooks/useInquiryReferrals";
import { FoeInquiryPayload } from "@/Types/foe.types";

export const foeInquiryValidationSchema = Yup.object({
  fullName: Yup.string().trim().required("Full Name is required"),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone number")
    .required("Phone number is required"),
  whatsappNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter a valid 10-digit WhatsApp number")
    .required("WhatsApp number is required"),
  inquiryCategory: Yup.string().required("Please select a category"),
  inquiryFor: Yup.string().required("Please select a position"),
  passportStatus: Yup.string().required("Passport status is required"),
  passportNo: Yup.string().when("passportStatus", {
    is: "having",
    then: (s) => s.required("Passport number is required"),
    otherwise: (s) => s.notRequired(),
  }),
  nationality: Yup.string().required("Please select nationality"),
  latestAcademic: Yup.string().required(
    "Please select latest academic qualification",
  ),
  latestTechnical: Yup.string().trim().notRequired(),
  workExperience: Yup.string().trim().notRequired(),
  referedFrom: Yup.string().required("Please select how they heard about us"),
  captchaValue: Yup.string().required("Captcha is required"),  
  referedType: Yup.string().when("referedFrom", {
    is: "reffer",
    then: (s) => s.required("Please select referral type"),
    otherwise: (s) => s.notRequired(),
  }),
  referedBy: Yup.string().when(["referedFrom", "referedType"], {
    is: (from: string, type: string) => from === "reffer" && type !== "other",
    then: (s) => s.required("Please select referrer name"),
    otherwise: (s) => s.notRequired(),
  }),
  otherReferedBy: Yup.string().when(["referedFrom", "referedType"], {
    is: (from: string, type: string) => from === "reffer" && type === "other",
    then: (s) => s.required("Please specify referrer details"),
    otherwise: (s) => s.notRequired(),
  }),
});

export function useCreateInquiry() {
  const router = useRouter();
  const category = useInquiryCategories();
  const referrals = useInquiryReferrals();

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
useEffect(() => {
    loadCaptchaEnginge(6);
  }, []);
  const initialValues: FoeInquiryPayload = {
    fullName: "",
    email: "",
    phoneNumber: "",
    whatsappNumber: "",
    passportStatus: "not",
    passportNo: "",
    inquiryCategory: "",
    inquiryFor: "",
    nationality: "",
    latestAcademic: "",
    latestTechnical: "",
    workExperience: "",
    referedFrom: "web-app",
    referedType: "",
    referedBy: "",
    otherReferedBy: "",
    otp: "",
    captchaValue: "",  
  };

  const formik = useFormik<FoeInquiryPayload>({
    initialValues,
    validationSchema: foeInquiryValidationSchema,
    onSubmit: async (values) => {
        if (!validateCaptcha(values.captchaValue)) {
        toast.error("Invalid Captcha! Please enter correct code.");
        formik.setFieldValue("captchaValue", "");
        return;
      }
      if (!otpSent) {
        setSendingOtp(true);
        try {
          const res = await foeSendCandidateOtpAction({
            identity: values.phoneNumber,
            email: values.email,
            phone: values.phoneNumber,
            whatsapp: values.whatsappNumber,
          });

          if (res?.data?.success) {
            toast.success("OTP sent to candidate successfully");
            setOtpSent(true);
          }
        } catch (err: unknown) {
          const errorRes = err as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            errorRes?.response?.data?.message || "Failed to send OTP",
          );
        } finally {
          setSendingOtp(false);
        }
      } else {
        if (!otp || otp.length !== 6) {
          toast.error("Please enter a valid 6-digit OTP");
          return;
        }

        setSubmitting(true);
        try {
          const payload = { ...values, otp };
          const res = await foeCreateInquiryAction(payload);

          if (res?.data?.success) {
            toast.success("Candidate and Inquiry created successfully!");
            router.push("/dashboard");
          }
        } catch (err: unknown) {
          const errorRes = err as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            errorRes?.response?.data?.message ||
              "Failed to verify OTP or create inquiry",
          );
        } finally {
          setSubmitting(false);
        }
      }
    },
  });

  useEffect(() => {
    if (formik.values.inquiryCategory) {
      if (!category.isCountryValue(formik.values.inquiryCategory)) {
        category.fetchPositions(formik.values.inquiryCategory);
      }
    }
  }, [formik.values.inquiryCategory]);

  const handleCategoryChange = (val: string) => {
    formik.setFieldValue("inquiryCategory", val);
    formik.setFieldValue("inquiryFor", "");
  };

  useEffect(() => {
    if (formik.values.referedType && formik.values.referedType !== "other") {
      referrals.fetchExternalSources(
        formik.values.referedType,
        formik.setFieldValue,
      );
    }
  }, [formik.values.referedType]);

  const err = (field: keyof FoeInquiryPayload) =>
    formik.submitCount > 0 && Boolean(formik.errors[field]);

  const helperText = (field: keyof FoeInquiryPayload) =>
    formik.submitCount > 0 ? (formik.errors[field] as string) : undefined;

  return {
    formik,
    err,
    helperText,
    otpSent,
    setOtpSent,
    otp,
    setOtp,
    sendingOtp,
    submitting,
    categoryOptions: category.categoryOptions,
    positionData: category.positionData,
    handleCategoryChange,
    externalSources: referrals.externalSources,
    loadingSources: referrals.loadingSources,
  };
}
