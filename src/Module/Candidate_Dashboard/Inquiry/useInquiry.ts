"use client";

import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/Redux/store";
import { updateUserData } from "@/Redux/Auth/user.slice";
import {
  getTacListAction,
  getExternalSourcesAction,
  createInquiryAction,
  // updateInquiryAction, // TODO: add this action next to createInquiryAction — PATCH /inquiry/:id
  userDetailsAction,
  updateInquiryAction,
} from "@/Services/APIs/Inquiry/inquiry.action";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { InquiryFormValues } from "@/Types/Frontend_Payload/lead.types";
import { branchListingApi } from "@/Services/APIs/branch/branch.actions";
import { getJourneyTimelineAction } from "@/Services/APIs/Assessment/assessment.actions";
import { NotificationPreferences } from "@/Types/Frontend_Payload/precounselling.types";
import { profileUpdateApi } from "@/Services/APIs/auth/auth.actions";
import { getPathwayPositionsAction, getPathwayTopLevelAction } from "@/Services/APIs/Pathway/pathway.action";

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
  latestAcademic: Yup.string().required("Please select your latest academic qualification"),
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

// Combined schema kept for anything external that still imports the old name
// (e.g. a shared TS type derived from it). Not used internally anymore —
// internal validation runs per-step, see `validate` inside useFormik below.
export const inquiryValidationSchema = stepOneValidationSchema.concat(stepTwoValidationSchema);

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
      },
    );
  }, []);

  const [hasExistingData, setHasExistingData] = useState(false);
  const [activeStepperStep, setActiveStepperStep] = useState<number>(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [positionData, setPositionData] = useState<any>(null);
  const [loadingPositions, setLoadingPositions] = useState(false);

  // ── Two-step form state ───────────────────────────────────────────────────
  // formStep 0 = basic details (create call), 1 = additional details (update call)
  const [formStep, setFormStep] = useState<0 | 1>(0);
  const [inquiryId, setInquiryId] = useState<string>("");
  const [creatingInquiry, setCreatingInquiry] = useState(false);
  const [updatingInquiry, setUpdatingInquiry] = useState(false);

  // useFormik's `validate` closes over state from the render it was created in,
  // so read the current step through a ref rather than the state variable directly.
  const formStepRef = useRef<0 | 1>(0);
  useEffect(() => {
    formStepRef.current = formStep;
  }, [formStep]);

  // ── Initial form values from user data ───────────────────────────────────────
  const getInitialValues = (): InquiryFormValues => ({
    fullName: `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim(),
    email: userData?.email || "",
    phoneNumber: userData?.phoneNumber || "",
    whatsappNumber: userData?.whatsappNumber || "",
    // fullAddress: userData?.address || "",
    prefferedBranch: "",
    prefferedConsultant: "",
    visitOption: 0,
    referedFrom: "web-app",
    referedType: "",
    referedBy: "",
    otherReferedBy: "",
    passportNo: userData?.passportStatus === "having" ? userData?.passportNo : "",
    inquiryCategory: "",
    inquiryFor: "",
    nationality: userData?.nationality || "",
    latestAcademic: userData?.latestAcademic || "",
    latestTechnical: userData?.latestTechnical || "",
    workExperience: userData?.workExperience || "",
  });

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await getPathwayTopLevelAction();
      if (response?.data?.success) setCategories(response?.data?.data);
    } catch (err) {
      console.error("Category fetch error:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchPositions = async (categoryId: string) => {
    if (!categoryId) {
      setPositionData(null);
      return;
    }
    setLoadingPositions(true);
    try {
      const response = await getPathwayPositionsAction({ pathwayId: categoryId });
      if (response?.data?.success) setPositionData(response?.data?.data);
    } catch (err) {
      console.error("Position fetch error:", err);
    } finally {
      setLoadingPositions(false);
    }
  };

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
          const stepIndex = Math.max(0, (res?.data?.data?.activeStep || 1) - 1);
          setActiveStepperStep(stepIndex);
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

  // If the person already created an inquiry (in this session or a previous one),
  // pick step 2 back up against that same record instead of redoing step 1.
  useEffect(() => {
    const existingLeadId = userData?.leadId || userData?.user?.leadId;

    if (existingLeadId) {
      setHasExistingData(true);

      if (!inquiryId) {
        setInquiryId(existingLeadId);
        // Only jump to step 2 if step 1 hasn't already produced a fresh
        // generatedInqNo in this session (that path advances on its own).
        setFormStep((prev) => (prev === 0 ? 1 : prev));
      }
    }
  }, [userData]);

  const handleClosePopup = () => {
    setShowInquiryPopup(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formik = useFormik({
    initialValues: getInitialValues(),
    enableReinitialize: true,
    validate: (values) => {
      const schema = formStepRef.current === 0 ? stepOneValidationSchema : stepTwoValidationSchema;
      try {
        schema.validateSync(values, { abortEarly: false });
        return {};
      } catch (validationError: any) {
        if (!validationError?.inner) return {};
        return validationError.inner.reduce(
          (acc: Record<string, string>, e: Yup.ValidationError) => ({
            ...acc,
            [e.path as string]: e.message,
          }),
          {},
        );
      }
    },
    onSubmit: (values, { setSubmitting }) => {
      if (formStepRef.current === 0) {
        handleCreateInquiry(values, setSubmitting);
      } else {
        handleUpdateInquiry(values, setSubmitting);
      }
    },
  });

  useEffect(() => {
    fetchConsultants(formik.values.prefferedBranch);
    formik.setFieldValue("prefferedConsultant", "");
  }, [formik.values.prefferedBranch]);

  useEffect(() => {
    fetchPositions(formik.values.inquiryCategory);
  }, [formik.values.inquiryCategory]);

  const handleCategoryChange = (categoryId: string) => {
    formik.setFieldValue("inquiryCategory", categoryId);
    formik.setFieldValue("inquiryFor", "");
  };

  useEffect(() => {
    if (!formik.values.referedType) return;

    fetchExternalSources(formik.values.referedType, formik.setFieldValue);
  }, [formik.values.referedType]);

  const selectedBranchName =
    (branches as any[]).find((b) => b._id === formik.values.prefferedBranch)?.title || "our branch";

  const { err, helperText } = makeFieldHelpers(formik.errors as Record<string, any>, formik.submitCount);

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

  const isPreferenceError = !(preferences.email || preferences.sms || preferences.whatsapp);

  // ── Submission ───────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [showInquiryPopup, setShowInquiryPopup] = useState(false);
  const [generatedInqNo, setGeneratedInqNo] = useState("");
  const [assignedTAC, setAssignedTAC] = useState<string | null>(null);
  const [generatedLeadId, setGeneratedLeadId] = useState("");

  // Step 1 — create. Sends only what basic-details actually collects.
  const handleCreateInquiry = async (
    values: InquiryFormValues,
    setSubmittingFormik: (v: boolean) => void,
  ) => {
    setCreatingInquiry(true);
    setSubmitting(true);
    try {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: String(values.phoneNumber),
        whatsappNumber: String(values.whatsappNumber),
        inquiryCategory: values.inquiryCategory,
        inquiryFor: values.inquiryFor,
        // passportNo: userData?.passportStatus === "having" ? userData?.passportNo : "",
      };

      const response = await createInquiryAction(payload);

      if (response?.data?.success) {
        toast.success(response?.data?.message);

        const newId = response?.data?.data?._id;
        setInquiryId(newId);
        setGeneratedInqNo(response?.data?.data?.inqNo || "");

        dispatch(updateUserData({ leadId: newId }));

        setFormStep(1);
      }
    } catch (err: any) {
      // toast.error(err?.response?.data?.message || "Could not create inquiry. Please try again.");
      console.error("Inquiry create error:", err);
    } finally {
      setCreatingInquiry(false);
      setSubmitting(false);
      setSubmittingFormik(false);
    }
  };

  // Step 2 — update. Runs against the record created in step 1.
  const handleUpdateInquiry = async (
    values: InquiryFormValues,
    setSubmittingFormik: (v: boolean) => void,
  ) => {
    if (isPreferenceError) {
      setSubmittingFormik(false);
      return;
    }

    setUpdatingInquiry(true);
    setSubmitting(true);
    try {
      const payload = {
        nationality: values?.nationality,
        latestAcademic: values?.latestAcademic,
        latestTechnical: values?.latestTechnical,
        workExperience: values?.workExperience,
        referedFrom: values.referedFrom,
        referedType: values.referedFrom === "reffer" ? values.referedType : null,
        referedBy: values.referedFrom === "reffer" ? values.referedBy : null,
        otherReferedBy:
          values.referedFrom === "reffer" && values.referedType === "other" ? values.otherReferedBy : null,
        // prefferedConsultant: values.prefferedConsultant === "" ? null : values.prefferedConsultant,
        // visitOption: Number(values.visitOption),
      };

      const response = await updateInquiryAction(inquiryId, payload);

      if (response?.data?.success) {
        toast.success(response?.data?.message);
        setGeneratedInqNo(response?.data?.data?.inqNo || generatedInqNo);
        setGeneratedLeadId(inquiryId);
        setShowInquiryPopup(true);
        setAssignedTAC(response?.data?.data?.preferences?.consultantId ?? null);

        dispatch(
          updateUserData({
            leadId: inquiryId,
            // visitOption: Number(values.visitOption),
            prefferedConsultant: response?.data?.data?.preferences?.consultantId,
          }),
        );

        const userId = userData?.id || userData?._id;
        if (userId) {
          try {
            const res = await profileUpdateApi({ notificationPreference: preferences });
            if (res.data?.success) {
              dispatch(updateUserData({ notificationPreference: res.data.data.notificationPreference }));
            }
          } catch (err) {
            console.error("Profile preference sync failed:", err);
          }
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not update inquiry. Please try again.");
      console.error("Inquiry update error:", err);
    } finally {
      setUpdatingInquiry(false);
      setSubmitting(false);
      setSubmittingFormik(false);
    }
  };

  // Exposed to the component so its submit button (type="submit") can stay
  // wired to plain form submission — both just trigger formik, which routes
  // to create or update via formStepRef inside onSubmit above.
  const handleCreateStep = () => formik.handleSubmit();
  const handleUpdateStep = () => formik.handleSubmit();
  const goBackToStep1 = () => setFormStep(0);

  // With the two-step flow, an existing leadId now means "resume at step 2,"
  // not "form is done" (see the resume effect above), so this can no longer
  // be derived from hasExistingData the way it used to be. If you want the
  // old "already submitted, go to pre-counselling" banner back for people
  // who fully completed both steps, gate it on a real completed/status
  // field from userData, e.g. `userData?.inquiryStatus === "completed"`.
  const isFormDisabled = false;

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
    getInitialValues,
    assignedTAC,
    formik,
    isFormDisabled,
    err,
    helperText,
    activeStepperStep,
    handleClosePopup,
    selectedBranchName,
    categories,
    handleCategoryChange,
    positionData,
    // two-step flow
    formStep,
    inquiryId,
    creatingInquiry,
    updatingInquiry,
    handleCreateStep,
    handleUpdateStep,
    goBackToStep1,
    handlePreferenceToggle
  };
}