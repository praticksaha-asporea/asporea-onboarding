"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { updateUserData } from "@/Redux/Auth/user.slice";
import axiosClient from "@/Services/AxiosConfig/axiosClient";

import { Dialog, DialogContent, CircularProgress } from "@mui/material";
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
import { FormGroup } from "@mui/material";
import {
  getSlotsAction,
  bookSlotAction,
  checkBookingStatusAction,
} from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";

const PreCounsellingContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const reduxLeadId = reduxUser?.leadId || reduxUser?.user?.leadId || "";
  const reduxConsultantId =
    reduxUser?.prefferedConsultant ||
    reduxUser?.user?.prefferedConsultant ||
    "";
  const reduxVisitOption =
    reduxUser?.visitOption ?? reduxUser?.user?.visitOption;
  const reduxMethod = reduxVisitOption === 2 ? "on" : "off";

  const leadId = searchParams?.get("leadId") || reduxLeadId;
  const consultantId = searchParams?.get("consultantId") || reduxConsultantId;
  const method = searchParams?.get("method") || reduxMethod;
  const serverNow = new Date();
  const utcTime = serverNow.getTime() + serverNow.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + 330 * 60000);
  const todayStr = istTime.toISOString().split("T")[0];

  const [date, setDate] = useState(todayStr);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [existingBooking, setExistingBooking] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isReduxReady, setIsReduxReady] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [checklist, setChecklist] = useState({
    materials: true,
    environment: true,
    questions: true,
  });

  const [isEditingChannels, setIsEditingChannels] = useState(false);
  const [preferences, setPreferences] = useState({
    email: reduxUser?.notificationPreference?.email ?? true,
    whatsapp: reduxUser?.notificationPreference?.whatsapp ?? false,
    sms: reduxUser?.notificationPreference?.sms ?? false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReduxReady(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReduxReady) return;  

    
    if (!leadId) {
      toast.error("Please generate inquiry first");
      router.push("/inquiry");
    }
  }, [isReduxReady, leadId, router]);

  useEffect(() => {
    const checkStatus = async () => {
      if (!leadId) {
        return;
      }

      setCheckingStatus(true);

      const res = await checkBookingStatusAction(leadId);
      if (res?.success && res.data) {
        setExistingBooking(res.data);
        if (res.data.schedule?.date) {
          setDate(new Date(res.data.schedule.date).toISOString().split("T")[0]);
        }
      }
      setCheckingStatus(false);
    };
    checkStatus();
  }, [leadId]);

  useEffect(() => {
    if (reduxUser?.notificationPreference) {
      setPreferences({
        email: reduxUser.notificationPreference.email ?? true,
        whatsapp: reduxUser.notificationPreference.whatsapp ?? false,
        sms: reduxUser.notificationPreference.sms ?? false,
      });
    }
  }, [reduxUser]);

  const handlePrefChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPreferences({
      ...preferences,
      [event.target.name]: event.target.checked,
    });
  };
  const handleSavePreferences = async () => {
    if (!preferences.email && !preferences.whatsapp && !preferences.sms) {
      toast.error("Please select at least one notification channel", {
        id: "pref-toast",
      });
      return;
    }

    setIsEditingChannels(false);

    try {
      const res = await axiosClient.patch("/user/profile-update", {
        notificationPreference: preferences,
      });

      if (res.data?.success) {
        dispatch(
          updateUserData({
            notificationPreference: res.data.data.notificationPreference,
          }),
        );
        toast.success("Preferences updated successfully", { id: "pref-toast" });
      }
    } catch (err) {
      console.error("Preference sync failed:", err);
      toast.error("Failed to update preferences", { id: "pref-toast" });
    }
  };

  useEffect(() => {
    const fetchSlots = async () => {
      if (!consultantId) return;

      setLoadingSlots(true);
      const res = await getSlotsAction(consultantId, date);

      if (res?.success) {
        setSlots(res.data);
      } else {
        toast.error(res?.message || "Failed to fetch slots");
        setSlots([]);
      }
      setLoadingSlots(false);
      setSelectedSlot(null);
    };

    fetchSlots();
  }, [date, consultantId]);

  const handleConfirm = async () => {
    if (!leadId || !consultantId) {
      return toast.error(
        "Missing inquiry details. Please go back and try again.",
      );
    }
    if (!selectedSlot) {
      return toast.error("Please select an available time slot");
    }

    setBookingLoading(true);
    const payload = {
      leadId,
      consultantId,
      date,
      from: selectedSlot.from,
      to: selectedSlot.to,
      method: method,
    };

    const res = await bookSlotAction(payload);

    if (res?.success) {
      toast.success("Pre-Counselling scheduled successfully!");
      setShowConfirmPopup(true);
    } else {
    }
    setBookingLoading(false);
  };
  const isChecklistComplete =
    checklist.materials && checklist.environment && checklist.questions;

  return (
    <Grid container spacing={6}>
      {/* Left Section   */}
      <Grid size={{ xs: 12, md: 8 }}>
        
        {!isReduxReady ? (
          <Card className="p-10 rounded-[15px] shadow-[0px_4px_18px_rgba(0,0,0,0.04)] text-center bg-var(--mui-overlays-1) flex flex-col items-center justify-center min-h-[400px]">
            <CircularProgress size={40} />
            <Typography className="mt-4 text-[var(--mui-palette-text-secondary)] font-medium">
              Fetching your details...
            </Typography>
          </Card>
        ) : !consultantId && !existingBooking ? (
          <Card className="p-10 rounded-[15px]   text-center bg-var(--mui-overlays-1)   shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center min-h-[400px]">
            <Box className="w-20 h-20 bg-var(--mui-overlays-1) rounded-full flex items-center justify-center mb-6">
              <i className="ri-user-unfollow-line text-4xl text-[var(--mui-palette-primary-main)]"></i>
            </Box>
            <Typography
              variant="h4"
              className="font-bold text-[var(--mui-palette-text-primary)] mb-2"
            >
              Sorry!
            </Typography>
            <Typography
              variant="subtitle1"
              className="text-[var(--mui-palette-text-primary)] max-w-md"
            >
              TAC (Talent Acquisition Consultant) Not assigned yet. Please try
              after sometime.
            </Typography>
          </Card>
        ) : (
          <Card className="p-2 sm:p-6 rounded-[15px] shadow-[0px_4px_18px_rgba(0,0,0,0.04)]">
            <Typography variant="h4">
              Confirm Your Pre-Counselling Readiness
            </Typography>
            <Typography variant="subtitle1" className="pb-5">
              Please review the details below and confirm your availability and
              preparedness for the upcoming session via phone call.
            </Typography>

            {/* 🔥 1. GREEN BANNER */}
            {existingBooking && (
              <Box className="mb-8 p-4 rounded-xl border border-[#e0e0e0] bg-[var(--variant-outlinedBg)] flex items-center gap-4">
                <Box className="w-12 h-12 rounded-full bg-[var(--variant-outlinedBg)] flex items-center justify-center shrink-0">
                  <i className="ri-calendar-check-fill text-2xl  text-[var(--mui-palette-text-primary)]"></i>
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    className=" text-[var(--mui-palette-text-primary)] font-bold"
                  >
                    Session Already Scheduled
                  </Typography>
                  <Typography
                    variant="body2"
                    className=" text-[var(--mui-palette-text-primary)]"
                  >
                    Your session is booked for{" "}
                    <strong>
                      {new Date(
                        existingBooking.schedule?.date,
                      ).toLocaleDateString()}
                    </strong>{" "}
                    at{" "}
                    <strong>
                      {existingBooking.schedule?.from} -{" "}
                      {existingBooking.schedule?.to}
                    </strong>{" "}
                    via{" "}
                    {existingBooking.schedule?.method === "on"
                      ? "Online Call"
                      : "Branch Visit"}
                    .
                  </Typography>
                </Box>
              </Box>
            )}

            <Card
              className={`rounded-[15px] mb-12  shadow-[0_4px_24px_rgba(0,0,0,0.04)]    ${
                existingBooking ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <CardContent className="p-6">
                <Typography variant="h5" fontWeight="bold" className="mb-4">
                  Readiness Checklist
                </Typography>
                <Box className="flex flex-col gap-4">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklist.materials}
                        onChange={(e) =>
                          setChecklist({
                            ...checklist,
                            materials: e.target.checked,
                          })
                        }
                      />
                    }
                    label="I have reviewed the pre-counselling materials."
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
                      method === "on"
                        ? "I will ensure a quiet environment free from distractions."
                        : "I will reach the branch on time."
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklist.questions}
                        onChange={(e) =>
                          setChecklist({
                            ...checklist,
                            questions: e.target.checked,
                          })
                        }
                      />
                    }
                    label="I am prepared to discuss my career aspirations and questions."
                  />
                </Box>
              </CardContent>
            </Card>

            <Card className="rounded-[15px]    shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <CardContent className="p-6">
                <Typography variant="h5" fontWeight="bold" className="mb-4">
                  Your Scheduled Session
                </Typography>

                <Typography variant="subtitle2" className="mb-2 font-bold">
                  Counselling Date
                </Typography>
                <TextField
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  inputProps={{ min: todayStr }}
                  disabled={!!existingBooking}
                  className="w-full max-w-[300px] mb-10"
                />

                <Typography variant="subtitle2" className="mb-2 font-bold">
                  Available Time Slots
                </Typography>

                {existingBooking ? (
                  <Box className="flex flex-wrap gap-1.5 mb-4">
                    <Button
                      variant="contained"
                      disabled
                      className="bg-[var(--mui-palette-primary-main)] text-white normal-case rounded-[20px] px-6 !opacity-100"
                    >
                      {existingBooking.schedule?.from} -{" "}
                      {existingBooking.schedule?.to}
                    </Button>
                  </Box>
                ) : loadingSlots ? (
                  <Typography className="mb-4 text-gray-500">
                    Loading slots...
                  </Typography>
                ) : (
                  <Box className="flex flex-wrap gap-1.5 mb-4">
                    {slots.length === 0 ? (
                      <Typography className="text-gray-500">
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
                          {slot.time}
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

                <Box className="mt-8 p-4 rounded-[10px] border-l-4  border-l-[#1976d2] bg-[var(--variant-outlinedBg)]">
                  <Typography variant="body2">
                    Please ensure you have reviewed the pre-counselling
                    materials before your session. Ensure you are ready at your
                    scheduled time. Your TAC will contact you via your preferred
                    communication method.
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Box className="flex justify-end gap-4 mt-10">
              {existingBooking ? (
                <Button
                  variant="contained"
                  size="large"
                  href="/document-upload"
                  className="rounded-xl normal-case text-sm shadow-md bg-[var(--mui-palette-primary-main)] border-[var(--mui-palette-primary-main)]    text-white hover:bg-[var(--mui-palette-primary-dark)] px-8"
                >
                  Go to Documents
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  disabled={
                    !selectedSlot ||
                    bookingLoading ||
                    !isChecklistComplete ||
                    checkingStatus
                  }
                  onClick={handleConfirm}
                  className="rounded-xl normal-case text-sm shadow-md hover:bg-[var(--mui-palette-primary-dark)] hover:shadow-lg px-8"
                >
                  {bookingLoading || checkingStatus ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Confirm Readiness"
                  )}
                </Button>
              )}
            </Box>
          </Card>
        )}
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card className="rounded-[15px] mb-12  shadow-none">
          <CardContent className="p-6">
            <Typography variant="h6" fontWeight="bold" className="mb-3">
              Your Application Progress
            </Typography>
            <Typography variant="body2" className="mb-4">
              Pre-counselling: 2 of 6 steps complete
            </Typography>
            <LinearProgress
              variant="determinate"
              value={33}
              className="h-2.5 rounded-[5px] mb-4 bg-[#e0e0e0] [&_.MuiLinearProgress-bar]:bg-[#1976d2]"
            />
            <Typography variant="caption" className="text-[#1976d2] font-bold">
              You're almost there! Just few steps left.
            </Typography>
          </CardContent>
        </Card>

        <Card className="rounded-[15px]   shadow-none">
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
                {preferences.whatsapp && (
                  <Box className="flex gap-4 items-start mb-8">
                    <i className="ri-whatsapp-line text-[24px] text-[#25D366] mt-[2px]"></i>
                    <Typography variant="body2">
                      <span className="font-bold">WhatsApp:</span> Enabled for
                      timely updates and session reminders.
                    </Typography>
                  </Box>
                )}

                {preferences.email && (
                  <Box className="flex gap-4 items-start mb-8">
                    <i className="ri-mail-line text-[24px] text-[#1976d2] mt-[2px]"></i>
                    <Typography variant="body2">
                      <span className="font-bold">Email:</span> Enabled for
                      detailed session information and important documents.
                    </Typography>
                  </Box>
                )}

                {preferences.sms && (
                  <Box className="flex gap-4 items-start mb-8">
                    <i className="ri-message-2-line text-[24px] text-gray-600 mt-[2px]"></i>
                    <Typography variant="body2">
                      <span className="font-bold">SMS:</span> Enabled for quick
                      alerts and notifications.
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box>
                <FormControl fullWidth>
                  <FormGroup>
                    <FormControlLabel
                      label="Receive updates via Email"
                      control={
                        <Checkbox
                          checked={preferences.email}
                          onChange={handlePrefChange}
                          name="email"
                        />
                      }
                    />
                    <FormControlLabel
                      label="Receive updates via WhatsApp"
                      control={
                        <Checkbox
                          checked={preferences.whatsapp}
                          onChange={handlePrefChange}
                          name="whatsapp"
                        />
                      }
                    />
                    <FormControlLabel
                      label="Receive updates via SMS"
                      control={
                        <Checkbox
                          checked={preferences.sms}
                          onChange={handlePrefChange}
                          name="sms"
                        />
                      }
                    />
                  </FormGroup>
                </FormControl>

                <Box className="flex justify-end mt-4">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSavePreferences}
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

      <Dialog
        open={showConfirmPopup}
        onClose={(event, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          setShowConfirmPopup(false);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: "rounded-[20px] p-8 relative" }}
      >
        <DialogContent className="flex flex-col items-center">
          <Typography variant="h4">Request Submitted</Typography>

          <Typography
            variant="body1"
            className="text-[--mui-palette-error-light] mt-5 leading-[1.9] text-center"
          >
            Please be ready for your pre-counselling held on mentioned date and
            time. A Talent Acquisition Consultant(TAC) will connect with you.
          </Typography>

          <Typography
            variant="body1"
            className="text-[--mui-palette-error-light] mt-5 text-center"
          >
            Please check your communication preference.
          </Typography>

          <Typography variant="body1" className="mt-5 text-center">
            Meanwhile you can start uploading necessary documents
          </Typography>

          <Box className="flex gap-4 justify-center w-full mt-5">
            <Button
              variant="contained"
              disableRipple
              disableElevation
              className="rounded-full bg-[var(--mui-palette-primary-main)] px-4 py-1.5 normal-case text-[var(--mui-palette-primary-contrastText)]   hover:text-white   shadow-md"
            href={`/document-upload?leadId=${leadId}`}
            >
              Go to Documents
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Grid>
  );
};
const PreCounselling = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <PreCounsellingContent />
    </Suspense>
  );
};

export default PreCounselling;
