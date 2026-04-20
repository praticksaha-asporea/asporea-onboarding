"use client";

import { Box, Button, Card, CardContent, FormControl, FormControlLabel, FormLabel, Grid, IconButton, InputLabel, MenuItem, Paper, Radio, RadioGroup, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import React, { useState } from "react";

const TACDashboard = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "detail" | "assessment"
  >("dashboard");
  const levels = ["L1", "L2", "L3", "L4"];
  const skills = ["Listening", "Speaking", "Writing", "Reading"];

  const candidates = [
    {
      name: "Alina Smith",
      id: "ASP-INQ-2154",
      stage: "Inquired",
      token: "Yes",
      status: "Waiting For Pre-Counselling",
      time: "2 hours ago",
    },
    {
      name: "John Smith",
      id: "ASP-INQ-2155",
      stage: "Inquired",
      token: "No",
      status: "Pre-Counselling Scheduled",
      time: "1 day ago",
    },
    {
      name: "David Jackson",
      id: "ASP-INQ-2156",
      stage: "Inquired",
      token: "No",
      status: "Counselled",
      time: "3 days ago",
    },
    {
      name: "Brian Taylor",
      id: "ASP-INQ-2157",
      stage: "Document Upload",
      token: "No",
      status: "Counselled",
      time: "5 days ago",
    },
    {
      name: "Jacob Martinez",
      id: "ASP-INQ-2158",
      stage: "Experience",
      token: "No",
      status: "Counselled",
      time: "1 week ago",
    },
    {
      name: "Anthony Moore",
      id: "ASP-INQ-2159",
      stage: "Assessment",
      token: "Yes",
      status: "Waiting For Assessment",
      time: "2 days ago",
    },
  ];

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "Waiting For Pre-Counselling":
        return "bg-blue-100 text-blue-600";
      case "Pre-Counselling Scheduled":
        return "bg-blue-200 text-blue-700";
      case "Counselled":
        return "bg-green-500 text-white";
      case "Waiting For Assessment":
        return "bg-blue-100 text-blue-600";
      case "Document Verified":
        return "bg-green-500 text-white";
      case "Experience Verified":
        return "bg-orange-400 text-white";
      case "Assessed":
        return "bg-green-500 text-white";
      case "Technical Round":
        return "bg-gray-800 text-white";
      case "Documents Rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const scoringSections = [
    {
      id: 1,
      title: "ACADEMIC QUALIFICATION",
      max: 10,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        {
          label: "Post Graduate Certificate / Diploma / Master Degree",
          score: 10,
          selected: true,
        },
        {
          label: "3 Years Honours Undergraduate Degree / 4 Years Degree",
          score: 7,
        },
        { label: "3 Years Undergraduate Degree", score: 6 },
        { label: "Higher / Senior Secondary Education", score: 5 },
        { label: "Secondary School Education", score: 3 },
      ],
    },
    {
      id: 2,
      title: "PROFESSIONAL QUALIFICATION",
      max: 10,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        { label: "Professional Certification / L7 (Recognized)", score: 10 },
        {
          label: "3 Years Diploma Course / L6 (Recognized)",
          score: 9,
          selected: true,
        },
        { label: "2 Years Diploma Course / L4/L5 (Recognized)", score: 7 },
        { label: "ITI  /Trade Certificate / L1/L2 [Recognized]", score: 4 },
        {
          label: "Certificate Course / Skill Development (Recognized)",
          score: 2,
        },
      ],
    },
    // ID 3 is Language Abilities, handled explicitly in JSX for the complex UI
    {
      id: 4,
      title: "GENERAL ABILITIES",
      max: 7,
      bg: "bg-[#f5f5dc]",
      text: "text-yellow-900",
      options: [
        { label: "Communication Skills", score: 4, selected: true },
        { label: "Personality & Confidence", score: 3 },
      ],
    },
    {
      id: 5,
      title: "WORK EXPERIENCE (RELEVANT)",
      max: 10,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        { label: "Six years or more", score: 10 },
        { label: "Four to Five years", score: 7, selected: true },
        { label: "Two to Three years", score: 5 },
        { label: "One year", score: 3 },
      ],
    },
    {
      id: 6,
      title: "ABROAD WORK EXPERIENCE",
      max: 10,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        { label: "Six years or more", score: 10 },
        { label: "Two to Three years", score: 5, selected: true },
        { label: "One year", score: 3 },
      ],
    },
    {
      id: 7,
      title: "STABILITY (DURATION AT SINGLE EMPLOYER)",
      max: 5,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        { label: "Has worked in one employer for more than 5 years", score: 5 },
        {
          label: "Has worked in one employer for 2 to 5 years",
          score: 4,
          selected: true,
        },
        { label: "Has worked in one employer for 2 years", score: 3 },
      ],
    },
    {
      id: 8,
      title: "CAREER INITIATIVE",
      max: 5,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        {
          label: "Changed employment in same industry in last three employment",
          score: 4,
          selected: true,
        },
        {
          label: "Changed employment in same industry in last two employment",
          score: 3,
        },
      ],
    },
    {
      id: 9,
      title: "AGE BRACKET",
      max: 10,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        { label: "18 to 25 years", score: 10 },
        { label: "26 to 30 years", score: 7, selected: true },
        { label: "31 to 35 years", score: 5 },
        { label: "More than 36 years", score: 1 },
      ],
    },
    {
      id: 10,
      title: "EXISTING PROFESSIONAL LICENSE",
      max: 8,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        {
          label:
            "Has obtained any License to the profession from India / Foreign",
          score: 3.5,
        },
        {
          label: "Has obtained Driving License from Foreign Country",
          score: 2.5,
          selected: true,
        },
      ],
    },
    {
      id: 11,
      title: "ADAPTABILITY & MOBILITY",
      max: 6,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        {
          label:
            "Applicant has a minimum of 1 year skilled Work experience in Abroad",
          score: 2,
          selected: true,
        },
        {
          label: "Applicant spouse is working in Abroad",
          score: 1,
          selected: true,
        },
        { label: "Applicant family member is working in Abroad", score: 1 },
      ],
    },
  ];



  if (currentView === "detail" && selectedCandidate) {
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
                    <TextField
                      fullWidth

                      label="Phone Number *"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                    <TextField
                      fullWidth

                      label="WhatsApp Number"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6, sm: 12 }}>
                    <FormControl fullWidth >
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
                    <FormControl fullWidth >
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
                      {/* Status */}
                      <FormControl>
                        <FormLabel>Status</FormLabel>
                        <RadioGroup row defaultValue="not">
                          <FormControlLabel value="not" control={<Radio />} label="Not Scheduled" />
                          <FormControlLabel value="progress" control={<Radio />} label="In Progress" />
                          <FormControlLabel value="done" control={<Radio />} label="Finished" />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    {/* Visit + Branch */}
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
                      <TextField fullWidth label="Branch" disabled value="Siliguri" />
                    </Grid>
                    {/* Hear From & Referred By */}
                    <Grid size={{ xs: 12, md: 6 }}>

                      {/* Hear From */}
                      <FormControl fullWidth>
                        <InputLabel>
                          Hear From
                        </InputLabel>
                        <Select
                          label="Hear From"
                          defaultValue="PCRA"
                          // className="text-[13px]"
                          disabled
                        >
                          <MenuItem value="PCRA">PCRA</MenuItem>
                          <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                          <MenuItem value="Referral">Referral</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {/* Referred By */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth disabled>
                        <InputLabel>
                          Referred By
                        </InputLabel>
                        <Select
                          label="Referred By"
                          defaultValue="PCRA"
                        // className="text-[13px]"
                        >
                          <MenuItem value="PCRA">PCRA</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Token */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth label="Token No" defaultValue="T001" />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth

                        label="Token Generated"
                        InputProps={{
                          // startAdornment: (
                          //   <AccessTime font className="mr-2 text-gray-400" />
                          // ),
                        }}
                      />
                    </Grid>

                    {/* Actions */}
                    <Grid size={{ xs: 12, md: 12 }}>
                      <Box className="flex justify-end gap-3">
                        <Button disabled variant="contained">Call</Button>
                        <Button variant="contained">Queue</Button>
                      </Box>

                    </Grid>

                    {/* Textareas */}

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography className="text-[13px] font-semibold mb-1.5">
                        Additional Details of Candidate <span className="text-[var(--mui-palette-error-light)]">*</span>
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
                  {/* Bottom Actions */}
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
                        <FormControlLabel value="not" control={<Radio />} label="Not Scheduled" />
                        <FormControlLabel value="progress" control={<Radio />} label="In Progress" />
                        <FormControlLabel value="done" control={<Radio />} label="Finished" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  {/* Visit Opinion & Branch */}
                  <Grid size={{ xs: 12, md: 6 }}>

                    <FormControl>
                      <Typography>
                        Visit Opinion
                      </Typography>

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
                        startAdornment: <i className="mdi--access-time mr-2 text-gray-400" />
                      }}
                    />
                  </Grid>


                  {/* Assessment Actions */}
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

                  <Typography className=" mb-2">
                    Documents
                  </Typography>

                  <RadioGroup row>
                    <FormControlLabel value="uploaded" control={<Radio />} label="Uploaded" />
                    <FormControlLabel value="verified" control={<Radio />} label="Verified" />
                  </RadioGroup>

                  {/* Applied Role */}
                  <Typography className="mt-4 mb-2">
                    Applied Job Role
                  </Typography>

                  <RadioGroup row>
                    <FormControlLabel value="nurse" control={<Radio size="small" />} label="Nurse" />
                    <FormControlLabel value="caregiver" control={<Radio size="small" />} label="Caregiver" />
                  </RadioGroup>

                  {/* Action Chips */}
                  <Box className="flex flex-wrap gap-3 mt-4 mb-5">
                    {["Resume", "Documents", "Experience", "Academic"].map((item) => (
                      <Button
                        key={item}
                        variant="contained"
                        // size="small"
                        className="!bg-blue-300 hover:!bg-blue-400 !text-white !rounded-lg !normal-case !text-[12px]"
                      >
                        {item}
                      </Button>
                    ))}
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

                  <Typography className=" mb-2">
                    Experience
                  </Typography>

                  <RadioGroup row defaultValue="selected">
                    <FormControlLabel value="selected" control={<Radio />} label="Selected" />
                    <FormControlLabel value="verified" control={<Radio />} label="Verified" />
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
                <Card className="p-6 rounded-xl border border-gray-200 shadow-sm">
                  <Typography className="text-[24px] text-center mb-5">
                    Assessment
                  </Typography>

                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <RadioGroup row defaultValue="progress">
                      <FormControlLabel value="not" control={<Radio />} label="Not Scheduled" />
                      <FormControlLabel value="progress" control={<Radio />} label="In Progress" />
                      <FormControlLabel value="done" control={<Radio />} label="Finished" />
                    </RadioGroup>
                  </FormControl>

                  <Box className="flex justify-end gap-3 mt-4">
                    <Button variant="outlined">Refer Technical</Button>
                    <Button variant="contained" onClick={() => setCurrentView("assessment")}>
                      Start
                    </Button>
                    <Button variant="contained" color="success">
                      Save
                    </Button>
                  </Box>
                </Card>

                {/* SUB-SECTION: TECHNICAL ROUND */}
                <Box className="border border-gray-200 rounded-xl p-5">

                  {/* Technical Round */}
                  <FormControl className="mb-4">
                    <Typography className="mb-2">
                      Technical Round
                    </Typography>

                    <RadioGroup row defaultValue="finished">
                      <FormControlLabel
                        value="referred"
                        control={<Radio />}
                        label={<span>Referred</span>}
                      />
                      <FormControlLabel
                        value="progress"
                        control={<Radio />}
                        label={<span >In Progress</span>}
                      />
                      <FormControlLabel
                        value="finished"
                        control={<Radio />}
                        label={<span>Finished</span>}
                      />
                    </RadioGroup>
                  </FormControl>

                  {/* Dropdown */}
                  <FormControl fullWidth className="mb-5 md:w-1/2">
                    <InputLabel>Classify Experience</InputLabel>
                    <Select defaultValue="Domestic" label="Classify Experience">
                      <MenuItem value="Domestic">Domestic</MenuItem>
                      <MenuItem value="International">International</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Action */}
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
  }

  if (currentView === "assessment") {
    return (
      <Box className="w-full min-h-screen p-4 md:p-8 text-gray-900">

        {/* Header */}
        <Box className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => setCurrentView("detail")}
            variant="outlined"
            className="min-w-0 p-2  bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <i className="mdi--arrow-back text-gray-600" />
          </Button>

          <Typography className="text-[22px] font-bold">
            Assessment Form
          </Typography>
        </Box>


        <Card className="rounded-xl border border-gray-200 shadow-sm">
          <CardContent className="p-6 md:p-8">

            {/* TOP INPUTS */}
            <Grid container spacing={3} className="mb-8">
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography className="text-[11px] font-bold mb-1 uppercase">
                  Name of Candidate
                </Typography>
                <TextField
                  fullWidth

                  defaultValue={selectedCandidate?.name || "Jonathan Doe"}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography className="text-[11px] font-bold mb-1 uppercase">
                  Passport No.
                </Typography>
                <TextField fullWidth defaultValue="H234566Y" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography className="text-[11px] font-bold mb-1 uppercase">
                  Date of Assessment
                </Typography>
                <TextField fullWidth defaultValue="11/11/2026" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography className="text-[11px] font-bold mb-1 uppercase">
                  Assessment No.
                </Typography>
                <TextField fullWidth defaultValue="ASF-2015-1021" />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Typography className="text-[11px] font-bold mb-1 uppercase">
                  Assessed By
                </Typography>
                <TextField fullWidth defaultValue="Mason Lee" />
              </Grid>
            </Grid>

            <Box className="border border-gray-200 rounded-xl overflow-hidden mb-10">

              {/* HEADER */}
              <Box className="flex justify-between px-4 py-3 text-[11px] font-bold text-[var(--mui-palette-text-primary)] uppercase">
                <Box className="flex gap-4 w-full">
                  <span className="w-8">S.N</span>
                  <span className="flex-1">Factor / Criteria</span>
                </Box>
                <Box className="flex gap-10 min-w-[120px] justify-end">
                  <span>Score</span>
                  <span>Final</span>
                </Box>
              </Box>

              {scoringSections.map((section) => {
                const isLanguagePos = section.id === 4;

                return (
                  <React.Fragment key={section.id}>
                    {isLanguagePos && (
                      <>
                        {/* SECTION HEADER */}

                        <Box className={`flex justify-between px-4 py-2.5 border-t ${section.bg}`}>
                          <Box className="flex gap-4 w-full">
                            <span className="w-8 text-[var(--mui-palette-primary-dark)]">{section.id}</span>
                            <span className="flex-1 uppercase font-semibold text-[var(--mui-palette-primary-dark)]">
                              LANGUAGE ABILITIES (2ND & 3RD LANGUAGES)
                            </span>
                          </Box>

                          <Box className="flex gap-10 min-w-[120px] justify-end">
                            <span className="text-gray-500 text-[11px]">Max</span>
                            <span className="text-gray-500 font-bold">
                              20
                            </span>
                          </Box>
                        </Box>
                        {/* <Box className="flex items-center justify-between bg-orange-100 px-4 py-2.5 border-b border-gray-200">

                          <Box className="flex gap-4 w-full items-center text-orange-900">
                            <Typography className="w-8 text-[13px] font-bold">3</Typography>

                            <Typography className="flex-1 flex items-center gap-2 text-[13px] font-bold uppercase">
                              LANGUAGE ABILITIES (2ND & 3RD LANGUAGES)
                              <IconButton size="small">
                                <i className=" mdi--help-circle-outline text-blue-600" />
                              </IconButton>
                            </Typography>
                          </Box>

                          <Box className="flex gap-10 min-w-[120px] justify-end pr-2">
                            <Typography className="text-gray-500 text-[11px] font-medium">
                              Max.
                            </Typography>
                            <Typography className="w-6 text-center text-gray-900 text-[13px] font-bold">
                              20
                            </Typography>
                          </Box>

                        </Box> */}

                        {/* SUB HEADER */}
                        <Box className="px-4 py-1.5 bg-gray-50 border-b border-gray-200">
                          <Typography className="pl-8 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                            2nd Language (English)
                          </Typography>
                        </Box>

                        {/* ROWS */}
                        {skills.map((skill, i) => (
                          <Box
                            key={`eng-${i}`}
                            className="px-4 py-2 border-b border-gray-100 flex items-center justify-between hover:bg-[var(--mui-palette-primary-darkerOpacity)]"
                          >
                            <Typography className="pl-12 text-[13px] w-[200px]">
                              {skill}
                            </Typography>

                            {/* LEVEL SELECT */}
                            <ToggleButtonGroup
                              exclusive
                              size="small"
                              className="flex-1 justify-end pr-10"
                              value={
                                skill === "Writing" ? "L3" : "L4" // default logic
                              }
                            >
                              {levels.map((lvl) => (
                                <ToggleButton
                                  key={lvl}
                                  value={lvl}
                                  className="
                                  !text-[11px] !px-2 !py-1 
                                  !border !border-gray-200 
                                  [&.Mui-selected]:bg-[var(--mui-palette-primary-darkerOpacity)] 
                                  [&.Mui-selected]:text-[var(--mui-palette-primary-light)]
                                "
                                >
                                  {lvl}
                                </ToggleButton>
                              ))}
                            </ToggleButtonGroup>

                            {/* SCORE */}
                            <Typography className="mr-3 text-[13px] w-6 text-center">
                              {skill === "Writing" ? "3" : "4"}
                            </Typography>
                          </Box>
                        ))}

                        {/* SUB HEADER */}
                        <Box className="px-4 py-1.5 bg-gray-50 border-b border-gray-200">
                          <Typography className="pl-8 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                            3rd Language (Arabic / German / Japanese)
                          </Typography>
                        </Box>

                        {/* ROWS */}
                        {skills.map((skill, i) => (
                          <Box
                            key={`oth-${i}`}
                            className="px-4 py-2 border-b border-gray-100 flex items-center justify-between hover:bg-[var(--mui-palette-primary-darkerOpacity)]"
                          >
                            <Typography className="pl-12 text-[13px] w-[200px]">
                              {skill}
                            </Typography>

                            <ToggleButtonGroup
                              exclusive
                              size="small"
                              value="L1"
                              className="flex-1 justify-end pr-10"
                            >
                              {levels.map((lvl) => (
                                <ToggleButton
                                  key={lvl}
                                  value={lvl}
                                  className="
                                  !text-[11px] !px-2 !py-1 
                                  !border !border-gray-200 
                                  [&.Mui-selected]:bg-[var(--mui-palette-primary-darkerOpacity)] 
                                  [&.Mui-selected]:text-[var(--mui-palette-primary-light)]
                                "
                                >
                                  {lvl}
                                </ToggleButton>
                              ))}
                            </ToggleButtonGroup>

                            <Typography className="mr-3 text-[13px] w-6 text-center">
                              1
                            </Typography>
                          </Box>
                        ))}
                      </>
                    )}

                    <Box className={`flex justify-between px-4 py-2.5 border-t ${section.bg}`}>
                      <Box className="flex gap-4 w-full">
                        <span className="w-8 text-[var(--mui-palette-primary-dark)]">{section.id}</span>
                        <span className="flex-1 uppercase font-semibold text-[var(--mui-palette-primary-dark)]">
                          {section.title}
                        </span>
                      </Box>

                      <Box className="flex gap-10 min-w-[120px] justify-end">
                        <span className="text-gray-500 text-[11px]">Max</span>
                        <span className="text-gray-500 font-bold">
                          {section.options.find(o => o.selected)?.score || "-"}
                        </span>
                      </Box>
                    </Box>


                    {section.options.map((opt, i) => (
                      <Box
                        key={i}
                        className={`flex justify-between px-4 py-2 border-t cursor-pointer ${opt.selected ? "bg-[var(--mui-palette-primary-lighterOpacity)]" : "hover:bg-[var(--mui-palette-primary-darkerOpacity)]"
                          }`}
                      >
                        <Typography className="text-[13px] pl-12">
                          {opt.label}
                        </Typography>

                        <Typography className="text-[13px] font-bold">
                          {opt.score}
                        </Typography>
                      </Box>
                    ))}
                  </React.Fragment>
                );
              })}

              <Box className="px-4 py-4 flex justify-end gap-6">
                <Typography className="font-extrabold uppercase text-sm">
                  Grand Total Score:
                </Typography>
                <Typography className="text-blue-600 font-extrabold text-lg">
                  78 / 100
                </Typography>
              </Box>
            </Box>

            <Box className="mb-10">
              <Typography className="text-[14px] font-bold mb-4">
                Additional Assessment Notes
              </Typography>
              <Grid container spacing={3}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid size={{ xs: 12, md: 6 }} key={i}>
                    <Card className="border border-gray-200 shadow-sm">
                      <CardContent>
                        <Typography className="text-[11px] font-bold mb-2 uppercase">
                          Note {i}
                        </Typography>
                        <TextField
                          multiline
                          rows={4}
                          fullWidth
                          defaultValue=""
                          placeholder="Sample Note... "
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* SIGNATURES & SUBMIT */}
            {/* Use fILE UPLOAD Intead Signature manual */}
            <Box className="flex flex-col md:flex-row justify-between items-end gap-10">

              <Box className="flex w-full md:w-[60%] gap-6">
                {["Candidate Signature", "Assessor Signature"].map((label) => (
                  <Box
                    key={label}
                    className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer"
                  >
                    <input type="file" className="hidden" />
                    <Typography className="text-[11px] text-gray-400 uppercase mt-4">
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Button
                variant="contained"
                className="bg-green-500 hover:bg-green-600 px-10 py-3 font-bold tracking-widest"
              >
                SUBMIT
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="w-full rounded-[20px] shadow-[0px_4px_18px_rgba(0,0,0,0.04)] border border-gray-200 p-6 md:p-8 font-sans text-gray-900">

      {/* HEADER */}
      <Box className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <Typography className="text-[28px] font-medium tracking-tight">
          TAC Assignment Dashboard
        </Typography>
      </Box>

      {/* KPI */}
      <Typography className="text-[19px] font-semibold mb-5">
        Key Performance Indicators
      </Typography>

      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        {[
          { title: "Open Cases", value: 7, desc: "Candidates actively managed" },
          { title: "Pending Pre-Counselling", value: 4, desc: "Currently undergoing pre-counselling" },
          { title: "Pending Assessments", value: 3, desc: "Documents or experience checks" },
          { title: "Upcoming Counselling", value: 1, desc: "Scheduled sessions this week" },
        ].map((item, i) => (
          <Card key={i} className="rounded-xl border border-gray-200 shadow-sm">
            <CardContent className="p-5 flex flex-col justify-between">
              <Typography className="text-[13px] font-semibold mb-3">
                {item.title}
              </Typography>

              <Typography className="text-[36px] font-bold leading-none mb-2">
                {item.value}
              </Typography>

              <Typography className="text-[12px]">
                {item.desc}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* TITLE */}
      <Typography className="text-[19px] font-bold mb-5">
        Assigned Candidates
      </Typography>

      {/* SEARCH + FILTER */}
      <Box className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">

        <TextField
          fullWidth
          placeholder="Search candidate by name/ inquiry id..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}

          className="md:w-[400px]"
          InputProps={{
            className:
              "rounded-lg text-[14px]",
          }}
        />

        <Box className="flex gap-3 w-full md:w-auto">

          <Select

            displayEmpty
            className="w-full md:w-auto text-[12px] rounded-lg"
          >
            <MenuItem value="">Filter by Stage</MenuItem>
          </Select>

          <Select

            displayEmpty
            className="w-full md:w-auto text-[12px] rounded-lg"
          >
            <MenuItem value="">Filter by Experience</MenuItem>
          </Select>

        </Box>
      </Box>

      {/* TABLE */}
      <Box className="overflow-x-auto w-full border-gray-200 pt-2">
        <TableContainer component={Paper} className="mt-2 shadow-none border border-gray-200">
          <Table size="small">

            {/* HEADER */}
            <TableHead>
              <TableRow className="">
                {[
                  "Candidate Name",
                  "Application Stage",
                  "Token",
                  "Status",
                  "Last Activity",
                  "Actions",
                ].map((head, i) => (
                  <TableCell
                    key={i}
                    className={`py-4 px-4 font-semibold border-b border-gray-200 text-[var(--mui-palette-secondary-main)] ${head === "Status" ? "text-center" : ""
                      } ${head === "Actions" ? "text-right" : ""}`}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            {/* BODY */}
            <TableBody>
              {filteredCandidates.map((candidate, index) => (
                <TableRow
                  key={index}
                  hover
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setCurrentView("detail");
                  }}
                  className="cursor-pointer"
                >

                  {/* Name */}
                  <TableCell className="!py-3 !px-4">
                    <Typography className="font-semibold text-[13px]">
                      {candidate.name}
                    </Typography>
                    <Typography className="text-[12px] text-gray-500">
                      {candidate.id}
                    </Typography>
                  </TableCell>

                  {/* Stage */}
                  <TableCell className="!py-3 !px-4">
                    {candidate.stage}
                  </TableCell>

                  {/* Token */}
                  <TableCell className="!py-3 !px-4">
                    {candidate.token}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="!py-3 !px-4 text-center">
                    <Box
                      className={`inline-block px-3 py-1.5 rounded-full text-[12px] font-semibold ${getBadgeStyle(
                        candidate.status
                      )}`}
                    >
                      {candidate.status}
                    </Box>
                  </TableCell>

                  {/* Time */}
                  <TableCell className="!py-3 !px-4 text-[13px]">
                    {candidate.time}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="!py-3 !px-4">
                    <Box className="flex justify-end gap-2">
                      <IconButton size="small">
                        <i className="material-symbols-light--chat-bubble-outline" />
                      </IconButton>
                      <IconButton size="small">
                        <i className="material-symbols-light--mail-outline" />
                      </IconButton>
                      <IconButton size="small">
                        <i className="mdi--user" />
                      </IconButton>
                    </Box>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default TACDashboard;