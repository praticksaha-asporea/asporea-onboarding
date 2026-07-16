"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/Redux/store";
import { updateUserData } from "@/Redux/Auth/user.slice";
import {
  getTacListAction,
  getExternalSourcesAction,
  createInquiryAction,
  userDetailsAction,
} from "@/Services/APIs/Inquiry/inquiry.action";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { InquiryFormValues } from "@/Types/Frontend_Payload/lead.types";
import { branchListingApi } from "@/Services/APIs/branch/branch.actions";
import { getJourneyTimelineAction } from "@/Services/APIs/Assessment/assessment.actions";
import { NotificationPreferences } from "@/Types/Frontend_Payload/precounselling.types";
import { profileUpdateApi } from "@/Services/APIs/auth/auth.actions";

// ─── Validation Schema ────────────────────────────────────────────────────────

export const inquiryValidationSchema = Yup.object({
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
  prefferedBranch: Yup.string().required("Please select a preferred branch"),
  prefferedConsultant: Yup.string().nullable(),
  visitOption: Yup.number().required("Visit option is required"),
  fullAddress: Yup.string().trim().required("Full Address is required"),
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

// ─── Steps ────────────────────────────────────────────────────────────────────

export const inquirySteps = [
  { label: "Inquiry", description: "", status: "completed" },
  { label: "Pre-Counselling", description: "Start now", status: "pending" },
  { label: "Documents", description: "Start now", status: "pending" },
  { label: "Experience Selection", description: "Start now", status: "pending" },
  { label: "Assessment Status", description: "Start now", status: "pending" },
  { label: "Technical Round", description: "Start now", status: "pending" },
];



export function makeFieldHelpers(errors: Record<string, any>, submitCount: number) {
  return {
    err: (field: string) => submitCount > 0 && Boolean(errors[field]),
    helperText: (field: string) => (submitCount > 0 ? errors[field] : undefined),
  };
}



export function useInquiry() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state: RootState) => (state as any).user);
  useEffect(() => {
    const fetchFreshProfile = async () => {
      const userId = userData?.id || userData?._id;

      if (!userId || userData?.leadId) return;

      try {

        const res = await userDetailsAction({ userId });

        if (res.data?.success && res.data?.data) {
          const actualProfileData = res.data.data.user || res.data.data;
          dispatch(updateUserData(actualProfileData));
        }
      } catch (err) {
        console.error("Fresh profile fetch error:", err);
      }
    };

    fetchFreshProfile();
  }, [userData?.id, userData?._id, userData?.leadId, dispatch]);

  // ── Branches ────────────────────────────────────────────────────────────────
  const [branches, setBranches] = useState<any[]>([]);

  const fetchBranches = async (lat: number, lng: number) => {
    try {
      const response = await branchListingApi({ lat, lng });
      setBranches(response?.data?.data?.data || []);
    } catch (error) {
      console.error("Branch fetch error:", error);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        fetchBranches(coords.latitude, coords.longitude);
      },
      (error) => {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);



  const [hasExistingData, setHasExistingData] = useState(false);
  const [activeStepperStep, setActiveStepperStep] = useState<number>(0);

  // ── Initial form values from user data ───────────────────────────────────────
  const getInitialValues = (): InquiryFormValues => ({
    fullName: `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim(),
    email: userData?.email || "",
    phoneNumber: userData?.phoneNumber || "",
    whatsappNumber: userData?.whatsappNumber || "",
    fullAddress: userData?.address || "",
    prefferedBranch: "",
    prefferedConsultant: "",
    visitOption: 0,
    referedFrom: "web-app",
    referedType: "",
    referedBy: "",
    otherReferedBy: "",
    passportNo: userData?.passportStatus === "having" ? userData?.passportNo : ""
  });
  useEffect(() => {
    const fetchRealProgress = async () => {
      const existingLeadId = userData?.leadId || userData?.user?.leadId;

      if (!existingLeadId) {
        setActiveStepperStep(0);
        return;
      }

      try {

        const res = await getJourneyTimelineAction({ leadId: existingLeadId });
        if (res?.data?.success && res?.data) {

          setActiveStepperStep(res?.data?.data?.activeStep);
        } else {
          setActiveStepperStep(1);
        }
      } catch (error) {
        console.error("Failed to sync actual stepper progress:", error);
        setActiveStepperStep(1);
      }
    };

    fetchRealProgress();
  }, [userData?.leadId]);


  useEffect(() => {
    const existingLeadId = userData?.leadId || userData?.user?.leadId;

    if (existingLeadId) {

      setHasExistingData(true);



    }
  }, [userData]);

  const handleClosePopup = () => {

    setShowInquiryPopup(false);


    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formik = useFormik({
    initialValues: getInitialValues(),
    enableReinitialize: true,
    validationSchema: inquiryValidationSchema,
    onSubmit: (values, { setSubmitting }) => {
      handleSubmit(values, setSubmitting);
    },
  });

  useEffect(() => {
    fetchConsultants(formik.values.prefferedBranch);
    formik.setFieldValue("prefferedConsultant", "");
  }, [formik.values.prefferedBranch]);

  useEffect(() => {
    if (!formik.values.referedType) return;

    fetchExternalSources(
      formik.values.referedType,
      formik.setFieldValue
    );
  }, [formik.values.referedType]);

  const selectedBranchName =
    (branches as any[]).find((b) => b._id === formik.values.prefferedBranch)
      ?.title || "our branch";

  const { err, helperText } = makeFieldHelpers(
    formik.errors as Record<string, any>,
    formik.submitCount,
  );
  // ── Consultants ─────────────────────────────────────────────────────────────
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loadingConsultants, setLoadingConsultants] = useState(false);

  const fetchConsultants = async (branchId: string) => {
    if (!branchId) {
      setConsultants([]);
      return;
    }
    setLoadingConsultants(true);
    try {
      const response = await getTacListAction({ branchId });
      if (response?.data?.success) setConsultants(response?.data?.data);
    } catch (err) {
      console.error("TAC fetch error:", err);
    } finally {
      setLoadingConsultants(false);
    }
  };

  // ── External Sources ─────────────────────────────────────────────────────────
  const [externalSources, setExternalSources] = useState<any[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);

  const fetchExternalSources = async (
    referedType: string,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    if (!referedType) {
      setExternalSources([]);
      return;
    }
    if (referedType === "other") {
      setExternalSources([]);
      setFieldValue("referedBy", "other");
      return;
    }
    setLoadingSources(true);
    try {
      const response = await getExternalSourcesAction({ type: referedType });
      if (response.data.success) {
        setExternalSources(response.data.data);
        setFieldValue("referedBy", "");
      }
    } catch (err) {
      console.error("External sources fetch error:", err);
    } finally {
      setLoadingSources(false);
    }
  };

  // ── Notification Preferences ─────────────────────────────────────────────────
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    whatsapp: false,
  });

  useEffect(() => {
    if (userData?.notificationPreference) {
      setPreferences({
        email: userData.notificationPreference.email ?? true,
        sms: userData.notificationPreference.sms ?? false,
        whatsapp: userData.notificationPreference.whatsapp ?? false,
      });
    }
  }, [userData]);

  const handlePreferenceToggle = (type: keyof NotificationPreferences) => {
    setPreferences((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const isPreferenceError = !(
    preferences.email ||
    preferences.sms ||
    preferences.whatsapp
  );

  // ── Submission ───────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [showInquiryPopup, setShowInquiryPopup] = useState(false);
  const [generatedInqNo, setGeneratedInqNo] = useState("");
  const [assignedTAC, setAssignedTAC] = useState<string | null>(null);
  const [generatedLeadId, setGeneratedLeadId] = useState("");

  const handleSubmit = async (
    values: InquiryFormValues,
    setSubmittingFormik: (v: boolean) => void,
  ) => {
    if (isPreferenceError) {
      setSubmittingFormik(false);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...values,
        phoneNumber: String(values.phoneNumber),
        whatsappNumber: String(values.whatsappNumber),
        visitOption: Number(values.visitOption),
        prefferedConsultant:
          values.prefferedConsultant === "" ? null : values.prefferedConsultant,
        referedBy:
          values.referedFrom === "reffer" ? values.referedBy : null,
        referedType:
          values.referedFrom === "reffer" ? values.referedType : null,
        passportNo: userData?.passportStatus === "having" ? userData?.passportNo : ""
      };

      const response = await createInquiryAction(payload);

      if (response?.data?.success) {
        toast.success(response?.data?.message);
        setGeneratedInqNo(response?.data?.data.inqNo);
        setGeneratedLeadId(response?.data?.data._id);
        setShowInquiryPopup(true);
        setAssignedTAC(response?.data?.data?.preferences?.consultantId)

        dispatch(
          updateUserData({
            leadId: response?.data?.data._id,
            visitOption: Number(values.visitOption),
            prefferedConsultant: response?.data?.data?.preferences?.consultantId
            // values.prefferedConsultant === "" ? undefined : values.prefferedConsultant,
          })
        );

        const userId = userData?.id || userData?._id;
        if (userId) {
          try {
            const res = await profileUpdateApi({
              notificationPreference: preferences,
            });
            if (res.data?.success) {
              dispatch(
                updateUserData({
                  notificationPreference:
                    res.data.data.notificationPreference,
                }),
              );
            }
          } catch (err) {
            console.error("Profile preference sync failed:", err);
          }
        }
      }
    } catch (err: any) {
      //   toast.error(err?.response?.data?.message || "Submission failed");
      console.error("Inquiry submission error:", err);
    } finally {
      setSubmitting(false);
      setSubmittingFormik(false);
    }
  };

  const isFormDisabled = hasExistingData || generatedInqNo !== "";

  return {
    // data
    branches,
    consultants,
    externalSources,
    preferences,
    isPreferenceError,
    submitting,
    showInquiryPopup,
    setShowInquiryPopup,
    generatedInqNo,
    generatedLeadId,
    loadingConsultants,
    loadingSources,
    userData,
    // actions
    fetchConsultants,
    fetchExternalSources,
    handlePreferenceToggle,
    handleSubmit,
    getInitialValues,
    assignedTAC,
    formik,
    isFormDisabled,
    err,
    helperText,
    activeStepperStep,
    handleClosePopup,
    selectedBranchName
  };
}
