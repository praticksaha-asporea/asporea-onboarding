"use client";

import { useState } from "react";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import type { ChangeEvent } from "react";

import { Dialog, DialogContent, Divider, IconButton } from "@mui/material";
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

                    <Typography variant="subtitle2" className="mb-2 font-bold">
                      Assessment Date
                    </Typography>
                    <TextField
                      type="date"
                      defaultValue="2026-02-27"
                      className="w-full max-w-[300px] mb-10"
                    />

                    <Typography variant="subtitle2" className="mb-2 font-bold">
                      Available Time Slots
                    </Typography>
                    <Box className="flex flex-wrap gap-1.5 mb-4">
                      {/*  */}
                      {slots.map((slot, index) => (
                        <Button
                          key={index}
                          disabled={!slot.available}
                          variant={
                            selectedSlot === slot.time ? "contained" : "outlined"
                          }
                          onClick={() => slot.available && setSelectedSlot(slot.time)}
                          className={`
                    normal-case rounded-[20px] px-6
                    ${selectedSlot === slot.time
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
                      ))}
                    </Box>

                    <Box className="flex flex-wrap gap-6 mb-6">
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
                        <Typography variant="body2">
                          Unavailable
                        </Typography>
                      </Box>
                    </Box>

                    <Box className="mt-8 p-4 rounded-[10px] border-l-4 border-l-[#1976d2]">
                      <Typography variant="body2">
                        Please ensure you have reviewed the assessment materials
                        before your session. Ensure you are ready to receive a call at
                        your scheduled time. Your TAC will contact you via your
                        preferred communication method.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
                <Box className="flex justify-end gap-4">

                  <Button
                    // fullWidth
                    variant="contained"
                    size="small"
                    onClick={() => setShowConfirmPopup(true)}
                    className="rounded-xl mt-10 normal-case text-sm shadow-md hover:bg-blue-700 hover:shadow-lg"
                  >
                    Confirm Readiness
                  </Button>
                </Box>
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
                    className="text-[1.6rem] font-semibold mb-6"
                  >
                    Applicant Assessment Tool
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-[0.8rem]"
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
          <Box ref={statusCardRef} className="flex flex-col gap-6 w-full">

            {/* Top Success Card */}
            <Card className="p-5 rounded-xl shadow-sm">
              <Box className="flex items-center gap-4">
                <i className="material-symbols-light--check-circle-outline text-[28px]" />
                <Box>
                  <Typography className="text-[22px] font-extrabold tracking-tight leading-tight">
                    Congratulations!
                  </Typography>
                  <Typography className="text-[15px] mt-2">
                    You have successfully completed the technical round.
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* Score Summary */}
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
                  <Typography className="text-[32px] font-semibold leading-none">
                    85%
                  </Typography>
                </Box>

                <Box>
                  <Typography className="text-[13px] font-medium mb-1.5">
                    Questions Answered
                  </Typography>
                  <Typography className="text-[16px] font-medium">
                    17 / 20
                  </Typography>
                </Box>

                <Box>
                  <Typography className="text-[13px] font-medium mb-1.5">
                    Time Taken
                  </Typography>
                  <Typography className="text-[16px] font-medium">
                    45 minutes
                  </Typography>
                </Box>

                <Box>
                  <Typography className="text-[13px] font-medium mb-1.5">
                    Accuracy Rate
                  </Typography>
                  <Typography className="text-[16px] font-medium">
                    85%
                  </Typography>
                </Box>
              </Box>

              <Divider className="my-7" />

              <Button
                fullWidth
                disableRipple
                disableElevation
                variant="contained"
                className="py-[10px] text-[14px] font-bold rounded-lg normal-case hover:bg-blue-500"
              >
                View Detailed Breakdown
              </Button>
            </Card>

            {/* Detailed Feedback */}
            <Card className="p-7 rounded-xl shadow-sm">
              <Box className="flex justify-between items-center mb-6">
                <Typography className="text-[18px] font-bold">
                  Detailed Feedback
                </Typography>
              </Box>

              <Box
                component="ul"
                className="list-disc pl-5 space-y-3 text-[15px] font-medium mb-8"
              >
                <li>Strong understanding of core concepts.</li>
                <li>Excellent problem-solving approach.</li>
                <li>Good code quality and documentation.</li>
              </Box>

              <Typography className="text-[15px] font-normal">
                You demonstrated exceptional skills. We look forward to the next stage!
              </Typography>
            </Card>

          </Box>
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
              <Typography variant="body2" className="mb-4">
                Pre-counselling: 7 of 7 steps complete
              </Typography>
              <LinearProgress
                variant="determinate"
                value={100}
                className="h-2.5 rounded-[5px] mb-4 bg-[#e0e0e0] [&_.MuiLinearProgress-bar]:bg-[#1976d2]"
              />
              <Typography variant="caption" className="text-[#1976d2] font-bold">
                You're almost there
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
                      className="ri-whatsapp-line text-[24px] text-[#25D366] mt-[2px]"
                    ></i>
                    <Typography
                      variant="body2"                  >
                      <span className="font-bold">WhatsApp:</span>{" "}
                      Enabled for timely updates and session reminders.
                    </Typography>
                  </Box>
                  <Box className="flex gap-4 items-start">
                    <i
                      className="ri-mail-line text-[24px] text-[#1976d2] mt-[2px]"
                    ></i>
                    <Typography
                      variant="body2"
                    >
                      <span className="font-bold">Email:</span> Enabled
                      for detailed session information and important documents.
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
                    <FormHelperText className="pt-2">At least One</FormHelperText>
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

      <Dialog
        open={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: "rounded-[20px] p-8 relative" }}
      >
        <DialogContent className="flex flex-col items-center text-center p-4">
          <Typography variant="h4">
            <IconButton
              onClick={() => setShowConfirmPopup(false)}
              className="absolute right-5 top-5"
            >
              <i className="material-symbols--close-rounded" />

            </IconButton>
            Request Submitted
          </Typography>

          <Box className="">
            <Typography variant="body1" className="mt-2 mb-4 px-8 text-[--mui-palette-error-light]  leading-[1.9] px-20"
            >
              Please be ready for your assessment for the mentioned date. You will
              be notified via reminder notification channels.
            </Typography>

            <Typography
              variant="body1"
              className="mt-5"
            >
              Meanwhile you can fill all details of assessment form and keep
              necessary (uploaded) documents original version handy.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default Assessment;
