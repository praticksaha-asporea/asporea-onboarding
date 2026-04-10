"use client";

import { useState } from "react";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import type { ChangeEvent } from "react";

import { Dialog, DialogContent } from "@mui/material";
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

type StateType = {
  [key: string]: boolean;
};

const Assessment = () => {
  const searchParams = useSearchParams();

  const viewParam = searchParams?.get("view");
  const isAssessmentResult = viewParam === "result";
  const isTechnicalResult = viewParam === "technical";
  const isBookingMode = !isAssessmentResult && !isTechnicalResult;

  const [selectedSlot, setSelectedSlot] = useState("2:00-2:30");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [isEditingChannels, setIsEditingChannels] = useState(false);

  const [state, setState] = useState<StateType>({
    gilad: true,
    jason: false,
    antoine: false,
  });
  const statusCardRef = useRef<HTMLDivElement>(null);

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

  const { gilad, jason, antoine } = state;
  const error = [gilad, jason, antoine].filter((v) => v).length !== 2;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const slots = [
    { time: "11:00-11:30", available: false },
    { time: "11:30-12:00", available: true },
    { time: "12:00-12:30", available: true },
    { time: "12:30-01:00", available: true },
    { time: "01:00-01:30", available: false },
    { time: "01:30-02:00", available: true },
    { time: "02:00-02:30", available: true },
    { time: "02:30-03:00", available: true },
    { time: "03:00-03:30", available: true },
    { time: "03:30-04:00", available: true },
    { time: "04:00-04:30", available: true },
    { time: "04:30-05:00", available: true },
    { time: "05:00-05:30", available: true },
    { time: "05:30-06:00", available: true },
  ];

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: isBookingMode ? 8 : 12 }}>
        {(isBookingMode || isAssessmentResult) && (
          <Card className="p-4 sm:p-12 rounded-[15px] shadow-[0_4px_18px_rgba(0,0,0,0.04)]">
            {isBookingMode && (
              <>
                <Typography variant="h4">
                  Confirm Your E-Assessment Readliness
                </Typography>
                <Typography variant="subtitle1" className="pb-5">
                  Please review the details below and confirm your availability
                  and preparedness for the upcoming session via phone call.
                </Typography>

                <Card className="rounded-[15px] mb-12 border border-[#e0e0e0] shadow-none">
                  <CardContent className="p-6">
                    <Typography variant="h5" fontWeight="bold" className="mb-4">
                      Readiness Checklist
                    </Typography>
                    <Box className="flex flex-col gap-4">
                      <FormControlLabel
                        control={<Checkbox defaultChecked />}
                        label="I have uploaded all necessary documents (i.e. id, academic,experience,resume)."
                      />
                      <FormControlLabel
                        control={<Checkbox defaultChecked />}
                        label="I will ensure a quiet environment free from distractions."
                      />
                      <FormControlLabel
                        control={<Checkbox defaultChecked />}
                        label="I am prepared to discuss my career aspirations and questions."
                      />
                      <FormControlLabel
                        control={<Checkbox defaultChecked />}
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

                    <Typography
                      variant="subtitle2"
                      className="font-medium mb-1"
                    >
                      Counselling Date
                    </Typography>
                    <TextField
                      type="date"
                      defaultValue="2026-02-27"
                      className="w-full max-w-[300px] mb-10"
                      InputProps={{
                        className: "rounded-[10px] bg-white",
                      }}
                    />

                    <Typography
                      variant="subtitle2"
                      className="mb-2 font-medium"
                    >
                      Available Time Slots
                    </Typography>
                    <Box className="flex flex-wrap gap-3 mb-8">
                      {slots.map((slot, index) => (
                        <Button
                          key={index}
                          disabled={!slot.available}
                          variant={
                            selectedSlot === slot.time
                              ? "contained"
                              : "outlined"
                          }
                          onClick={() =>
                            slot.available && setSelectedSlot(slot.time)
                          }
                          className={clsx(
                            "rounded-[20px] px-6 normal-case font-medium border transition-colors duration-150",
                            {
                              // selected
                              "bg-blue-600 text-white border-blue-600":
                                selectedSlot === slot.time,
                              // available (not selected)
                              "bg-transparent text-gray-900 border-[#e0e0e0] hover:border-blue-600":
                                selectedSlot !== slot.time && slot.available,
                              // unavailable
                              "bg-[#f5f5f5] text-gray-400 border-[#e0e0e0]":
                                !slot.available && selectedSlot !== slot.time,
                              // explicit disabled (native fallback)
                              "bg-[#f5f5f5] text-[#bdbdbd] border-[#e0e0e0] cursor-not-allowed":
                                !slot.available,
                            },
                          )}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </Box>

                    <Box className="flex flex-wrap gap-6 mb-6">
                      <Box className="flex items-center gap-2">
                        <Box className="w-4 h-4 rounded bg-[#1976d2]" />
                        <Typography variant="body2">Selected</Typography>
                      </Box>
                      <Box className="flex items-center gap-2">
                        <Box className="w-4 h-4 rounded bg-transparent border border-[#cccccc]" />
                        <Typography variant="body2">Available</Typography>
                      </Box>
                      <Box className="flex items-center gap-2">
                        <Box className="w-4 h-4 rounded bg-[#f5f5f5] border border-[#e0e0e0]" />
                        <Typography variant="body2" className="text-gray-500">
                          Unavailable
                        </Typography>
                      </Box>
                    </Box>

                    <Box className="mt-8 p-4 bg-[#f8faff] rounded-[10px] border-l-4 border-l-[#1976d2]">
                      <Typography
                        variant="body2"
                        className="text-gray-500 font-medium"
                      >
                        Please ensure you are available at this time and adjust
                        if necessary via support.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setShowConfirmPopup(true)}
                  className="mt-10 py-4 rounded-[10px] text-[1.1rem] font-bold normal-case"
                >
                  Confirm Readiness
                </Button>
              </>
            )}

            {isAssessmentResult && (
              <Box
                ref={statusCardRef}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 mb-4 gap-6"
              >
                <Box>
                  <Typography
                    variant="h5"
                    className="text-[#111827] text-[1.6rem] font-semibold mb-6"
                  >
                    Applicant Assessment Tool
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-[#6b7280] text-[0.8rem]"
                  >
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

        {isTechnicalResult && (
          <div ref={statusCardRef} className="flex flex-col gap-6 w-full">
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
              <svg
                className="w-9 h-9 text-gray-900 shrink-0"
                fill="none"
                strokeWidth="1.8"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight leading-tight">
                  Congratulations!
                </h2>
                <p className="text-[15px] text-gray-700 mt-2">
                  You have successfully completed the technical round.
                </p>
              </div>
            </div>

            <div className="p-7 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[18px] font-bold text-gray-900">
                  Score Summary
                </h3>
                <div className="flex gap-3 text-gray-500"></div>
              </div>

              <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                <div>
                  <p className="text-[13px] font-medium text-gray-500 mb-1.5">
                    Overall Score
                  </p>
                  <p className="text-[32px] font-semibold text-gray-900 leading-none">
                    85%
                  </p>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-gray-500 mb-1.5">
                    Questions Answered
                  </p>
                  <p className="text-[16px] font-medium text-gray-900">
                    17 / 20
                  </p>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-gray-500 mb-1.5">
                    Time Taken
                  </p>
                  <p className="text-[16px] font-medium text-gray-900">
                    45 minutes
                  </p>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-gray-500 mb-1.5">
                    Accuracy Rate
                  </p>
                  <p className="text-[16px] font-medium text-gray-900">85%</p>
                </div>
              </div>

              <hr className="my-7 border-gray-200" />

              <button className="w-full py-[10px] text-[14px] font-bold text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                View Detailed Breakdown
              </button>
            </div>

            <div className="p-7 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[18px] font-bold text-gray-900">
                  Detailed Feedback
                </h3>
                <div className="flex gap-3 text-gray-500"></div>
              </div>

              <ul className="list-disc pl-5 space-y-3 text-[15px] text-gray-900 font-medium mb-8">
                <li>Strong understanding of core concepts.</li>
                <li>Excellent problem-solving approach.</li>
                <li>Good code quality and documentation.</li>
              </ul>

              <p className="text-[15px] text-gray-600 font-normal">
                You demonstrated exceptional skills. We look forward to the next
                stage!
              </p>
            </div>
          </div>
        )}
      </Grid>

      {/* wrapping the right grid */}
      {isBookingMode && (
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="rounded-[15px] mb-12 border border-[#e0e0e0] shadow-none">
            <CardContent className="p-6">
              <Typography variant="h6" fontWeight="bold" className="mb-3">
                Your Application Progress
              </Typography>
              <Typography variant="body2" className="mb-4 text-gray-500">
                Pre-counselling: 7 of 7 steps complete
              </Typography>
              <LinearProgress
                variant="determinate"
                value={100}
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
                    <i
                      className="ri-whatsapp-line"
                      style={{
                        fontSize: "24px",
                        color: "#25D366",
                        marginTop: "2px",
                      }}
                    ></i>
                    <Typography
                      variant="body2"
                      className="text-gray-500 leading-6"
                    >
                      <span style={{ fontWeight: "bold", color: "#000" }}>
                        WhatsApp:
                      </span>{" "}
                      Enabled for timely updates and session reminders.
                    </Typography>
                  </Box>
                  <Box className="flex gap-4 items-start">
                    <i
                      className="ri-mail-line"
                      style={{
                        fontSize: "24px",
                        color: "#1976d2",
                        marginTop: "2px",
                      }}
                    ></i>
                    <Typography
                      variant="body2"
                      className="text-gray-500 leading-6"
                    >
                      <span style={{ fontWeight: "bold", color: "#000" }}>
                        Email:
                      </span>{" "}
                      Enabled for detailed session information and important
                      documents.
                    </Typography>
                  </Box>
                  <Typography className="text-center text-sm mt-4">
                    You will receive your counselling confirmation and reminders
                    on these channels
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <FormControl fullWidth>
                    <FormGroup>
                      <FormControlLabel
                        label="Receive updates via Email"
                        control={
                          <Checkbox
                            checked={gilad}
                            onChange={handleChange}
                            name="gilad"
                          />
                        }
                      />
                      <FormControlLabel
                        label="Receive updates via WhatsApp"
                        control={
                          <Checkbox
                            checked={jason}
                            onChange={handleChange}
                            name="jason"
                          />
                        }
                      />
                      <FormControlLabel
                        label="Receive updates via SMS"
                        control={
                          <Checkbox
                            checked={antoine}
                            onChange={handleChange}
                            name="antoine"
                          />
                        }
                      />
                    </FormGroup>
                    <FormHelperText>At least One</FormHelperText>
                  </FormControl>

                  <Box className="flex justify-end mt-4">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setIsEditingChannels(false)}
                      className="rounded-lg normal-case font-bold px-6 bg-[#1976d2] shadow-none"
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

      <Dialog
        open={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: "rounded-[20px] p-8 relative" }}
      >
        <DialogContent className="flex flex-col items-center text-center p-4">
          <Typography variant="h3" className="font-black text-black mb-10">
            Request Submitted
          </Typography>

          <Typography
            variant="body1"
            className="text-[#d32f2f] text-lg mb-3 leading-[1.9] px-20"
          >
            Please be ready for your assessment for the mentioned date. You will
            be notified via reminder notification channels.
          </Typography>

          <Typography
            variant="body1"
            className="text-black text-[16px] mb-24 px-24 mt-5"
          >
            Meanwhile you can fill all details of assessment form and keep
            necessary (uploaded) documents original version handy.
          </Typography>
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default Assessment;
