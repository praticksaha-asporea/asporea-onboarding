"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

const PreCounselling = () => {
  const [selectedSlot, setSelectedSlot] = useState("2:00-2:30");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

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
        <Card
          sx={{
            p: { xs: 2, sm: 6 },
            borderRadius: "15px",
            boxShadow: "0px 4px 18px rgba(0,0,0,0.04)",
          }}
        >
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            Confirm Your Pre-Counselling Readiness
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 6 }}>
            Please review the details below and confirm your availability and
            preparedness for the upcoming session via phone call.
          </Typography>

          <Card
            sx={{
              borderRadius: "15px",
              mb: 6,
              border: "1px solid #e0e0e0",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: 6 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 4 }}>
                Readiness Checklist
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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

          <Card
            sx={{
              borderRadius: "15px",
              border: "1px solid #e0e0e0",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: 6 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 4 }}>
                Your Scheduled Session
              </Typography>

              <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: "bold" }}
              >
                Counselling Date
              </Typography>
              <TextField
                type="date"
                defaultValue="2026-02-27"
                sx={{
                  width: "100%",
                  maxWidth: "300px",
                  mb: 5,
                  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                }}
              />

              <Typography
                variant="subtitle2"
                sx={{ mb: 2, fontWeight: "bold" }}
              >
                Available Time Slots
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 4 }}>
                {slots.map((slot, index) => (
                  <Button
                    key={index}
                    disabled={!slot.available}
                    variant={
                      selectedSlot === slot.time ? "contained" : "outlined"
                    }
                    onClick={() => slot.available && setSelectedSlot(slot.time)}
                    sx={{
                      borderRadius: "20px",
                      textTransform: "none",
                      px: 3,
                      borderColor:
                        selectedSlot === slot.time ? "primary.main" : "#e0e0e0",
                      backgroundColor:
                        selectedSlot === slot.time
                          ? "primary.main"
                          : slot.available
                            ? "transparent"
                            : "#f5f5f5",
                      color:
                        selectedSlot === slot.time
                          ? "white"
                          : slot.available
                            ? "text.primary"
                            : "text.disabled",
                      "&:hover": {
                        borderColor: slot.available
                          ? "primary.main"
                          : "#e0e0e0",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "#f5f5f5",
                        color: "#bdbdbd",
                        borderColor: "#e0e0e0",
                      },
                    }}
                  >
                    {slot.time}
                  </Button>
                ))}
              </Box>

              <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "4px",
                      backgroundColor: "#1976d2",
                    }}
                  />
                  <Typography variant="body2">Selected</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      backgroundColor: "transparent",
                    }}
                  />
                  <Typography variant="body2">Available</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "4px",
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #e0e0e0",
                    }}
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Unavailable
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  backgroundColor: "#f8faff",
                  borderRadius: "10px",
                  borderLeft: "4px solid #1976d2",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontWeight: "500" }}
                >
                  Please ensure you have reviewed the pre-counselling materials
                  before your session. Ensure you are ready to receive a call at
                  your scheduled time. Your TAC will contact you via your
                  preferred communication method.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowConfirmPopup(true)}
            sx={{
              mt: 5,
              py: 2,
              borderRadius: "10px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Confirm Readiness
          </Button>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          sx={{
            borderRadius: "15px",
            mb: 6,
            border: "1px solid #e0e0e0",
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Your Application Progress
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Pre-counselling: 2 of 7 steps complete
            </Typography>
            <LinearProgress
              variant="determinate"
              value={28}
              sx={{
                height: 10,
                borderRadius: 5,
                mb: 2,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": { backgroundColor: "#1976d2" },
              }}
            />
            <Typography
              variant="caption"
              color="primary"
              sx={{ fontWeight: "600" }}
            >
              You're almost there! Just few steps left.
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: "15px",
            border: "1px solid #e0e0e0",
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 4 }}>
              Notification Channels
            </Typography>
            <Box
              sx={{ display: "flex", gap: 2, mb: 4, alignItems: "flex-start" }}
            >
              <i
                className="ri-whatsapp-line"
                style={{ fontSize: "24px", color: "#25D366", marginTop: "2px" }}
              ></i>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", lineHeight: 1.5 }}
              >
                <span style={{ fontWeight: "bold", color: "#000" }}>
                  WhatsApp:
                </span>{" "}
                Enabled for timely updates and session reminders.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <i
                className="ri-mail-line"
                style={{ fontSize: "24px", color: "#1976d2", marginTop: "2px" }}
              ></i>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", lineHeight: 1.5 }}
              >
                <span style={{ fontWeight: "bold", color: "#000" }}>
                  Email:
                </span>{" "}
                Enabled for detailed session information and important
                documents.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Dialog
        open={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "20px", p: 4, position: "relative" },
        }}
      >
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            p: 2,
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: 900, color: "#000", mb: 10 }}
          >
            Request Submitted
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: "#d32f2f", mb: 3, lineHeight: 1.9, px: 8 }}
          >
            Please be ready for your pre-counselling held on mentioned date and
            time. A Talent Acquisition Consultant(TAC) will connect with you.
          </Typography>

          <Typography variant="body1" sx={{ color: "#d32f2f", mb: 6, px: 2 }}>
            Please check your communication preference.
          </Typography>

          <Typography variant="body1" sx={{ color: "#000", mb: 6, px: 2 }}>
            Meanwhile you can start uploading necessary <br />
            documents
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Button
              variant="outlined"
              disableRipple
              disableElevation
              sx={{
                borderRadius: "50px",
                backgroundColor: "black",

                px: 4,
                py: 1.5,
                textTransform: "none",
                fontWeight: "bold",
                color: "white",
                borderColor: "grey.300",
                "&:hover": {
                  borderColor: "grey.900",
                  color: "black",
                  backgroundColor: "white",
                },
              }}
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
