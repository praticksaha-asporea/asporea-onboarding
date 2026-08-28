

"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import * as Yup from "yup";

import { RootState } from "@/Redux/store";
import { updateUserData } from "@/Redux/Auth/user.slice";
import {
  createInquiryAction,
  updateInquiryAction,
} from "@/Services/APIs/Inquiry/inquiry.action";
import {
  InquiryFormValues,
  Step2InquiryUpdatePayload,
} from "@/Types/Frontend_Payload/lead.types";

import { useInquiryLocation } from "./Sub-hooks/useInquiryLocation";
import {
  useInquiryCategories,
  buildCategoryOptions,
  CategoryOption,
} from "./Sub-hooks/useInquiryCategories";
import { useInquiryReferrals } from "./Sub-hooks/useInquiryReferrals";
import { useInquiryPreferences } from "./Sub-hooks/useInquiryPreferences";
import { useInquiryProgress } from "./Sub-hooks/useInquiryProgress";

 
export const stepOneValidationSchema = Yup.object({
  fullName: Yup.string().trim().required("Full Name is required"),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Please provide a valid 10-digit phone number")
    .required("Phone Number required"),
  whatsappNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Please provide a valid 10-digit WhatsApp number")
    .required("WhatsApp Number required"),
  inquiryCategory: Yup.string().required("Please select a category"),
  inquiryFor: Yup.string().required("Please select a position"),
});

export const stepTwoValidationSchema = Yup.object({
  nationality: Yup.string().required("Please select your nationality"),
  latestAcademic: Yup.string().required(
    "Please select your latest academic qualification",
  ),
  latestTechnical: Yup.string().trim().notRequired(),
  workExperience: Yup.string().trim().notRequired(),
  referedFrom: Yup.string().required("Please select how you heard about us"),
  referedType: Yup.string().when("referedFrom", {
    is: "reffer",
    then: (s) => s.required("Please select referral type"),
    otherwise: (s) => s.nullable().notRequired(),
  }),
  referedBy: Yup.string().when("referedFrom", {
    is: "reffer",
    then: (s) => s.required("Please select who referred you"),
    otherwise: (s) => s.nullable().notRequired(),
  }),
  otherReferedBy: Yup.string().when(["referedFrom", "referedType"], {
    is: (from: string, type: string) => from === "reffer" && type === "other",
    then: (s) => s.required("Please specify the details"),
    otherwise: (s) => s.nullable().notRequired(),
  }),
});

export const inquiryValidationSchema = stepOneValidationSchema.concat(
  stepTwoValidationSchema,
);

export const inquirySteps = [
  { label: "Inquiry", description: "", status: "completed" },
  { label: "Pre-Counselling", description: "Start now", status: "pending" },
  { label: "Documents", description: "Start now", status: "pending" },
  {
    label: "Experience Selection",
    description: "Start now",
    status: "pending",
  },
  { label: "Assessment Status", description: "Start now", status: "pending" },
  { label: "Technical Round", description: "Start now", status: "pending" },
];

export function makeFieldHelpers(
  errors: Record<string, string | undefined>,
  submitCount: number,
) {
  return {
    err: (field: string) => submitCount > 0 && Boolean(errors[field]),
    helperText: (field: string) =>
      submitCount > 0 ? errors[field] : undefined,
  };
}

const COUNTRY_CATEGORY_MATCH = /countr/i;

export function isCountryCategory(title?: string) {
  return COUNTRY_CATEGORY_MATCH.test(title || "");
}

export { buildCategoryOptions };
export type { CategoryOption };

export function useInquiry() {
  const dispatch = useDispatch();
  const router = useRouter();
  const userData = useSelector((state: RootState) => state.user.userData);

  // Sub-Hooks Initialization
  const location = useInquiryLocation();
  const category = useInquiryCategories();
  const referrals = useInquiryReferrals();
  const preferences = useInquiryPreferences(userData);

  const [submitting, setSubmitting] = useState(false);
  const [creatingInquiry, setCreatingInquiry] = useState(false);
  const [updatingInquiry, setUpdatingInquiry] = useState(false);
  const [showInquiryPopup, setShowInquiryPopup] = useState(false);
  const [generatedInqNo, setGeneratedInqNo] = useState("");

  const getInitialValues = (): InquiryFormValues => ({
    fullName: `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim(),
    email: userData?.email || "",
    phoneNumber: userData?.phoneNumber ? String(userData.phoneNumber) : "",
    whatsappNumber: userData?.whatsappNumber
      ? String(userData.whatsappNumber)
      : "",
    nationality: userData?.candidateProfile?.nationality || "",
    latestAcademic: userData?.candidateProfile?.academic || "",
    latestTechnical: userData?.candidateProfile?.technicalQualification || "",
    workExperience: userData?.candidateProfile?.workExp || "",
    referedFrom: "web-app",
    referedType: "",
    referedBy: "",
    otherReferedBy: "",
    inquiryCategory: "",
    inquiryFor: "",
  });

  const formik = useFormik({
    initialValues: getInitialValues(),
    enableReinitialize: true,
    validate: (values) => {
      const schema =
        progress.formStepRef.current === 0
          ? stepOneValidationSchema
          : stepTwoValidationSchema;
      try {
        schema.validateSync(values, { abortEarly: false });
        return {};
      } catch (validationError: unknown) {
        const err = validationError as Yup.ValidationError;
        if (!err?.inner) return {};
        return err.inner.reduce(
          (acc: Record<string, string>, e: Yup.ValidationError) => ({
            ...acc,
            [e.path as string]: e.message,
          }),
          {},
        );
      }
    },
    onSubmit: (values, { setSubmitting: setSubmittingFormik }) => {
      if (progress.formStepRef.current === 0) {
        handleCreateInquiry(values, setSubmittingFormik);
      } else {
        handleUpdateInquiry(values, setSubmittingFormik);
      }
    },
  });

  // Progress Sync Sub-Hook
  const progress = useInquiryProgress(
    userData,
    referrals.fetchExternalSources,
    formik.setValues,
    formik.setFieldValue,
  );

  useEffect(() => {
    if (category.isCountryValue(formik.values.inquiryCategory)) return;
    category.fetchPositions(formik.values.inquiryCategory);
  }, [formik.values.inquiryCategory, category.countries]);

  const handleCategoryChange = (categoryId: string) => {
    formik.setFieldValue("inquiryCategory", categoryId);
    formik.setFieldValue("inquiryFor", "");
  };

  useEffect(() => {
    if (!formik.values.referedType) return;
    referrals.fetchExternalSources(
      formik.values.referedType,
      formik.setFieldValue,
    );
  }, [formik.values.referedType]);

  const { err, helperText } = makeFieldHelpers(
    formik.errors as Record<string, string | undefined>,
    formik.submitCount,
  );

  const handleClosePopup = () => {
    setShowInquiryPopup(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push("/pre-counselling");
  };

  const handleCreateInquiry = async (
    values: InquiryFormValues,
    setSubmittingFormik: (v: boolean) => void,
  ) => {
    setCreatingInquiry(true);
    setSubmitting(true);
    try {
      const payload: InquiryFormValues = {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: String(values.phoneNumber),
        whatsappNumber: String(values.whatsappNumber),
        inquiryCategory: values.inquiryCategory,
        inquiryFor: values.inquiryFor,
        latitude: location.corordinates?.[0],
        longitude: location.corordinates?.[1],
      };

      const response = await createInquiryAction(payload);

      if (response?.data?.success) {
        toast.success(response?.data?.message);

        const newId = response?.data?.data?._id;
        progress.setInquiryId(newId);
        progress.checkedLeadIdRef.current = newId;
        setGeneratedInqNo(response?.data?.data?.inqNo || "");

        dispatch(updateUserData({ leadId: newId }));
        progress.setFormStep(1);
      }
    } catch (err) {
      console.error("Inquiry create error:", err);
    } finally {
      setCreatingInquiry(false);
      setSubmitting(false);
      setSubmittingFormik(false);
    }
  };

  const handleUpdateInquiry = async (
    values: InquiryFormValues,
    setSubmittingFormik: (v: boolean) => void,
  ) => {
    if (preferences.isPreferenceError) {
      setSubmittingFormik(false);
      return;
    }

    setUpdatingInquiry(true);
    setSubmitting(true);
    try {
      const payload: Step2InquiryUpdatePayload = {
        id: progress.inquiryId,
        nationality: values?.nationality,
        latestAcademic: values?.latestAcademic,
        latestTechnical: values?.latestTechnical,
        workExperience: values?.workExperience,
        referedFrom: values.referedFrom,
        referedType:
          values.referedFrom === "reffer" ? values.referedType : null,
        referedBy: values.referedFrom === "reffer" ? values.referedBy : null,
        otherReferedBy:
          values.referedFrom === "reffer" && values.referedType === "other"
            ? values.otherReferedBy
            : null,
      };

      const response = await updateInquiryAction(progress.inquiryId, payload);

      if (response?.data?.success) {
        toast.success(response?.data?.message);
        setGeneratedInqNo(response?.data?.data?.inqNo || generatedInqNo);
        setShowInquiryPopup(true);

        const updatedProfile = {
          ...userData?.candidateProfile,
          leadId: progress.inquiryId || userData?.candidateProfile?.leadId,
          ...(values.nationality && { nationality: values.nationality }),
          ...(values.latestAcademic && { academic: values.latestAcademic }),
          ...(values.latestTechnical && {
            technicalQualification: values.latestTechnical,
          }),
          ...(values.workExperience && { workExp: values.workExperience }),
        };

        dispatch(
          updateUserData({
            candidateProfile: updatedProfile,
          }),
        );
      }
    } catch (err) {
      console.error("Inquiry update error:", err);
    } finally {
      setUpdatingInquiry(false);
      setSubmitting(false);
      setSubmittingFormik(false);
    }
  };

  const handleCreateStep = () => formik.handleSubmit();
  const handleUpdateStep = () => formik.handleSubmit();
  const goBackToStep1 = () => progress.setFormStep(0);

  const isFormDisabled = false;

  return {
    externalSources: referrals.externalSources,
    preferences: preferences.preferences,
    isPreferenceError: preferences.isPreferenceError,
    submitting,
    showInquiryPopup,
    setShowInquiryPopup,
    generatedInqNo,
    loadingSources: referrals.loadingSources,
    userData,
    formik,
    isFormDisabled,
    err,
    helperText,
    activeStepperStep: progress.activeStepperStep,
    handleClosePopup,
    categoryOptions: category.categoryOptions,
    handleCategoryChange,
    positionData: category.positionData,
    handlePreferenceToggle: preferences.handlePreferenceToggle,
    formStep: progress.formStep,
    inquiryId: progress.inquiryId,
    creatingInquiry,
    updatingInquiry,
    handleCreateStep,
    handleUpdateStep,
    goBackToStep1,
    locationPermissionRequired: location.locationPermissionRequired,
    getLocation: location.getLocation,
  };
}
