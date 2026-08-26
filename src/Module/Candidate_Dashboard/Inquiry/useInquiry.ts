"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/Redux/store";
import { updateUserData } from "@/Redux/Auth/user.slice";
import {
  getExternalSourcesAction,
  createInquiryAction,
  updateInquiryAction,
  userDetailsAction,
  getInquiryDetailsAction,
} from "@/Services/APIs/Inquiry/inquiry.action";
import toast from "react-hot-toast";
import * as Yup from "yup";
import {
  InquiryFormValues,
  Step2InquiryUpdatePayload,
} from "@/Types/Frontend_Payload/lead.types";
import { getJourneyTimelineAction } from "@/Services/APIs/Assessment/assessment.actions";
import { NotificationPreferences } from "@/Types/Frontend_Payload/precounselling.types";
import {
  getCountriesAction,
  getPathwayPositionsAction,
  getPathwayTopLevelAction,
} from "@/Services/APIs/Pathway/pathway.action";
import { externalSourceObj, positionDBData } from "@/Types/object.types";
import { IPathway } from "@/lib/models/Pathway.model";
import { ICountry } from "@/lib/models/Country.model";
import { useRouter } from "next/navigation";

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

export type CategoryOption =
  | { kind: "header"; key: string; label: string; level: number }
  | { kind: "item"; key: string; value: string; label: string; level: number };

export function buildCategoryOptions(
  categories: IPathway[],
  countries: ICountry[],
): CategoryOption[] {
  const activeCategories = (categories || []).filter((c) => c.isActive);
  const roots = activeCategories.filter(
    (c) => !c.underPathway || String(c.underPathway) === "",
  );
  const getChildren = (parentId: string) =>
    activeCategories.filter((c) => String(c.underPathway) === parentId);

  const renderNode = (parent: IPathway, level = 0): CategoryOption[] => {
    const parentIdStr = String(parent._id);
    const children = getChildren(parentIdStr);

    if (children.length === 0) {
      return [
        {
          kind: "item",
          key: parentIdStr,
          value: parentIdStr,
          label: parent.title,
          level,
        },
      ];
    }

    const items: CategoryOption[] = [
      {
        kind: "header",
        key: `header-${parentIdStr}`,
        label: parent.title,
        level,
      },
    ];
    children.forEach((child) => {
      items.push(...renderNode(child, level + 1));
    });
    return items;
  };

  return roots.flatMap((root) => renderNode(root));
}

export function useInquiry() {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user.userData);

  const router = useRouter();
  const checkedLeadIdRef = useRef<string | null>(null);

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

  const [corordinates, setCorordinates] = useState<string[]>([]);
  const [locationPermissionRequired, setLocationPermissionRequired] =
    useState<boolean>(false);

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
          setCorordinates([`${coords.latitude}`, `${coords.longitude}`]);
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
        },
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
        const status = await navigator.permissions.query({
          name: "geolocation",
        });
        if (cancelled) return;

        permissionStatusRef.current = status;

        status.onchange = () => {
          if (status.state === "granted") {
            window.location.reload();
          } else if (status.state === "denied") {
            setLocationPermissionRequired(true);
          }
        };

        if (status.state === "denied") {
          setLocationPermissionRequired(true);
          return;
        }

        getLocation();
      } catch (error) {
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

  const [activeStepperStep, setActiveStepperStep] = useState<number>(0);
  const [categories, setCategories] = useState<IPathway[]>([]);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [positionData, setPositionData] = useState<positionDBData[] | null>(
    null,
  );

  const [formStep, setFormStep] = useState<0 | 1>(0);
  const [inquiryId, setInquiryId] = useState<string>("");
  const [creatingInquiry, setCreatingInquiry] = useState(false);
  const [updatingInquiry, setUpdatingInquiry] = useState(false);

  const formStepRef = useRef<0 | 1>(0);
  useEffect(() => {
    formStepRef.current = formStep;
  }, [formStep]);
 
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

  const fetchCategories = async () => {
    try {
      const response = await getPathwayTopLevelAction();
      if (response?.data?.success) setCategories(response?.data?.data);
    } catch (err) {
      console.error("Category fetch error:", err);
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
  try {
    const response = await getPathwayPositionsAction({
      pathwayId: categoryId,
    });
    
    
    const rawData = response?.data?.data;
    if (Array.isArray(rawData)) {
      setPositionData(rawData);
    } else if (rawData && Array.isArray((rawData as any).data)) {
      setPositionData((rawData as any).data);
    } else {
      setPositionData([]);
    }
  } catch (err) {
    console.error("Position fetch error:", err);
    setPositionData([]);
  }
};

  const isCountryValue = (id: string) =>
    (countries || []).some((c) => String(c._id || c.code) === id);

  const categoryOptions = useMemo(
    () => buildCategoryOptions(categories, countries),
    [categories, countries],
  );

   
  useEffect(() => {
    const fetchRealProgress = async () => {
      const existingLeadId =
        userData?.leadId || userData?.candidateProfile?.leadId;

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
  }, [userData?.leadId, userData?.candidateProfile?.leadId]);

  useEffect(() => {
    const existingLeadId =
      userData?.leadId || userData?.candidateProfile?.leadId;

    if (!existingLeadId || checkedLeadIdRef.current === existingLeadId) {
      return;
    }

    const reverseTypeMap: Record<string, string> = {
      web_app: "web-app",
      telecall: "call",
      social: "social",
      refer: "reffer",
    };

    const reverseRefTypeMap: Record<string, string> = {
      institute: "institution",
      pca: "pca",
      pcra: "pcra",
      other: "other",
    };

    const fetchExistingLeadData = async () => {
      checkedLeadIdRef.current = existingLeadId;

      try {
        const res = await getInquiryDetailsAction(existingLeadId);

        if (res && res.data?.success && res.data?.data) {
          const lead = res.data.data;
          setInquiryId(existingLeadId);
          setFormStep(1);

          const dbSourceType = lead.source?.type;
          const uiReferedFrom = dbSourceType
            ? reverseTypeMap[dbSourceType] || "web-app"
            : "web-app";

          const dbRefType = lead.source?.refType;
          const uiReferedType = dbRefType
            ? reverseRefTypeMap[dbRefType] || dbRefType
            : "";

          const dbRefName = lead.source?.refName;
          const isOtherReferral = uiReferedType === "other";

          if (uiReferedType && uiReferedType !== "other") {
            await fetchExternalSources(uiReferedType, formik.setFieldValue);
          }

          formik.setValues((prev) => ({
            ...prev,
            fullName: lead.fullName || prev.fullName,
            email: lead.contact?.email || prev.email,
            phoneNumber: lead.contact?.phone
              ? String(lead.contact.phone)
              : prev.phoneNumber,
            whatsappNumber: lead.contact?.whatsapp
              ? String(lead.contact.whatsapp)
              : prev.whatsappNumber,
            inquiryCategory: lead.inqForType || prev.inquiryCategory,
            inquiryFor: lead.inqForPosition || prev.inquiryFor,
            referedFrom: uiReferedFrom,
            referedType: uiReferedType,
            referedBy: !isOtherReferral ? dbRefName || "" : "other",
            otherReferedBy: isOtherReferral ? dbRefName || "" : "",
          }));
        } else {
          setInquiryId("");
          setFormStep(0);

          dispatch(
            updateUserData({
              leadId: undefined,
              candidateProfile: {
                ...userData?.candidateProfile,
                leadId: undefined,
              },
            }),
          );

          formik.setFieldValue("inquiryCategory", "");
          formik.setFieldValue("inquiryFor", "");
        }
      } catch (error) {
        console.error("Lead fetch error:", error);
        setInquiryId("");
        setFormStep(0);
        formik.setFieldValue("inquiryCategory", "");
        formik.setFieldValue("inquiryFor", "");
      }
    };

    fetchExistingLeadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.leadId, userData?.candidateProfile?.leadId]);

  const handleClosePopup = () => {
    setShowInquiryPopup(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push("/pre-counselling");
  };

  const formik = useFormik({
    initialValues: getInitialValues(),
    enableReinitialize: true,
    validate: (values) => {
      const schema =
        formStepRef.current === 0
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
    onSubmit: (values, { setSubmitting }) => {
      if (formStepRef.current === 0) {
        handleCreateInquiry(values, setSubmitting);
      } else {
        handleUpdateInquiry(values, setSubmitting);
      }
    },
  });

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

  const { err, helperText } = makeFieldHelpers(
    formik.errors as Record<string, string | undefined>,
    formik.submitCount,
  );

  const [externalSources, setExternalSources] = useState<externalSourceObj[]>(
    [],
  );
  const [loadingSources, setLoadingSources] = useState(false);

  const fetchExternalSources = async (
    referedType: string,
    setFieldValue: (field: string, value: string) => void,
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
      }
    } catch (err) {
      console.error("External sources fetch error:", err);
    } finally {
      setLoadingSources(false);
    }
  };

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

  const [submitting, setSubmitting] = useState(false);
  const [showInquiryPopup, setShowInquiryPopup] = useState(false);
  const [generatedInqNo, setGeneratedInqNo] = useState("");

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
        latitude: corordinates?.[0],
        longitude: corordinates?.[1],
      };

      const response = await createInquiryAction(payload);

      if (response?.data?.success) {
        toast.success(response?.data?.message);

        const newId = response?.data?.data?._id;
        setInquiryId(newId);
        checkedLeadIdRef.current = newId;
        setGeneratedInqNo(response?.data?.data?.inqNo || "");

        dispatch(updateUserData({ leadId: newId }));
        setFormStep(1);
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
    if (isPreferenceError) {
      setSubmittingFormik(false);
      return;
    }

    setUpdatingInquiry(true);
    setSubmitting(true);
    try {
      const payload: Step2InquiryUpdatePayload = {
        id: inquiryId,
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

      const response = await updateInquiryAction(inquiryId, payload);

      if (response?.data?.success) {
        toast.success(response?.data?.message);
        setGeneratedInqNo(response?.data?.data?.inqNo || generatedInqNo);
        setShowInquiryPopup(true);

        const updatedProfile = {
          ...userData?.candidateProfile,
          leadId: inquiryId || userData?.candidateProfile?.leadId,
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
  const goBackToStep1 = () => setFormStep(0);

  const isFormDisabled = false;

  return {
    externalSources,
    preferences,
    isPreferenceError,
    submitting,
    showInquiryPopup,
    setShowInquiryPopup,
    generatedInqNo,
    loadingSources,
    userData,
    formik,
    isFormDisabled,
    err,
    helperText,
    activeStepperStep,
    handleClosePopup,
    categoryOptions,
    handleCategoryChange,
    positionData,
    handlePreferenceToggle,
    formStep,
    inquiryId,
    creatingInquiry,
    updatingInquiry,
    handleCreateStep,
    handleUpdateStep,
    goBackToStep1,
    locationPermissionRequired,
    getLocation,
  };
}
