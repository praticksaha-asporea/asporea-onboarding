"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import type { ChangeEvent } from "react";

// Actions Import
import {
  scheduleAssessmentAction,
  getTechnicalResultAction,
} from "@/Services/APIs/Assessment/assessment.actions";
import { getSlotsAction } from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";

// MUI Imports
import {
  Dialog,
  DialogContent,
  Divider,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Switch from "@mui/material/Switch";
import { FormGroup, FormHelperText } from "@mui/material";

interface Slot {
  time: string;
  from?: string;
  to?: string;
  available: boolean;
}

interface Checklist {
  documents: boolean;
  environment: boolean;
  aspirations: boolean;
  lighting: boolean;
}

interface NotificationChannels {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
  [key: string]: boolean;
}

const AssessmentContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const leadId = reduxUser?.leadId || reduxUser?.user?.leadId || "";
  const consultantId =
    reduxUser?.prefferedConsultant ||
    reduxUser?.user?.prefferedConsultant ||
    "";
  const reduxVisitOption =
    reduxUser?.visitOption ?? reduxUser?.user?.visitOption;
  const defaultMethod = reduxVisitOption === 2 ? "on" : "off";

  const viewParam = searchParams?.get("view");
  const isAssessmentResult = viewParam === "result";
  const isTechnicalResult = viewParam === "technical";
  const isBookingMode = !isAssessmentResult && !isTechnicalResult;

  const [techData, setTechData] = useState<any>(null);
  const [loadingTech, setLoadingTech] = useState(false);

  const serverNow = new Date();
  const utcTime = serverNow.getTime() + serverNow.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + 330 * 60000);
  const todayStr = istTime.toISOString().split("T")[0];

  const [date, setDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [visitMethod, setVisitMethod] = useState<"on" | "off">(defaultMethod);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [checklist, setChecklist] = useState<Checklist>({
    documents: false,
    environment: false,
    aspirations: false,
    lighting: false,
  });

  const isChecklistComplete =
    checklist.documents &&
    checklist.environment &&
    checklist.aspirations &&
    checklist.lighting;

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false);
  const [isEditingChannels, setIsEditingChannels] = useState<boolean>(false);

  const [channels, setChannels] = useState<NotificationChannels>({
    email: true,
    whatsapp: false,
    sms: false,
  });

  const statusCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && viewParam) {
      setTimeout(() => {
        statusCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 500);
    }
  }, [viewParam]);

  const handleChannelChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChannels({ ...channels, [event.target.name]: event.target.checked });
  };

  useEffect(() => {
    const fetchSlots = async () => {
      if (!consultantId || !isBookingMode) return;

      setLoadingSlots(true);
      setSelectedSlot(null);

      try {
        const res = await getSlotsAction(consultantId, date);
        if (res?.success) {
          setSlots(res.data);
        } else {
          toast.error(res?.message || "Failed to fetch slots");
          setSlots([]);
        }
      } catch (error) {
        toast.error("Error fetching slots.");
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [date, consultantId, isBookingMode]);

  useEffect(() => {
    const fetchTechData = async () => {
      if (isTechnicalResult && leadId) {
        setLoadingTech(true);

        const res = await getTechnicalResultAction(leadId);
        if (res?.success) setTechData(res.data);
        setLoadingTech(false);
      }
    };
    fetchTechData();
  }, [isTechnicalResult, leadId]);

  const calculateScorePercentage = (achieved: number, total: number) => {
    if (!total) return 0;
    return Math.round((achieved / total) * 100);
  };

  const calculateAccuracyRate = (
    achieved: number,
    total: number,
    questions: number,
    answered: number,
  ) => {
    if (!answered || !questions || !total) return 0;

    const marksPerQuestion = total / questions;
    const correctAnswers = achieved / marksPerQuestion;

    return Math.round((correctAnswers / answered) * 100);
  };

  const handleScheduleAssessment = async () => {
    if (!leadId || !consultantId)
      return toast.error("Session missing. Please refresh and try again.");
    if (!selectedSlot)
      return toast.error("Please select an available time slot.");
    if (!isChecklistComplete)
      return toast.error("Please confirm all readiness checklists.");

    setIsSubmitting(true);
    try {
      const fromTime =
        selectedSlot.from || selectedSlot.time.split("-")[0].trim();
      const toTime = selectedSlot.to || selectedSlot.time.split("-")[1].trim();

      const payload = {
        leadId,
        consultantId,
        date,
        from: fromTime,
        to: toTime,
        method: visitMethod,
      };

      const res = await scheduleAssessmentAction(payload as any);

      if (res?.success) {
        toast.success("Assessment Scheduled Successfully!");
        setShowConfirmPopup(true);
      } else {
        toast.error(res?.message || "Failed to schedule Assessment.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Grid container spacing={6}>
      {/* LEFT COLUMN */}
      <Grid size={{ xs: 12, md: isBookingMode ? 8 : 12 }}>
        {(isBookingMode || isAssessmentResult) && (
          <Card className="p-4 sm:p-12 rounded-[15px] shadow-[0_4px_18px_rgba(0,0,0,0.04)]">
            {/* BOOKING FORM SECTION */}
            {isBookingMode && (
              <>
                <Typography variant="h4">
                  Confirm Your E-Assessment Readiness
                </Typography>
                <Typography variant="subtitle1" className="pb-5">
                  Please review the details below and confirm your availability
                  and preparedness for the upcoming session.
                </Typography>

                {/* CHECKLIST */}
                <Card className="rounded-[15px] mb-12 border border-[#e0e0e0] shadow-none">
                  <CardContent className="p-6">
                    <Typography variant="h5" fontWeight="bold" className="mb-4">
                      Readiness Checklist
                    </Typography>
                    <Box className="flex flex-col gap-4">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={checklist.documents}
                            onChange={(e) =>
                              setChecklist({
                                ...checklist,
                                documents: e.target.checked,
                              })
                            }
                          />
                        }
                        label="I have uploaded all necessary documents (i.e. id, academic, experience, resume)."
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={checklist.environment}
                            onChange={(e) =>
                              setChecklist({
                                ...checklist,
                                environment: e.target.checked,
                              })
                            }
                          />
                        }
                        label={
                          visitMethod === "off"
                            ? "I will reach the branch on time."
                            : "I will ensure a quiet environment free from distractions."
                        }
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={checklist.aspirations}
                            onChange={(e) =>
                              setChecklist({
                                ...checklist,
                                aspirations: e.target.checked,
                              })
                            }
                          />
                        }
                        label="I am prepared to discuss my career aspirations and questions."
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={checklist.lighting}
                            onChange={(e) =>
                              setChecklist({
                                ...checklist,
                                lighting: e.target.checked,
                              })
                            }
                          />
                        }
                        label="I will prepare my video call background area with bright light."
                      />
                    </Box>
                  </CardContent>
                </Card>

                <Card className="rounded-[15px] border border-[#e0e0e0] shadow-none">
                  <CardContent className="p-6">
                    <Typography variant="h5" fontWeight="bold" className="mb-4">
                      Your Scheduled Session
                    </Typography>

                    <Typography variant="subtitle2" className="mb-2 font-bold">
                      Select Visit Method
                    </Typography>
                    <Box className="flex flex-wrap gap-4 mb-8">
                      <Button
                        variant={
                          visitMethod === "on" ? "contained" : "outlined"
                        }
                        onClick={() => setVisitMethod("on")}
                        className={`rounded-xl px-6 normal-case ${
                          visitMethod === "on"
                            ? "bg-[#1976d2] text-white shadow-md"
                            : "border-[#ccc] text-[var(--mui-palette-text-primary)]"
                        }`}
                      >
                        <i className="ri-vidicon-line mr-2 text-lg"></i> Online
                        (Video Call)
                      </Button>

                      <Button
                        variant={
                          visitMethod === "off" ? "contained" : "outlined"
                        }
                        onClick={() => setVisitMethod("off")}
                        className={`rounded-xl px-6 normal-case ${
                          visitMethod === "off"
                            ? "bg-[#1976d2] text-white shadow-md"
                            : "border-[#ccc] text-[var(--mui-palette-text-primary)]"
                        }`}
                      >
                        <i className="ri-building-4-line mr-2 text-lg"></i>{" "}
                        Branch Visit (On-Site)
                      </Button>
                    </Box>

                    <Typography variant="subtitle2" className="mb-2 font-bold">
                      Assessment Date
                    </Typography>
                    <TextField
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      inputProps={{ min: todayStr }}
                      className="w-full max-w-[300px] mb-10"
                    />

                    <Typography variant="subtitle2" className="mb-2 font-bold">
                      Available Time Slots
                    </Typography>

                    {loadingSlots ? (
                      <Box className="flex py-4 mb-4">
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      <Box className="flex flex-wrap gap-1.5 mb-4">
                        {slots.length === 0 ? (
                          <Typography className="text-gray-500 py-2">
                            No slots available for this date.
                          </Typography>
                        ) : (
                          slots.map((slot, index) => (
                            <Button
                              key={index}
                              disabled={!slot.available}
                              variant={
                                selectedSlot?.time === slot.time
                                  ? "contained"
                                  : "outlined"
                              }
                              onClick={() =>
                                slot.available && setSelectedSlot(slot)
                              }
                              className={`
                                normal-case rounded-[20px] px-6
                                ${
                                  selectedSlot?.time === slot.time
                                    ? "bg-primary border-primary text-white"
                                    : slot.available
                                      ? "bg-transparent border-[#e0e0e0] hover:border-primary text-inherit"
                                      : "bg-[#f5f5f5] border-[#e0e0e0]"
                                }
                                disabled:text-[#bdbdbd] disabled:border-[#e0e0e0]
                              `}
                            >
                              {slot.time || `${slot.from} - ${slot.to}`}
                            </Button>
                          ))
                        )}
                      </Box>
                    )}

                    <Box className="flex flex-wrap gap-6 mb-6 mt-4">
                      <Box className="flex items-center gap-2">
                        <Box className="w-4 h-4 rounded-[4px] bg-[#1976d2]" />
                        <Typography variant="body2">Selected</Typography>
                      </Box>
                      <Box className="flex items-center gap-2">
                        <Box className="w-4 h-4 rounded-[4px] border border-[#ccc] bg-[--var-primary]" />
                        <Typography variant="body2">Available</Typography>
                      </Box>
                      <Box className="flex items-center gap-2">
                        <Box className="w-4 h-4 rounded-[4px] bg-[--mui-palette-action-disabledBackground] border border-[#e0e0e0]" />
                        <Typography variant="body2">Unavailable</Typography>
                      </Box>
                    </Box>

                    <Box className="mt-8 p-4 rounded-[10px] border-l-4 border-l-[#1976d2] bg-[var(--variant-outlinedBg)]">
                      <Typography variant="body2">
                        Please ensure you have reviewed the assessment materials
                        before your session. Ensure you are ready to receive a
                        call at your scheduled time. Your TAC will contact you
                        via your preferred communication method.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Box className="flex justify-end gap-4 mt-8">
                  <Button
                    variant="contained"
                    size="large"
                    disabled={
                      isSubmitting || !selectedSlot || !isChecklistComplete
                    }
                    onClick={handleScheduleAssessment}
                    className="rounded-xl normal-case text-sm shadow-md hover:bg-blue-700 hover:shadow-lg px-8 py-2.5"
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Confirm Readiness & Book"
                    )}
                  </Button>
                </Box>
              </>
            )}

            {/* ASSESSMENT RESULT SECTION */}
            {isAssessmentResult && (
              <Box
                ref={statusCardRef}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 mb-4 gap-6"
              >
                <Box>
                  <Typography
                    variant="h5"
                    className="text-[1.6rem] font-semibold mb-6"
                  >
                    Applicant Assessment Tool
                  </Typography>
                  <Typography variant="body2" className="text-[0.8rem]">
                    Evaluate the candidate based on standard scoring rubrics for
                    technical and soft skills.
                  </Typography>
                </Box>
                <Box className="border-2 border-[#e0f2fe] rounded-[12px] px-6 py-3 flex flex-col items-center bg-white shadow-[0_4px_14px_rgba(0,0,0,0.03)] min-w-[120px]">
                  <Typography className="text-[#9ca3af] text-[10px] font-bold tracking-[1.2px] uppercase mb-1">
                    Total Score
                  </Typography>
                  <Box className="flex items-baseline">
                    <Typography className="text-[34px] font-black text-[#1877F2] leading-none">
                      78
                    </Typography>
                    <Typography className="text-[16px] font-semibold text-[#6b7280] ml-1">
                      /100
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Card>
        )}

        {/* TECHNICAL RESULT SECTION */}
        {isTechnicalResult && (
          <Box ref={statusCardRef} className="flex flex-col gap-6 w-full">
            {loadingTech || !techData ? (
              <Box className="flex justify-center p-10">
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Card className="p-5 rounded-xl shadow-sm">
                  <Box className="flex items-center gap-4">
                    <i
                      className={`text-[28px] ${techData.achievedScore >= techData.totalScore / 2 ? "material-symbols-light--check-circle-outline  text-[var(--mui-palette-text-primary)]" : "material-symbols-light--cancel-outline text-red-500"}`}
                    />
                    <Box>
                      <Typography className="text-[22px] font-extrabold tracking-tight leading-tight">
                        {techData.achievedScore >= techData.totalScore / 2
                          ? "Congratulations!"
                          : "Assessment Reviewed"}
                      </Typography>
                      <Typography className="text-[15px] mt-2">
                        Your technical round evaluation is complete.
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                <Card className="p-7 rounded-xl shadow-sm">
                  <Box className="flex justify-between items-center mb-8">
                    <Typography className="text-[18px] font-bold">
                      Score Summary
                    </Typography>
                  </Box>
                  <Box className="grid grid-cols-2 gap-y-8 gap-x-6">
                    <Box>
                      <Typography className="text-[13px] font-medium mb-1.5">
                        Overall Score
                      </Typography>
                      <Typography className="text-[32px] font-semibold leading-none text-[var(--mui-palette-text-primary)]">
                        {calculateScorePercentage(
                          techData.achievedScore,
                          techData.totalScore,
                        )}
                        %
                      </Typography>
                    </Box>
                    <Box>
                      <Typography className="text-[13px] font-medium mb-1.5">
                        Questions Answered
                      </Typography>
                      <Typography className="text-[16px] font-medium">
                        {techData.answered} / {techData.questions}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography className="text-[13px] font-medium mb-1.5">
                        Time Taken
                      </Typography>
                      <Typography className="text-[16px] font-medium">
                        {techData.timeTaken}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography className="text-[13px] font-medium mb-1.5">
                        Accuracy Rate
                      </Typography>
                      <Typography className="text-[16px] font-medium text-[var(--mui-palette-text-primary)]">
                        {calculateAccuracyRate(
                          techData.achievedScore,
                          techData.totalScore,
                          techData.questions,
                          techData.answered,
                        )}
                        %
                      </Typography>
                    </Box>
                  </Box>
                  <Divider className="my-7" />
                  <Button
                    fullWidth
                    disableRipple
                    disableElevation
                    variant="contained"
                    className="py-[10px] text-[14px] font-bold rounded-lg normal-case hover:bg-blue-500 bg-[#1877F2]"
                  >
                    View Detailed Breakdown (PDF)
                  </Button>
                </Card>
              </>
            )}
          </Box>
        )}
      </Grid>

      {/* RIGHT COLUMN - NOTIFICATIONS & PROGRESS */}
      {isBookingMode && (
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="rounded-[15px] mb-12 border border-[#e0e0e0] shadow-none">
            <CardContent className="p-6">
              <Typography variant="h6" fontWeight="bold" className="mb-3">
                Your Application Progress
              </Typography>
              <Typography variant="body2" className="mb-4">
                Assessment: 5 of 6 steps complete
              </Typography>
              <LinearProgress
                variant="determinate"
                value={85}
                className="h-2.5 rounded-[5px] mb-4 bg-[#e0e0e0] [&_.MuiLinearProgress-bar]:bg-[#1976d2]"
              />
              <Typography
                variant="caption"
                className="text-[#1976d2] font-bold"
              >
                You're almost there!
              </Typography>
            </CardContent>
          </Card>

          <Card className="rounded-[15px] border border-[#e0e0e0] shadow-none">
            <CardContent className="p-6">
              <Box className="flex justify-between items-center mb-8">
                <Typography variant="h6" fontWeight="bold">
                  Notification Channels
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isEditingChannels}
                      onChange={(e) => setIsEditingChannels(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Edit"
                  labelPlacement="start"
                />
              </Box>

              {!isEditingChannels ? (
                <Box>
                  <Box className="flex gap-4 items-start mb-8">
                    <i className="ri-whatsapp-line text-[24px] text-[#25D366] mt-[2px]"></i>
                    <Typography variant="body2">
                      <span className="font-bold">WhatsApp:</span> Enabled for
                      timely updates.
                    </Typography>
                  </Box>
                  <Box className="flex gap-4 items-start">
                    <i className="ri-mail-line text-[24px] text-[#1976d2] mt-[2px]"></i>
                    <Typography variant="body2">
                      <span className="font-bold">Email:</span> Enabled for
                      detailed information.
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <FormControl fullWidth>
                    <FormGroup>
                      <FormControlLabel
                        label="Receive updates via Email"
                        control={
                          <Checkbox
                            checked={channels.email}
                            onChange={handleChannelChange}
                            name="email"
                          />
                        }
                      />
                      <FormControlLabel
                        label="Receive updates via WhatsApp"
                        control={
                          <Checkbox
                            checked={channels.whatsapp}
                            onChange={handleChannelChange}
                            name="whatsapp"
                          />
                        }
                      />
                      <FormControlLabel
                        label="Receive updates via SMS"
                        control={
                          <Checkbox
                            checked={channels.sms}
                            onChange={handleChannelChange}
                            name="sms"
                          />
                        }
                      />
                    </FormGroup>
                    <FormHelperText className="pt-2">
                      At least One
                    </FormHelperText>
                  </FormControl>
                  <Box className="flex justify-end mt-4">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setIsEditingChannels(false)}
                      className="rounded-[8px] normal-case font-bold px-6 bg-[#1976d2] shadow-none"
                    >
                      Save
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* CONFIRMATION DIALOG */}
      <Dialog
        open={showConfirmPopup}
        onClose={(event: any, reason: string) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") return;
          setShowConfirmPopup(false);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: "rounded-[20px] p-8 relative" }}
      >
        <DialogContent className="flex flex-col items-center text-center p-4">
          <Typography variant="h4">Request Submitted</Typography>
          <Box className="">
            <Typography
              variant="body1"
              className="mt-6 mb-4 px-8 text-[--mui-palette-error-light] leading-[1.9]"
            >
              Please be ready for your assessment on the mentioned date. You
              will be notified via reminder notification channels.
            </Typography>
            <Typography variant="body1" className="mt-5">
              Meanwhile, you can fill all details of the assessment form and
              keep necessary original documents handy.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push("/applicationtracking")}
              className="mt-8 rounded-full px-8 py-2 normal-case border-[#1976d2] text-[var(--mui-palette-primary-main)] text-white font-bold"
            >
              Back to Timeline
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

const Assessment = () => {
  return (
    <Suspense
      fallback={
        <Box className="p-10 flex justify-center">
          <CircularProgress />
        </Box>
      }
    >
      <AssessmentContent />
    </Suspense>
  );
};

export default Assessment;
