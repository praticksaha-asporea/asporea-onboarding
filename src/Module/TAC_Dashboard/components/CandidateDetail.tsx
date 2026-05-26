"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CamelCase } from "@/Utils/common";
import dayjs from "dayjs";

interface CandidateDetailProps {
  selectedCandidate: any;
  setSelectedCandidate: (candidate: any) => void;
  setCurrentView: (view: "dashboard" | "detail" | "assessment") => void;
}

const CandidateDetail: React.FC<CandidateDetailProps> = ({
  selectedCandidate,
  setSelectedCandidate,
  setCurrentView,
}) => {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      setSelectedCandidate(null);
      setCurrentView("dashboard");
    }
  };

  // ── Destructure API response shape ────────────────────────────────────────
  const c = selectedCandidate ?? {};
  const contact = c.contact ?? {};
  const preferences = c.preferences ?? {};
  const source = c.source ?? {};
  const passport = c.passport ?? {};
  const branchId = preferences.branchId ?? {};
  const consultantId = preferences.consultantId ?? {};

  return (
    <Box className="w-full min-h-screen p-4 md:p-6">
      {/* Header */}
      <Box className="flex items-center gap-4 mb-6">
        <IconButton
          onClick={handleBack}
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <i className="mdi--arrow-back text-gray-600" />
        </IconButton>
        <Box>
          <Typography className="text-[22px] font-bold leading-tight">
            {c.name ?? c.fullName ?? "Candidate Details"}
          </Typography>
          <Typography className="text-[13px] text-gray-500">{c.inqNo}</Typography>
        </Box>
        {c.status && (
          <Chip
            label={CamelCase(c.status)}
            size="small"
            className="ml-2"
            sx={{ fontWeight: 600, fontSize: 12 }}
          />
        )}
      </Box>

      {/* MAIN 2-COLUMN LAYOUT */}
      <Grid container spacing={3}>
        {/* LEFT */}
        <Grid size={{ xs: 12, lg: 9 }}>
          <Stack spacing={3}>

            {/* ── SECTION 1: Inquiry Details ─────────────────────────────── */}
            <Card className="p-6 rounded-xl border border-gray-200 shadow-sm">
              <Grid container spacing={5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    defaultValue={c.name ?? c.fullName ?? ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    defaultValue={contact.email ?? ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    defaultValue={contact.phone ?? ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="WhatsApp Number"
                    defaultValue={contact.whatsapp ?? ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Passport Status</InputLabel>
                    <Select
                      label="Passport Status"
                      defaultValue={passport.status ?? ""}
                    >
                      <MenuItem value="having">Having</MenuItem>
                      <MenuItem value="applied">Applied</MenuItem>
                      <MenuItem value="no">Not Having</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Passport No"
                    defaultValue={passport.no ?? ""}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Full Address"
                    defaultValue={c.address ?? ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Status"
                    disabled
                    value={CamelCase(c.status ?? "")}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Visit Type"
                    disabled
                    value={CamelCase(preferences.visitType ?? "")}
                  />
                </Grid>
              </Grid>
              <Box className="flex justify-end mt-6">
                <Button variant="contained" className="normal-case px-6">
                  Update
                </Button>
              </Box>
            </Card>

            {/* ── SECTION 2: Pre-Counselling ─────────────────────────────── */}
            <Card className="p-6 rounded-xl border border-gray-200 shadow-sm">
              <Typography className="text-[20px] font-bold text-center mb-5">
                Pre-Counselling
              </Typography>
              <Stack spacing={3}>
                <Grid container spacing={5}>
                  <Grid size={{ xs: 12 }}>
                    <FormControl>
                      <FormLabel>Status</FormLabel>
                      <RadioGroup row defaultValue="not">
                        <FormControlLabel value="not" control={<Radio />} label="Not Scheduled" />
                        <FormControlLabel value="progress" control={<Radio />} label="In Progress" />
                        <FormControlLabel value="done" control={<Radio />} label="Finished" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl>
                      <FormLabel>Visit Opinion</FormLabel>
                      <RadioGroup row defaultValue={preferences.visitType === "online" ? "remote" : "office"}>
                        <FormControlLabel value="office" control={<Radio />} label="In-Office" />
                        <FormControlLabel value="remote" control={<Radio />} label="Remote" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Branch"
                      disabled
                      value={branchId.title ?? "—"}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Assigned Consultant"
                      disabled
                      value={
                        consultantId.firstName
                          ? `${consultantId.firstName} ${consultantId.lastName ?? ""}`.trim()
                          : "—"
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Source"
                      disabled
                      value={CamelCase(source.type ?? "")}
                    />
                  </Grid>

                  {source.refType && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Referred By (Type)"
                        disabled
                        value={CamelCase(source.refType ?? "")}
                      />
                    </Grid>
                  )}

                  {source.refName && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Referred By (Name)"
                        disabled
                        value={source.refName}
                      />
                    </Grid>
                  )}

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Token No"
                      value={c.token ?? "—"}
                      disabled={!c.token}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Inquiry Created"
                      disabled
                      value={c.lastActivity ? dayjs(c.lastActivity).format("DD/MM/YYYY hh:mm A") : "—"}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 12 }}>
                    <Box className="flex justify-end gap-3">
                      <Button disabled variant="contained">Call</Button>
                      <Button variant="contained">Queue</Button>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography className="text-[13px] font-semibold mb-1.5">
                      Additional Details of Candidate{" "}
                      <span className="text-[var(--mui-palette-error-light)]">*</span>
                    </Typography>
                    <TextField multiline rows={3} fullWidth slotProps={{ input: { className: "text-[14px]" } }} />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography className="text-[13px] font-semibold mb-1.5">
                      Specific Notes (During Pre-Counselling)
                    </Typography>
                    <TextField multiline rows={3} fullWidth slotProps={{ input: { className: "text-[14px]" } }} />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography className="text-[13px] font-semibold mb-1.5">Advice</Typography>
                    <TextField multiline rows={3} fullWidth slotProps={{ input: { className: "text-[13px]" } }} />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography className="text-[12px] font-semibold mb-1.5">Resume</Typography>
                    <Box
                      component="label"
                      className="w-full md:w-1/2 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.jpg,.jpeg"
                        onChange={(e) => {
                          if (e.target.files?.length) setResumeFile(e.target.files[0]);
                        }}
                      />
                      {resumeFile ? (
                        <Box className="flex flex-col items-center text-center">
                          <i className="mdi--check-circle-outline text-green-500 mb-2" />
                          <Typography className="text-[13px] font-bold text-gray-800">{resumeFile.name}</Typography>
                          <Typography className="text-[11px] text-gray-500">Click to change file</Typography>
                        </Box>
                      ) : (
                        <Box className="flex flex-col items-center text-center">
                          <Box className="w-10 h-10 bg-[var(--mui-overlays-1)] border border-gray-200 rounded-full flex items-center justify-center mb-2 shadow-sm">
                            <i className="ri-upload-cloud-2-line text-xl text-[var(--mui-palette-primary-main)]" />
                          </Box>
                          <Typography className="text-xs font-semibold">
                            Drop your files here or{" "}
                            <span className="text-[var(--mui-palette-primary-main)] font-extrabold">browse</span>
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                <Box className="flex justify-end gap-3 mt-4 pt-6">
                  <Button variant="contained" className="!bg-red-300 hover:!bg-red-400 !text-white !text-[13px] !font-bold !rounded-lg !normal-case">
                    Not Responded
                  </Button>
                  <Button variant="contained" className="!bg-blue-500 hover:!bg-blue-600 !text-white !text-[13px] !font-bold !rounded-lg !normal-case">
                    Send As Prescription
                  </Button>
                </Box>
              </Stack>
            </Card>

            {/* ── SECTION 3: Assessment ──────────────────────────────────── */}
            <Card className="p-6 rounded-xl border border-gray-200 shadow-sm">
              <Typography className="text-[24px] text-center mb-5">Assessment</Typography>
              <Grid container spacing={5}>
                <Grid size={{ xs: 12 }}>
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <RadioGroup row defaultValue="not">
                      <FormControlLabel value="not" control={<Radio />} label="Not Scheduled" />
                      <FormControlLabel value="progress" control={<Radio />} label="In Progress" />
                      <FormControlLabel value="done" control={<Radio />} label="Finished" />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl>
                    <FormLabel>Visit Opinion</FormLabel>
                    <RadioGroup row defaultValue="office">
                      <FormControlLabel value="office" control={<Radio />} label="In-Office" />
                      <FormControlLabel value="remote" control={<Radio />} label="Remote" />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Branch" disabled value={branchId.title ?? "—"} />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Token No" value={c.token ?? "—"} disabled={!c.token} />
                </Grid>

                <Grid size={{ xs: 12, md: 12 }}>
                  <Box className="flex justify-center md:justify-end gap-3 mt-2 mb-4">
                    <Button variant="contained" disabled className="!bg-blue-300 !text-white !rounded-lg !normal-case !opacity-100">
                      Call for Assessment
                    </Button>
                    <Button variant="contained" className="!bg-blue-500 hover:!bg-blue-600 !rounded-lg !normal-case">
                      Queue for Assessment
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {/* Documents */}
              <Box className="border border-gray-200 rounded-xl p-5 mb-2">
                <Typography className="mb-2">Documents</Typography>
                <RadioGroup row defaultValue={c.documents?.status ?? "na"}>
                  <FormControlLabel value="uploaded" control={<Radio />} label="Uploaded" />
                  <FormControlLabel value="verified" control={<Radio />} label="Verified" />
                  <FormControlLabel value="rejected" control={<Radio />} label="Rejected" />
                </RadioGroup>
                <Box className="flex flex-wrap gap-3 mt-4 mb-5">
                  {["Resume", "Documents", "Experience", "Academic"].map((item) => (
                    <Button key={item} variant="contained" size="small" className="!bg-blue-300 hover:!bg-blue-400 !text-white !rounded-lg !normal-case !text-[12px]">
                      {item}
                    </Button>
                  ))}
                </Box>
                <Box className="flex justify-end gap-3">
                  <Button variant="contained" className="!bg-red-300 hover:!bg-red-400 !text-white !rounded-lg !normal-case">Rejected</Button>
                  <Button variant="contained" className="!bg-green-300 hover:!bg-green-400 !text-white !rounded-lg !normal-case">Verified</Button>
                </Box>
              </Box>

              {/* Experience */}
              <Box className="border border-gray-200 rounded-xl p-5 mb-2">
                <Typography className="mb-2">Experience</Typography>
                <RadioGroup row defaultValue={c.experience?.type ? "selected" : "not"}>
                  <FormControlLabel value="not" control={<Radio />} label="Not Selected" />
                  <FormControlLabel value="selected" control={<Radio />} label="Selected" />
                  <FormControlLabel value="verified" control={<Radio />} label="Verified" />
                </RadioGroup>
                <FormControl fullWidth className="mt-4 md:w-1/2">
                  <InputLabel>Experience Type</InputLabel>
                  <Select label="Experience Type" defaultValue={c.experience?.type ?? ""}>
                    <MenuItem value="fresher">Fresher</MenuItem>
                    <MenuItem value="domestic">Domestic</MenuItem>
                    <MenuItem value="abroad">Abroad</MenuItem>
                    <MenuItem value="free">Freelance</MenuItem>
                  </Select>
                </FormControl>
                <Box className="flex justify-end gap-3 mt-5">
                  <Button variant="contained" className="!bg-yellow-300 hover:!bg-yellow-400 !text-white !rounded-lg !normal-case">TL Verified</Button>
                  <Button variant="contained" className="!bg-green-300 hover:!bg-green-400 !text-white !rounded-lg !normal-case">Save</Button>
                </Box>
              </Box>

              {/* Assessment Flow */}
              <Card className="p-6 rounded-xl border border-gray-200 shadow-sm mt-4">
                <Typography className="text-[24px] text-center mb-5">Assessment</Typography>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <RadioGroup row defaultValue="not">
                    <FormControlLabel value="not" control={<Radio />} label="Not Scheduled" />
                    <FormControlLabel value="progress" control={<Radio />} label="In Progress" />
                    <FormControlLabel value="done" control={<Radio />} label="Finished" />
                  </RadioGroup>
                </FormControl>
                <Box className="flex justify-end gap-3 mt-4">
                  <Button variant="outlined">Refer Technical</Button>
                  <Button variant="contained" onClick={() => setCurrentView("assessment")}>Start</Button>
                  <Button variant="contained" color="success">Save</Button>
                </Box>
              </Card>

              {/* Technical Round */}
              <Box className="border border-gray-200 rounded-xl p-5 mt-4">
                <FormControl className="mb-4">
                  <Typography className="mb-2">Technical Round</Typography>
                  <RadioGroup row defaultValue={c.technical?.status ?? "na"}>
                    <FormControlLabel value="na" control={<Radio />} label="Not Referred" />
                    <FormControlLabel value="refered" control={<Radio />} label="Referred" />
                    <FormControlLabel value="passed" control={<Radio />} label="Passed" />
                    <FormControlLabel value="failed" control={<Radio />} label="Failed" />
                  </RadioGroup>
                </FormControl>
                <FormControl fullWidth className="mb-5 md:w-1/2">
                  <InputLabel>Classify Experience</InputLabel>
                  <Select defaultValue="" label="Classify Experience">
                    <MenuItem value="domestic">Domestic</MenuItem>
                    <MenuItem value="abroad">International</MenuItem>
                  </Select>
                </FormControl>
                <Box className="flex justify-end gap-3">
                  <Button variant="contained" className="!bg-green-300 hover:!bg-green-400 !text-white !rounded-lg !normal-case">Save</Button>
                </Box>
              </Box>
            </Card>

          </Stack>
        </Grid>

        {/* RIGHT: Progress / Escalation */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <Card className="p-5 sticky top-6 rounded-xl border border-gray-200 shadow-sm">
            <Typography className="text-[16px] font-semibold mb-4">Progress</Typography>

            {/* Quick info */}
            <Box className="mb-4 space-y-2">
              <Typography className="text-[12px] text-gray-500">
                Branch: <span className="font-semibold text-gray-800">{branchId.title ?? "—"}</span>
              </Typography>
              <Typography className="text-[12px] text-gray-500">
                Consultant:{" "}
                <span className="font-semibold text-gray-800">
                  {consultantId.firstName ? `${consultantId.firstName} ${consultantId.lastName ?? ""}`.trim() : "—"}
                </span>
              </Typography>
              <Typography className="text-[12px] text-gray-500">
                Status: <span className="font-semibold text-gray-800">{CamelCase(c.status ?? "")}</span>
              </Typography>
              <Typography className="text-[12px] text-gray-500">
                Experience: <span className="font-semibold text-gray-800">{CamelCase(c.experience?.type ?? "Not set")}</span>
              </Typography>
            </Box>

            <FormControl fullWidth className="mb-4">
              <InputLabel>Escalate</InputLabel>
              <Select label="Escalate">
                <MenuItem value="">-- Select TAC --</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason *"
              placeholder="Enter reason for escalation..."
              className="mb-4"
              slotProps={{ input: { className: "text-[14px]" } }}
            />

            <Typography className="text-[12px] text-[var(--mui-palette-error-light)] mb-4">
              NOTE: This will need approval of your manager.
            </Typography>

            <Box className="flex justify-center">
              <Button disabled variant="contained">Submit</Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CandidateDetail;
