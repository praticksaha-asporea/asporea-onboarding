"use client";

// React Imports
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/Redux/store";
import {
  getTacListAction,
  getExternalSourcesAction,
  createInquiryAction,
} from "@/Services/APIs/Inquiry/inquiry.action";
import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { updateUserData } from "@/Redux/Auth/user.slice";
import toast from "react-hot-toast";

import { useFormik } from "formik";
import * as Yup from "yup";

import { Dialog, DialogContent, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {
  Box,
  capitalize,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Step,
  StepContent,
  StepLabel,
  Stepper,
} from "@mui/material";

const temporaryBranches = [
  { _id: "6a0854518d4641cbe8d9c064", title: "Siliguri" },
  { _id: "6a0854518d4641cbe8d9c065", title: "Kalimpong" },
  { _id: "6a0854518d4641cbe8d9c066", title: "Dehradun" },
  { _id: "6a0854518d4641cbe8d9c067", title: "Guwahati" },
  { _id: "6a0854518d4641cbe8d9c068", title: "Shillong" },
];

type StateType = {
  [key: string]: boolean;
};

const inquiryValidationSchema = Yup.object({
  fullName: Yup.string().trim().required("Full Name is required"),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Please Provide valid 10-digit phone number")
    .required("Phone Number required"),
  whatsappNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Please Provide valid 10-digit WhatsApp number")
    .required("WhatsApp Number required"),
  prefferedBranch: Yup.string().required("Please select a preferred branch"),
  prefferedConsultant: Yup.string().required("Please select a consultant"),
  visitOption: Yup.number().required("Visit option is required"),
  fullAddress: Yup.string().trim().required("Full Address is required"),

  referedFrom: Yup.string().required("Please select how you heard about us"),

  referedType: Yup.string().when("referedFrom", {
    is: "reffer",
    then: (schema) => schema.required("Please select referral type"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  referedBy: Yup.string().when("referedFrom", {
    is: "reffer",
    then: (schema) => schema.required("Please select who referred you"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  otherReferedBy: Yup.string().when(["referedFrom", "referedType"], {
    is: (from: string, type: string) => from === "reffer" && type === "other",
    then: (schema) => schema.required("Please specify the details"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
});

const AccountDetails = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state: RootState) => (state as any).user);
  const [showInquiryPopup, setShowInquiryPopup] = useState(false);
  const [generatedInqNo, setGeneratedInqNo] = useState("");
  const [consultants, setConsultants] = useState<any[]>([]);
  const [externalSources, setExternalSources] = useState<any[]>([]);
  const [loadingConsultants, setLoadingConsultants] = useState(false);
  const [loadingSources, setLoadingSources] = useState(false);
  const [preferences, setPreferences] = useState({
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

  const handlePreferenceToggle = (type: "email" | "sms" | "whatsapp") => {
    setPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      whatsappNumber: "",
      prefferedBranch: "",
      prefferedConsultant: "",
      visitOption: 0,
      fullAddress: "",
      referedFrom: "web-app",
      referedType: "",
      referedBy: "",
      otherReferedBy: "",
    },
    validationSchema: inquiryValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const atLeastOneSelected =
        preferences.email || preferences.sms || preferences.whatsapp;
      if (!atLeastOneSelected) {
        setSubmitting(false);
        return;
      }
      try {
        const payload = {
          ...values,
          phoneNumber: String(values.phoneNumber),
          whatsappNumber: String(values.whatsappNumber),
          visitOption: Number(values.visitOption),
          referedBy: values.referedFrom === "reffer" ? values.referedBy : null,
          referedType:
            values.referedFrom === "reffer" ? values.referedType : null,
        };

        const response = await createInquiryAction(payload);
        if (response.success) {
          toast.success(response.message);
          setGeneratedInqNo(response.data.inqNo);
          setShowInquiryPopup(true);

          const userId = userData?.id || userData?._id;
          if (userId) {
            try {
              const profilePayload = {
                id: userId,
                notificationPreference: preferences,
              };
              const res = await axiosClient.patch(
                "/user/profile-update",
                profilePayload,
              );
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
        console.error("Submission failed");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (userData) {
      formik.setValues({
        ...formik.values,
        fullName:
          `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        whatsappNumber: userData.whatsappNumber || "",
        fullAddress: userData.address || "",
      });
    }
  }, [userData]);

  useEffect(() => {
    if (!formik.values.prefferedBranch) {
      setConsultants([]);
      return;
    }

    const fetchConsultants = async () => {
      setLoadingConsultants(true);
      try {
        const response = await getTacListAction(formik.values.prefferedBranch);
        if (response.success) {
          setConsultants(response.data);
          if (response.data.length > 0) {
            formik.setFieldValue("prefferedConsultant", response.data[0]._id);
          } else {
            formik.setFieldValue("prefferedConsultant", "");
          }
        }
      } catch (err) {
        console.error("TAC action error:", err);
      } finally {
        setLoadingConsultants(false);
      }
    };

    fetchConsultants();
  }, [formik.values.prefferedBranch]);

  useEffect(() => {
    if (!formik.values.referedType) {
      setExternalSources([]);
      return;
    }

    if (formik.values.referedType === "other") {
      setExternalSources([]);
      formik.setFieldValue("referedBy", "other");
      return;
    }

    const fetchSources = async () => {
      setLoadingSources(true);
      try {
        const response = await getExternalSourcesAction(
          formik.values.referedType,
        );
        if (response.success) {
          setExternalSources(response.data);
          if (response.data.length > 0) {
            formik.setFieldValue("referedBy", response.data[0]._id);
          } else {
            formik.setFieldValue("referedBy", "");
          }
        }
      } catch (err) {
        console.error("External sources action error:", err);
      } finally {
        setLoadingSources(false);
      }
    };

    fetchSources();
  }, [formik.values.referedType]);

  const [activeStep] = useState(0);
  const [state, setState] = useState<StateType>({
    gilad: true,
    jason: false,
    antoine: false,
  });

  const { gilad, jason, antoine } = state;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const steps = [
    { step: 1, label: "Inquiry", description: "", status: "completed" },
    {
      step: 2,
      label: "Pre-Counselling",
      description: "Start now",
      status: "pending",
    },
    {
      step: 3,
      label: "Documents",
      description: "Start now",
      status: "pending",
    },
    {
      step: 4,
      label: "Experience Selection",
      description: "Start now",
      status: "pending",
    },
    {
      step: 5,
      label: "Assessment Status",
      description: "Start now",
      status: "pending",
    },
    {
      step: 6,
      label: "Technical Round",
      description: "Start now",
      status: "pending",
    },
  ];
  const isPreferenceError = !(
    preferences.email ||
    preferences.sms ||
    preferences.whatsapp
  );

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h4">Generate Inquiry</Typography>
              <Typography variant="subtitle1" className="pb-5">
                Please fill out the form below to register an inquiry
              </Typography>

              <form onSubmit={formik.handleSubmit}>
                <Card>
                  <CardContent className="mbe-5">
                    <Grid container spacing={5}>
                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <TextField
                          fullWidth
                          name="fullName"
                          label="Full Name"
                          value={formik.values.fullName}
                          placeholder="Kunal Chettri"
                          onChange={formik.handleChange}
                          error={
                            formik.submitCount > 0 &&
                            Boolean(formik.errors.fullName)
                          }
                          helperText={
                            formik.submitCount > 0 && formik.errors.fullName
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <TextField
                          fullWidth
                          name="email"
                          label="Email Address"
                          value={formik.values.email}
                          placeholder="kunal.chettri@gmail.com"
                          onChange={formik.handleChange}
                          error={
                            formik.submitCount > 0 &&
                            Boolean(formik.errors.email)
                          }
                          helperText={
                            formik.submitCount > 0 && formik.errors.email
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <TextField
                          fullWidth
                          type="tel"
                          name="phoneNumber"
                          label="Phone Number"
                          value={formik.values.phoneNumber}
                          placeholder="9876543210"
                          onChange={formik.handleChange}
                          error={
                            formik.submitCount > 0 &&
                            Boolean(formik.errors.phoneNumber)
                          }
                          helperText={
                            formik.submitCount > 0 && formik.errors.phoneNumber
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <TextField
                          fullWidth
                          type="tel"
                          name="whatsappNumber"
                          label="Whatsapp Number"
                          value={formik.values.whatsappNumber}
                          placeholder="9876543210"
                          onChange={formik.handleChange}
                          error={
                            formik.submitCount > 0 &&
                            Boolean(formik.errors.whatsappNumber)
                          }
                          helperText={
                            formik.submitCount > 0 &&
                            formik.errors.whatsappNumber
                          }
                        />
                      </Grid>

                      {/* Dropdown Branch */}
                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <FormControl
                          fullWidth
                          error={
                            formik.submitCount > 0 &&
                            Boolean(formik.errors.prefferedBranch)
                          }
                        >
                          <InputLabel>Preffered Branch</InputLabel>
                          <Select
                            name="prefferedBranch"
                            label="Preffered Branch"
                            value={formik.values.prefferedBranch}
                            onChange={formik.handleChange}
                          >
                            {temporaryBranches.map((branch) => (
                              <MenuItem key={branch._id} value={branch._id}>
                                {branch.title}
                              </MenuItem>
                            ))}
                          </Select>
                          {formik.submitCount > 0 &&
                            formik.errors.prefferedBranch && (
                              <FormHelperText>
                                {formik.errors.prefferedBranch}
                              </FormHelperText>
                            )}
                        </FormControl>
                      </Grid>

                      {/* Dropdown Consultant */}
                      <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                        <FormControl
                          fullWidth
                          disabled={
                            loadingConsultants || !formik.values.prefferedBranch
                          }
                          error={
                            formik.submitCount > 0 &&
                            Boolean(formik.errors.prefferedConsultant)
                          }
                        >
                          <InputLabel>
                            {loadingConsultants
                              ? "Loading..."
                              : "Preffered Consultant"}
                          </InputLabel>
                          <Select
                            name="prefferedConsultant"
                            label="Preffered Consultant"
                            value={formik.values.prefferedConsultant}
                            onChange={formik.handleChange}
                          >
                            {consultants.length === 0 ? (
                              <MenuItem value="" disabled>
                                No TAC found
                              </MenuItem>
                            ) : (
                              consultants.map((tac) => (
                                <MenuItem key={tac._id} value={tac._id}>
                                  {`${tac.firstName} ${tac.lastName}`}
                                </MenuItem>
                              ))
                            )}
                          </Select>
                          {formik.submitCount > 0 &&
                            formik.errors.prefferedConsultant && (
                              <FormHelperText>
                                {formik.errors.prefferedConsultant}
                              </FormHelperText>
                            )}
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 12, md: 12, sm: 12 }}>
                        <FormControl
                          fullWidth
                          error={
                            formik.submitCount > 0 &&
                            Boolean(formik.errors.visitOption)
                          }
                        >
                          <RadioGroup
                            name="visitOption"
                            aria-label="Visit Option"
                            value={Number(formik.values.visitOption)}
                            onChange={(e) =>
                              formik.setFieldValue(
                                "visitOption",
                                Number(e.target.value),
                              )
                            }
                          >
                            <FormControlLabel
                              value={0}
                              control={<Radio />}
                              label="Are you currently now in this branch? (Only use while you are in branch premises)"
                            />
                            <FormControlLabel
                              value={1}
                              control={<Radio />}
                              label="Are you visiting this branch? (Only use while you are outside and willing to visit in-person)"
                            />
                            <FormControlLabel
                              value={2}
                              control={<Radio />}
                              label="Want to visit online rather than in-person branch visit"
                            />
                          </RadioGroup>
                          <FormHelperText className="py-2">
                            NOTE: Online Schedule you can choose from next
                            screen, If you have preferred consultant.
                          </FormHelperText>
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 12, md: 12, sm: 12 }}>
                        <TextField
                          fullWidth
                          name="fullAddress"
                          label="Full Address"
                          value={formik.values.fullAddress}
                          placeholder={`123 Talent Lane,Darjeeling,\nWest Bengal,\n700001`}
                          multiline
                          rows={3}
                          onChange={formik.handleChange}
                          error={
                            formik.submitCount > 0 &&
                            Boolean(formik.errors.fullAddress)
                          }
                          helperText={
                            formik.submitCount > 0 && formik.errors.fullAddress
                          }
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card className="mt-5">
                  <CardContent className="mbe-5">
                    <Grid container spacing={5}>
                      {/* 1. Main Radio Buttons */}
                      <Grid size={{ xs: 12, md: 12, sm: 12 }}>
                        <FormControl
                          fullWidth
                          error={
                            formik.submitCount > 0 &&
                            Boolean(formik.errors.referedFrom)
                          }
                        >
                          <FormLabel component="legend">
                            How did you hear about us?
                          </FormLabel>
                          <RadioGroup
                            row
                            name="referedFrom"
                            value={formik.values.referedFrom}
                            onChange={(e) => {
                              formik.handleChange(e);

                              if (e.target.value !== "reffer") {
                                formik.setFieldValue("referedType", "");
                                formik.setFieldValue("referedBy", "");
                                formik.setFieldValue("otherReferedBy", "");
                              }
                            }}
                          >
                            <FormControlLabel
                              value="web-app"
                              control={<Radio />}
                              label="Asporea Website/App"
                            />
                            <FormControlLabel
                              value="call"
                              control={<Radio />}
                              label="Tele Caller"
                            />
                            <FormControlLabel
                              value="social"
                              control={<Radio />}
                              label="Social Media"
                            />
                            <FormControlLabel
                              value="reffer"
                              control={<Radio />}
                              label="Referral"
                            />
                          </RadioGroup>
                          {formik.submitCount > 0 &&
                            formik.errors.referedFrom && (
                              <FormHelperText>
                                {formik.errors.referedFrom}
                              </FormHelperText>
                            )}
                        </FormControl>
                      </Grid>

                      {formik.values.referedFrom === "reffer" && (
                        <>
                          <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                            <FormControl
                              fullWidth
                              error={
                                formik.submitCount > 0 &&
                                Boolean(formik.errors.referedType)
                              }
                            >
                              <FormLabel component="legend">
                                Reffered By
                              </FormLabel>
                              <RadioGroup
                                row
                                name="referedType"
                                value={formik.values.referedType || ""}
                                onChange={formik.handleChange}
                              >
                                <FormControlLabel
                                  value="pca"
                                  control={<Radio />}
                                  label="PCA"
                                />
                                <FormControlLabel
                                  value="pcra"
                                  control={<Radio />}
                                  label="PCRA"
                                />
                                <FormControlLabel
                                  value="institution"
                                  control={<Radio />}
                                  label="Institution"
                                />
                                <FormControlLabel
                                  value="other"
                                  control={<Radio />}
                                  label="Other"
                                />
                              </RadioGroup>
                              {formik.submitCount > 0 &&
                                formik.errors.referedType && (
                                  <FormHelperText>
                                    {formik.errors.referedType}
                                  </FormHelperText>
                                )}
                            </FormControl>
                          </Grid>

                          <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                            <FormControl
                              fullWidth
                              disabled={
                                loadingSources ||
                                formik.values.referedType === "other"
                              }
                              error={
                                formik.submitCount > 0 &&
                                Boolean(formik.errors.referedBy)
                              }
                            >
                              <InputLabel>
                                {loadingSources
                                  ? "Loading..."
                                  : `Name of ${capitalize(formik.values.referedType || "Referrer")}`}
                              </InputLabel>
                              <Select
                                name="referedBy"
                                label={`Name of ${capitalize(formik.values.referedType || "Referrer")}`}
                                value={formik.values.referedBy}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  formik.handleChange(e);
                                  // 👇 AUTO SELECT 'Other' LOGIC
                                  if (val === "other") {
                                    formik.setFieldValue(
                                      "referedType",
                                      "other",
                                    );
                                  }
                                }}
                              >
                                {/* Fallback Option */}
                                {externalSources.length === 0 ? (
                                  <MenuItem value="other">
                                    Provide details in 'Please specify'
                                  </MenuItem>
                                ) : (
                                  externalSources.map((src) => (
                                    <MenuItem key={src._id} value={src._id}>
                                      {`${src.firstName} ${src.lastName || ""}`}
                                    </MenuItem>
                                  ))
                                )}
                              </Select>
                              {formik.submitCount > 0 &&
                                formik.errors.referedBy && (
                                  <FormHelperText>
                                    {formik.errors.referedBy}
                                  </FormHelperText>
                                )}
                            </FormControl>
                          </Grid>

                          {/* 🔥 HIDE/SHOW 'Please specify' Box */}
                          {formik.values.referedType === "other" && (
                            <Grid size={{ xs: 12, md: 12, sm: 12 }}>
                              <TextField
                                fullWidth
                                name="otherReferedBy"
                                label="Please specify referer name"
                                value={formik.values.otherReferedBy || ""}
                                placeholder="Eg: John Singh"
                                onChange={formik.handleChange}
                                error={
                                  formik.submitCount > 0 &&
                                  Boolean(formik.errors.otherReferedBy)
                                }
                                helperText={
                                  formik.submitCount > 0 &&
                                  formik.errors.otherReferedBy
                                }
                              />
                            </Grid>
                          )}
                        </>
                      )}
                      {/* MAGIC END */}
                    </Grid>
                  </CardContent>

                  <CardContent className="mbe-5">
                    <Grid container spacing={5}>
                      <Grid
                        size={{ xs: 12, md: 12, sm: 12 }}
                        className="flex gap-4 flex-wrap justify-end"
                      >
                        <Button
                          variant="contained"
                          type="submit"
                          disabled={formik.isSubmitting}
                          className="rounded-xl normal-case text-sm shadow-md hover:bg-blue-700 hover:shadow-lg"
                        >
                          {formik.isSubmitting ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            "Submit"
                          )}
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Stepper Column */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 12, sm: 12 }}>
              <Card className="hidden md:block">
                <CardContent>
                  <Typography variant="h4" className="mb-5">
                    Application Progress
                  </Typography>
                  <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((step, index) => (
                      <Step key={step.label}>
                        <StepLabel
                          optional={
                            index !== 0 ? (
                              <Typography variant="caption">Pending</Typography>
                            ) : null
                          }
                        >
                          {step.label}
                        </StepLabel>
                        <StepContent>
                          <Typography>{step.description}</Typography>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 12, sm: 12 }}></Grid>
            <Grid size={{ xs: 12, md: 12, sm: 12 }}>
              <Card>
                <CardContent>
                  <FormControl
                    className="mbs-4 mie-4"
                    error={formik.submitCount > 0 && isPreferenceError}
                  >
                    <Typography variant="h5" className="pb-5">
                      Contact Preferences
                    </Typography>
                    <FormGroup>
                      <FormControlLabel
                        label="Receive updates via Email"
                        control={
                          <Checkbox
                            checked={preferences.email}
                            onChange={() => handlePreferenceToggle("email")}
                            name="email"
                          />
                        }
                      />
                      <FormControlLabel
                        label="Receive updates via WhatsApp"
                        control={
                          <Checkbox
                            checked={preferences.whatsapp}
                            onChange={() => handlePreferenceToggle("whatsapp")}
                            name="whatsapp"
                          />
                        }
                      />
                      <FormControlLabel
                        label="Receive updates via SMS"
                        control={
                          <Checkbox
                            checked={preferences.sms}
                            onChange={() => handlePreferenceToggle("sms")}
                            name="sms"
                          />
                        }
                      />
                    </FormGroup>

                    <FormHelperText
                      className="pt-3"
                      error={formik.submitCount > 0 && isPreferenceError}
                    >
                      {isPreferenceError
                        ? formik.submitCount > 0
                          ? "At least choose one preference to proceed"
                          : "At least One"
                        : null}
                    </FormHelperText>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Dialog Popup */}
      <Dialog
        open={showInquiryPopup}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            setShowInquiryPopup(false);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent className="text-center p-8">
          <Typography variant="h4" className="mt-4">
            Inquiry Submitted
          </Typography>
          <Typography variant="h6" className="mt-2 mb-8" color="primary">
            ID: {generatedInqNo}
          </Typography>
          <Box className="mb-8">
            <Typography variant="body1" className="mt-2 mb-4 px-8">
              You are assigned to a Talent Acquisition Consultant (TAC). <br />{" "}
              Be ready for Pre-Counselling.
            </Typography>
            <Button
              variant="contained"
              className="normal-case rounded-[50px] py-[9.6px]"
              href="/pre-counselling"
            >
              Schedule Pre-Counselling
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountDetails;
