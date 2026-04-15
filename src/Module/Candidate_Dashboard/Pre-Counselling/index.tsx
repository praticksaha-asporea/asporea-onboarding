"use client";

import { useState } from "react";
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

const PreCounselling = () => {
  const [selectedSlot, setSelectedSlot] = useState("2:00-2:30");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [isEditingChannels, setIsEditingChannels] = useState(false);

  const [state, setState] = useState<StateType>({
    gilad: true,
    jason: false,
    antoine: false,
  });

  const { gilad, jason, antoine } = state;
  const error = [gilad, jason, antoine].filter((v) => v).length !== 2;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  // Demo slots array
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
      {/* Left Section   */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Card className="p-2 sm:p-6 rounded-[15px] shadow-[0px_4px_18px_rgba(0,0,0,0.04)]">
          <Typography variant="h4">
            Confirm Your Pre-Counselling Readiness
          </Typography>
          <Typography variant="subtitle1" className="pb-5">
            Please review the details below and confirm your availability and
            preparedness for the upcoming session via phone call.
          </Typography>

          <Card className="rounded-[15px] mb-12 border border-[#e0e0e0] shadow-none">
            <CardContent className="p-6">
              <Typography variant="h5" fontWeight="bold" className="mb-4">
                Readiness Checklist
              </Typography>
              <Box className="flex flex-col gap-4">
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label="I have reviewed the pre-counselling materials."
                />
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label="I will ensure a quiet environment free from distractions."
                />
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label="I am prepared to discuss my career aspirations and questions."
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
                Counselling Date
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
                    ${
                      selectedSlot === slot.time
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
                  Please ensure you have reviewed the pre-counselling materials
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
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card className="rounded-[15px] mb-12 border border-[#e0e0e0] shadow-none">
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
      <Dialog
        open={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "rounded-[20px] p-8 relative",
        }}
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

          <Typography variant="body1" className="text-[--mui-palette-error-light] mt-5 text-center">
            Please check your communication preference.
          </Typography>

          <Typography variant="body1" className="mt-5 text-center">
            Meanwhile you can start uploading necessary documents
          </Typography>

          <Box className="flex gap-4 justify-center w-full mt-5">
            <Button
              variant="outlined"
              disableRipple
              disableElevation
              className="rounded-full bg-[var(--mui-palette-primary-main)] px-4 py-1.5 normal-case text-white hover:border-gray-900 hover:text-black hover:bg-white"
              href='/document-upload'
            >
              Go to Documents
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default PreCounselling;
