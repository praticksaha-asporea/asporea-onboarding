"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/Redux/store";
import { updateUserData } from "@/Redux/Auth/user.slice";
import {
  getTacListAction,
  getExternalSourcesAction,
  createInquiryAction,
} from "@/Services/APIs/Inquiry/inquiry.action";
import axiosClient from "@/Services/AxiosConfig/axiosClient";
import toast from "react-hot-toast";
import * as Yup from "yup";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InquiryFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  prefferedBranch: string;
  prefferedConsultant: string;
  visitOption: number;
  fullAddress: string;
  referedFrom: string;
  referedType: string;
  referedBy: string;
  otherReferedBy: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

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
      
       const res = await axiosClient.get(`/user/details?id=${userId}`);
        
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
      const response = await fetch(
        `/api/branch/list?lat=${lat}&lng=${lng}&radiusKm=5000&limit=50`,
      );
      const result = await response.json();
      setBranches(result?.data?.data || []);
    } catch (error) {
      console.error("Branch fetch error:", error);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchBranches(position.coords.latitude, position.coords.longitude);
      },
      () => {
        toast.error("Please allow location access to get preferred branch list");
      },
    );
  }, []);

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
      const response = await getTacListAction(branchId);
      if (response.success) setConsultants(response.data);
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
      const response = await getExternalSourcesAction(referedType);
      if (response.success) {
        setExternalSources(response.data);
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
      };

      const response = await createInquiryAction(payload);

      if (response.success) {
        toast.success(response.message);
        setGeneratedInqNo(response.data.inqNo);
        setGeneratedLeadId(response.data._id);
        setShowInquiryPopup(true);

         
        const userId = userData?.id || userData?._id;
        if (userId) {
          try {
            const res = await axiosClient.patch("/user/profile-update", {
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
  });

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
  };
}
