import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
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
  useEffect(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  return (
    <Box className="w-full min-h-screen p-4 md:p-6 ">
      {/* Header */}
      <Box className="flex items-center gap-4 mb-6">
        <IconButton
          onClick={() => {
            setSelectedCandidate(null);
            setCurrentView("dashboard");
          }}
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <i className="mdi--arrow-back text-gray-600" />
        </IconButton>
        <Typography className="text-[22px] font-bold">
          Candidate Details
        </Typography>
      </Box>

      {/* MAIN 2-COLUMN LAYOUT */}
      <Grid container spacing={3}>
        {/* LEFT */}
        <Grid size={{ xs: 12, lg: 9 }}>
          <Stack spacing={3}>
            {/* Inquiry Details */}
            <Card className="p-6 rounded-xl border border-gray-200 shadow-sm">
              <Typography className="text-[18px] font-medium mb-5">
                Inquiry Details ( ASP-EINQ-XXXX )
              </Typography>
              <Grid container spacing={5}>
                <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    defaultValue={selectedCandidate.name}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    defaultValue="alina.smith@example.com"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                  <TextField fullWidth label="Phone Number *" />
                </Grid>
                <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                  <TextField fullWidth label="WhatsApp Number" />
                </Grid>
                <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>Passport Status</InputLabel>
                    <Select label="Passport Status">
                      <MenuItem value="having">Having</MenuItem>
                      <MenuItem value="not">Not Having</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                  <TextField fullWidth label="Passport No" />
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Full Address *"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select label="Status">
                      <MenuItem>Waiting For Pre-Counselling</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box className="flex justify-end mt-6">
                <Button variant="contained" className="normal-case px-6">
                  Update
                </Button>
              </Box>
            </Card>

            {/* SECTION 2: PRE-COUNSELLING */}
            <Card className="p-6 rounded-xl border border-gray-200 shadow-sm">
              <Typography className="text-[20px] font-bold text-center mb-5">
                Pre-Counselling
              </Typography>
              <Stack spacing={3}>
                <Grid container spacing={5}>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <FormControl>
                      <FormLabel>Status</FormLabel>
                      <RadioGroup row defaultValue="not">
                        <FormControlLabel
                          value="not"
                          control={<Radio />}
                          label="Not Scheduled"
                        />
                        <FormControlLabel
                          value="progress"
                          control={<Radio />}
                          label="In Progress"
                        />
                        <FormControlLabel
                          value="done"
                          control={<Radio />}
                          label="Finished"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl>
                      <FormLabel>Visit Opinion</FormLabel>
                      <RadioGroup row defaultValue="office">
                        <FormControlLabel
                          value="office"
                          control={<Radio />}
                          label="In-Office"
                        />
                        <FormControlLabel
                          value="remote"
                          control={<Radio />}
                          label="Remote"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Branch"
                      disabled
                      value="Siliguri"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Hear From</InputLabel>
                      <Select label="Hear From" defaultValue="PCRA" disabled>
                        <MenuItem value="PCRA">PCRA</MenuItem>
                        <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                        <MenuItem value="Referral">Referral</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth disabled>
                      <InputLabel>Referred By</InputLabel>
                      <Select label="Referred By" defaultValue="PCRA">
                        <MenuItem value="PCRA">PCRA</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Token No" defaultValue="T001" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Token Generated" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 12 }}>
                    <Box className="flex justify-end gap-3">
                      <Button disabled variant="contained">
                        Call
                      </Button>
                      <Button variant="contained">Queue</Button>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography className="text-[13px] font-semibold mb-1.5">
                      Additional Details of Candidate{" "}
                      <span className="text-[var(--mui-palette-error-light)]">
                        *
                      </span>
                    </Typography>
                    <TextField
                      multiline
                      rows={3}
                      defaultValue="Worked in sales from 2-3 years, etc..."
                      fullWidth
                      InputProps={{ className: "text-[14px]" }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography className="text-[13px] font-semibold mb-1.5">
                      Specific Notes (During Pre-Counselling)
                    </Typography>
                    <TextField
                      multiline
                      rows={3}
                      defaultValue="Not wants to work in Europe"
                      fullWidth
                      InputProps={{ className: "text-[14px]" }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 12 }}>
                    <Typography className="text-[13px] font-semibold mb-1.5">
                      Advice
                    </Typography>
                    <TextField
                      multiline
                      rows={3}
                      defaultValue="German Nurse Opportunity and details shared with candidate"
                      fullWidth
                      InputProps={{ className: "text-[13px]" }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 12 }}>
                    <Typography className="text-[12px] font-semibold mb-1.5">
                      Resume
                    </Typography>
                    <Box
                      component="label"
                      className="w-full md:w-1/2 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-centerhover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <input
                        type="file"
                        hidden
                        accept=".pdf, .jpg, .jpeg"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setResumeFile(e.target.files[0]);
                          }
                        }}
                      />
                      {resumeFile ? (
                        <Box className="flex flex-col items-center text-center">
                          <i className="mdi--check-circle-outline text-green-500 mb-2" />
                          <Typography className="text-[13px] font-bold text-gray-800">
                            {resumeFile.name}
                          </Typography>
                          <Typography className="text-[11px] text-gray-500">
                            Click to change file
                          </Typography>
                        </Box>
                      ) : (
                        <Box className="flex flex-col items-center text-center">
                          <Box className="w-10 h-10 bg-[var(--mui-overlays-1)] border border-gray-200 rounded-full flex items-center justify-center mb-2 shadow-sm">
                            <i className="ri-upload-cloud-2-line text-xl text-[var(--mui-palette-primary-main)]"></i>
                          </Box>
                          <Typography className="text-xs font-semibold">
                            Drop your files here or{" "}
                            <span className="text-[var(--mui-palette-primary-main)] font-extrabold">
                              browse
                            </span>
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
                <Box className="flex justify-end gap-3 mt-4 pt-6">
                  <Button
                    variant="contained"
                    className="!bg-red-300 hover:!bg-red-400 !text-white !text-[13px] !font-bold !rounded-lg !normal-case"
                  >
                    Not Responded
                  </Button>
                  <Button
                    variant="contained"
                    className="!bg-blue-500 hover:!bg-blue-600 !text-white !text-[13px] !font-bold !rounded-lg !normal-case"
                  >
                    Send As Prescription
                  </Button>
                </Box>
              </Stack>
            </Card>

            {/* SECTION 3: ASSESSMENT */}
            <Card className="p-6 rounded-xl border border-gray-200 shadow-sm">
              <Typography className="text-[24px] text-center mb-5">
                Assessment
              </Typography>
              <Grid container spacing={5}>
                <Grid size={{ xs: 12, md: 12 }}>
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <RadioGroup row defaultValue="progress">
                      <FormControlLabel
                        value="not"
                        control={<Radio />}
                        label="Not Scheduled"
                      />
                      <FormControlLabel
                        value="progress"
                        control={<Radio />}
                        label="In Progress"
                      />
                      <FormControlLabel
                        value="done"
                        control={<Radio />}
                        label="Finished"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl>
                    <Typography>Visit Opinion</Typography>
                    <RadioGroup row defaultValue="office">
                      <FormControlLabel
                        value="office"
                        control={<Radio />}
                        label={<span className="">In-Office</span>}
                      />
                      <FormControlLabel
                        value="remote"
                        control={<Radio />}
                        label={<span className="">Remote</span>}
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth disabled>
                    <InputLabel>Branch</InputLabel>
                    <Select defaultValue="Siliguri" label="Branch">
                      <MenuItem value="Siliguri">Siliguri</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography className="text-[13px] font-medium mb-1.5">
                    Token No
                  </Typography>
                  <TextField fullWidth defaultValue="T001" />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography className="text-[13px] font-medium mb-1.5">
                    Token Generated
                  </Typography>
                  <TextField
                    fullWidth
                    defaultValue="25/02/2026 11:16 AM"
                    InputProps={{
                      startAdornment: (
                        <i className="mdi--access-time mr-2 text-gray-400" />
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 12 }}>
                  <Box className="flex justify-center md:justify-end gap-3 mt-2 mb-4">
                    <Button
                      variant="contained"
                      disabled
                      className="!bg-blue-300 !text-white !rounded-lg !normal-case !opacity-100"
                    >
                      Call for Assessment
                    </Button>
                    <Button
                      variant="contained"
                      className="!bg-blue-500 hover:!bg-blue-600 !rounded-lg !normal-case"
                    >
                      Queue for Assessment
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {/* DOCUMENTS */}
              <Box className="border border-gray-200 rounded-xl p-5 mb-2">
                <Typography className=" mb-2">Documents</Typography>
                <RadioGroup row>
                  <FormControlLabel
                    value="uploaded"
                    control={<Radio />}
                    label="Uploaded"
                  />
                  <FormControlLabel
                    value="verified"
                    control={<Radio />}
                    label="Verified"
                  />
                </RadioGroup>

                <Typography className="mt-4 mb-2">Applied Job Role</Typography>
                <RadioGroup row>
                  <FormControlLabel
                    value="nurse"
                    control={<Radio size="small" />}
                    label="Nurse"
                  />
                  <FormControlLabel
                    value="caregiver"
                    control={<Radio size="small" />}
                    label="Caregiver"
                  />
                </RadioGroup>

                <Box className="flex flex-wrap gap-3 mt-4 mb-5">
                  {["Resume", "Documents", "Experience", "Academic"].map(
                    (item) => (
                      <Button
                        key={item}
                        variant="contained"
                        size="small"
                        className="!bg-blue-300 hover:!bg-blue-400 !text-white !rounded-lg !normal-case !text-[12px]"
                      >
                        {item}
                      </Button>
                    ),
                  )}
                </Box>

                <Box className="flex justify-end gap-3">
                  <Button
                    variant="contained"
                    className="!bg-red-300 hover:!bg-red-400 !text-white !rounded-lg !normal-case"
                  >
                    Rejected
                  </Button>
                  <Button
                    variant="contained"
                    className="!bg-green-300 hover:!bg-green-400 !text-white !rounded-lg !normal-case"
                  >
                    Verified
                  </Button>
                </Box>
              </Box>

              {/* EXPERIENCE */}
              <Box className="border border-gray-200 rounded-xl p-5 mb-2">
                <Typography className=" mb-2">Experience</Typography>
                <RadioGroup row defaultValue="selected">
                  <FormControlLabel
                    value="selected"
                    control={<Radio />}
                    label="Selected"
                  />
                  <FormControlLabel
                    value="verified"
                    control={<Radio />}
                    label="Verified"
                  />
                </RadioGroup>
                <FormControl fullWidth className="mt-4 md:w-1/2">
                  <InputLabel>Experience Choosen</InputLabel>
                  <Select defaultValue="Domestic" label="Experience Choosen">
                    <MenuItem value="Domestic">Domestic</MenuItem>
                  </Select>
                </FormControl>
                <Box className="flex justify-end gap-3 mt-5">
                  <Button
                    variant="contained"
                    className="!bg-yellow-300 hover:!bg-yellow-400 !text-white !rounded-lg !normal-case"
                  >
                    TL Verified
                  </Button>
                  <Button
                    variant="contained"
                    className="!bg-green-300 hover:!bg-green-400 !text-white !rounded-lg !normal-case"
                  >
                    Save
                  </Button>
                </Box>
              </Box>

              {/* SUB-SECTION: ASSESSMENT FLOW */}
              <Card className="p-6 rounded-xl border border-gray-200 shadow-sm mt-4">
                <Typography className="text-[24px] text-center mb-5">
                  Assessment
                </Typography>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <RadioGroup row defaultValue="progress">
                    <FormControlLabel
                      value="not"
                      control={<Radio />}
                      label="Not Scheduled"
                    />
                    <FormControlLabel
                      value="progress"
                      control={<Radio />}
                      label="In Progress"
                    />
                    <FormControlLabel
                      value="done"
                      control={<Radio />}
                      label="Finished"
                    />
                  </RadioGroup>
                </FormControl>
                <Box className="flex justify-end gap-3 mt-4">
                  <Button variant="outlined">Refer Technical</Button>
                  <Button
                    variant="contained"
                    onClick={() => setCurrentView("assessment")}
                  >
                    Start
                  </Button>
                  <Button variant="contained" color="success">
                    Save
                  </Button>
                </Box>
              </Card>

              {/* SUB-SECTION: TECHNICAL ROUND */}
              <Box className="border border-gray-200 rounded-xl p-5 mt-4">
                <FormControl className="mb-4">
                  <Typography className="mb-2">Technical Round</Typography>
                  <RadioGroup row defaultValue="finished">
                    <FormControlLabel
                      value="referred"
                      control={<Radio />}
                      label={<span>Referred</span>}
                    />
                    <FormControlLabel
                      value="progress"
                      control={<Radio />}
                      label={<span>In Progress</span>}
                    />
                    <FormControlLabel
                      value="finished"
                      control={<Radio />}
                      label={<span>Finished</span>}
                    />
                  </RadioGroup>
                </FormControl>
                <FormControl fullWidth className="mb-5 md:w-1/2">
                  <InputLabel>Classify Experience</InputLabel>
                  <Select defaultValue="Domestic" label="Classify Experience">
                    <MenuItem value="Domestic">Domestic</MenuItem>
                    <MenuItem value="International">International</MenuItem>
                  </Select>
                </FormControl>
                <Box className="flex justify-end gap-3">
                  <Button
                    variant="contained"
                    className="!bg-green-300 hover:!bg-green-400 !text-white !rounded-lg !normal-case"
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            </Card>
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: PROGRESS CARD */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <Card className="p-5 sticky top-6 rounded-xl border border-gray-200 shadow-sm">
            <Typography className="text-[16px] font-semibold mb-4">
              Progress
            </Typography>
            <FormControl fullWidth className="mb-4">
              <InputLabel>Escalate</InputLabel>
              <Select label="Escalate">
                <MenuItem>-- Talent Acquisition Consultant --</MenuItem>
              </Select>
            </FormControl>
            <Typography className="text-[12px] text-[var(--mui-palette-error-light)] mb-4">
              NOTE: This will need approval of your manager.
            </Typography>
            <Box className="flex justify-center">
              <Button disabled variant="contained">
                Submit
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CandidateDetail;
