"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/Redux/store";
import { updateUserData } from "@/Redux/Auth/user.slice";
import {
  getTacListAction,
  getExternalSourcesAction,
  createInquiryAction,
  updateInquiryAction,
  userDetailsAction,
} from "@/Services/APIs/Inquiry/inquiry.action";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { InquiryFormValues } from "@/Types/Frontend_Payload/lead.types";
import { branchListingApi } from "@/Services/APIs/branch/branch.actions";
import { getJourneyTimelineAction } from "@/Services/APIs/Assessment/assessment.actions";
import { NotificationPreferences } from "@/Types/Frontend_Payload/precounselling.types";
import { profileUpdateApi } from "@/Services/APIs/auth/auth.actions";
import {
  getCountriesAction,
  getPathwayPositionsAction,
  getPathwayTopLevelAction,
} from "@/Services/APIs/Pathway/pathway.action";
import { IPosition } from "@/lib/models/Position.model";
import { positionDBData } from "@/Types/object.types";

export const stepOneValidationSchema = Yup.object({
  fullName: Yup.string().trim().required("Full Name is required"),
  email: Yup.string().email("Enter a valid email address").required("Email is required"),
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

// Combined schema kept for anything external that still imports the old name.
// Not used internally — internal validation runs per-step, see `validate`
// inside useFormik below.
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

// ─── Category tree + country wildcard ─────────────────────────────────────
// Any pathway category whose title contains "countr" (case-insensitive —
// matches "Country", "Countries", "Study by Country", etc.) has its children
// replaced with the live countries list instead of its actual sub-pathways.
const COUNTRY_CATEGORY_MATCH = /countr/i;

export function isCountryCategory(title?: string) {
  return COUNTRY_CATEGORY_MATCH.test(title || "");
}

export type CategoryOption =
  | { kind: "header"; key: string; label: string; level: number }
  | { kind: "item"; key: string; value: string; label: string; level: number };

/**
 * Flattens the category tree (with the country wildcard applied) into a
 * list the component can map straight onto <ListSubheader>/<MenuItem>,
 * so the tree-building logic doesn't have to live inline in JSX.
 */
export function buildCategoryOptions(categories: any[], countries: any[]): CategoryOption[] {
  const activeCategories = (categories || []).filter((c: any) => c.isActive);
  const roots = activeCategories.filter((c: any) => !c.underPathway || c.underPathway === "");
  const getChildren = (parentId: string) =>
    activeCategories.filter((c: any) => c.underPathway === parentId);

  const renderNode = (parent: any, level = 0): CategoryOption[] => {
    // if (isCountryCategory(parent.title)) {
    //   const header: CategoryOption = {
    //     kind: "header",
    //     key: `header-${parent._id}`,
    //     label: parent.title,
    //     level,
    //   };

    //   const countryItems: CategoryOption[] = (countries || []).map((country: any) => ({
    //     kind: "item",
    //     key: String(country._id || country.code),
    //     value: String(country._id || country.code),
    //     label: country.name || country.title,
    //     level: level + 1,
    //   }));

    //   return [header, ...countryItems];
    // }

    const children = getChildren(parent._id);

    if (children.length === 0) {
      return [{ kind: "item", key: parent._id, value: parent._id, label: parent.title, level }];
    }

    const items: CategoryOption[] = [
      { kind: "header", key: `header-${parent._id}`, label: parent.title, level },
    ];
    children.forEach((child: any) => {
      items.push(...renderNode(child, level + 1));
    });
    return items;
  };

  return roots.flatMap((root: any) => renderNode(root));
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
  const [corordinates, setCorordinates] = useState<string[]>([]);
  const [locationPermissionRequired, setLocationPermissionRequired] = useState<boolean>(false);


  const fetchBranches = async (lat: number, lng: number) => {
    try {
      const response = await branchListingApi({ lat, lng });
      setBranches(response?.data?.data?.data || []);
    } catch (error) {
      console.error("Branch fetch error:", error);
    }
  };

  const permissionStatusRef = useRef<PermissionStatus | null>(null);

  const getLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported by your browser.");
      return;
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });

      if (permission.state === "denied") {
        setLocationPermissionRequired(true);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setCorordinates([
            `${coords.latitude}`,
            `${coords.longitude}`,
          ]);

          setLocationPermissionRequired(false);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermissionRequired(true);
            return;
          }

          if (error.code === error.TIMEOUT) {
            toast.error("Location request timed out.");
            return;
          }

          toast.error("Unable to get your location.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch (error) {
      console.error("Location error:", error);
    }
  };
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!navigator.geolocation) {
        toast.error("Location is not supported by your browser.");
        return;
      }

      try {
        const status = await navigator.permissions.query({ name: "geolocation" });
        if (cancelled) return;

        permissionStatusRef.current = status;

        // This is the missing piece: the browser fires `onchange` on this
        // same PermissionStatus object the moment the person grants access —
        // whether that's via a native prompt or by flipping it on later in
        // the site-settings/padlock UI. Without this listener, nothing in
        // the app ever finds out it happened.
        status.onchange = () => {
          if (status.state === "granted") {
            // A full reload is simpler and more reliable here than trying to
            // re-fetch and re-sync state manually — this fires once, right
            // after the person grants access, so a reload doesn't lose them
            // any progress they haven't already made.
            window.location.reload();
          } else if (status.state === "denied") {
            setLocationPermissionRequired(true);
          }
        };

        if (status.state === "denied") {
          // Browsers won't show their native prompt again once a site is
          // explicitly denied, so calling getCurrentPosition here would just
          // silently fail. Show the banner and wait for onchange instead.
          setLocationPermissionRequired(true);
          return;
        }

        getLocation();
      } catch (error) {
        // Safari and a few older browsers don't support permissions.query
        // for geolocation — fall back to just asking directly, which still
        // shows the native prompt on those browsers.
        console.error("Permission query failed, falling back:", error);
        getLocation();
      }
    };

    init();

    return () => {
      cancelled = true;
      if (permissionStatusRef.current) {
        permissionStatusRef.current.onchange = null;
      }
    };
  }, []);

  const [hasExistingData, setHasExistingData] = useState(false);
  const [activeStepperStep, setActiveStepperStep] = useState<number>(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [positionData, setPositionData] = useState<positionDBData[] | null>(null);
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
    // prefferedBranch: "",
    // prefferedConsultant: "",
    // visitOption: 0,
    nationality: userData?.nationality || "",
    latestAcademic: userData?.latestAcademic || "",
    latestTechnical: userData?.latestTechnical || "",
    workExperience: userData?.workExperience || "",
    referedFrom: "web-app",
    referedType: "",
    referedBy: "",
    otherReferedBy: "",
    // passportNo: userData?.passportStatus === "having" ? userData?.passportNo : "",
    inquiryCategory: "",
    inquiryFor: "",
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

  const fetchCountries = async () => {
    try {
      const response = await getCountriesAction();
      if (response?.data?.success) setCountries(response?.data?.data);
    } catch (err) {
      console.error("Country fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCountries();
  }, []);

  const fetchPositions = async (categoryId: string) => {
    if (!categoryId) {
      setPositionData(null);
      return;
    }
    setLoadingPositions(true);
    try {
      const response = await getPathwayPositionsAction({ pathwayId: categoryId });
      // console.log(response?.data?.data, 54542);

      if (response?.data?.data) setPositionData(response?.data?.data);
    } catch (err) {
      console.error("Position fetch error:", err);
    } finally {
      setLoadingPositions(false);
    }
  };

  // A selected value that matches a country id isn't a real pathway id —
  // used below to skip the position lookup for country selections.
  const isCountryValue = (id: string) =>
    (countries || []).some((c: any) => String(c._id || c.code) === id);

  // Flattened, render-ready options for the "Inquiry For" select — the
  // country-wildcard swap happens once here instead of inline in JSX.
  const categoryOptions = useMemo(
    () => buildCategoryOptions(categories, countries),
    [categories, countries],
  );

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

  // If the person already created an inquiry (in this session or a previous one),
  // pick step 2 back up against that same record instead of redoing step 1.
  useEffect(() => {
    const existingLeadId = userData?.leadId || userData?.user?.leadId;

    if (existingLeadId) {
      setHasExistingData(true);

      if (!inquiryId) {
        setInquiryId(existingLeadId);
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

  // useEffect(() => {
  //   fetchConsultants(formik.values.prefferedBranch);
  //   formik.setFieldValue("prefferedConsultant", "");
  // }, [formik.values.prefferedBranch]);

  // Skip the position lookup entirely when the current selection is a
  // country (a leaf under a "...Country..." category) — countries aren't
  // pathway ids, so calling fetchPositions with one would just 404.
  useEffect(() => {
    if (isCountryValue(formik.values.inquiryCategory)) return;
    fetchPositions(formik.values.inquiryCategory);
  }, [formik.values.inquiryCategory, countries]);

  const handleCategoryChange = (categoryId: string) => {
    formik.setFieldValue("inquiryCategory", categoryId);
    formik.setFieldValue("inquiryFor", "");
  };

  useEffect(() => {
    if (!formik.values.referedType) return;

    fetchExternalSources(formik.values.referedType, formik.setFieldValue);
  }, [formik.values.referedType]);

  // const selectedBranchName =
  //   (branches as any[]).find((b) => b._id === formik.values.prefferedBranch)?.title || "our branch";

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
        latitude: corordinates?.[0],
        longitude: corordinates?.[1],
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
      };

      const response = await updateInquiryAction(inquiryId, payload);

      if (response?.data?.success) {
        toast.success(response?.data?.message);
        // setGeneratedInqNo(response?.data?.data?.inqNo || generatedInqNo);
        // setGeneratedLeadId(inquiryId);
        setShowInquiryPopup(true);
        // setAssignedTAC(response?.data?.data?.preferences?.consultantId ?? null);

        // dispatch(
        // updateUserData({
        // leadId: inquiryId,
        // prefferedConsultant: response?.data?.data?.preferences?.consultantId,
        // }),
        // );

        // const userId = userData?.id || userData?._id;
        // if (userId) {
        //   try {
        //     const res = await profileUpdateApi({ notificationPreference: preferences });
        //     if (res.data?.success) {
        //       dispatch(updateUserData({ notificationPreference: res.data.data.notificationPreference }));
        //     }
        //   } catch (err) {
        //     console.error("Profile preference sync failed:", err);
        //   }
        // }
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

  // With the two-step flow, an existing leadId now means "resume at step 2",
  // not "form is done" — see the resume effect above. If you need the old
  // "already submitted, go to pre-counselling" banner back for people who
  // fully completed both steps, gate it on a real completed/status field
  // from userData, e.g. `userData?.inquiryStatus === "completed"`.
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
    // selectedBranchName,
    categories,
    countries,
    categoryOptions,
    handleCategoryChange,
    positionData,
    handlePreferenceToggle,
    // two-step flow
    formStep,
    inquiryId,
    creatingInquiry,
    updatingInquiry,
    handleCreateStep,
    handleUpdateStep,
    goBackToStep1,
    locationPermissionRequired,
    getLocation
  };
}