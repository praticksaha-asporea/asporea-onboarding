"use client";

import { Box, Button, Card, CardContent, FormControl, FormControlLabel, FormLabel, Grid, IconButton, InputLabel, MenuItem, Radio, RadioGroup, Select, Stack, TextField, Typography } from "@mui/material";
import React, { useState } from "react";

const TACDashboard = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "detail" | "assessment"
  >("dashboard");

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

        {/* Layout */}
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
                    <TextField fullWidth  label="Passport No" />
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

              {/* Pre-Counselling */}
              <Card className="p-5 rounded-xl border border-gray-200 shadow-sm">
                <Typography className="text-[20px] font-bold text-center mb-5">
                  Pre-Counseling
                </Typography>

                <Stack spacing={3}>

                  {/* Status */}
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <RadioGroup row defaultValue="not">
                      <FormControlLabel value="not" control={<Radio />} label="Not Scheduled" />
                      <FormControlLabel value="progress" control={<Radio />} label="In Progress" />
                      <FormControlLabel value="done" control={<Radio />} label="Finished" />
                    </RadioGroup>
                  </FormControl>

                  {/* Visit + Branch */}
                  <Grid container spacing={2}>
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
                      <TextField fullWidth  label="Branch" disabled value="Siliguri" />
                    </Grid>
                  </Grid>

                  {/* Token */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth  label="Token No" defaultValue="T001" />
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
                  </Grid>

                  {/* Actions */}
                  <Box className="flex justify-end gap-3">
                    <Button disabled variant="contained">Call</Button>
                    <Button variant="contained">Queue</Button>
                  </Box>

                </Stack>
              </Card>

              {/* Assessment */}
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

            </Stack>
          </Grid>

          {/* RIGHT */}
          <Grid size={{ xs: 12, lg: 3 }}>
            <Card className="p-5 sticky top-6 rounded-xl border border-gray-200 shadow-sm">
              <Typography className="text-[16px] font-semibold mb-4">
                Progress
              </Typography>

              <FormControl fullWidth  className="mb-4">
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
            className="min-w-0 p-2 rounded-lg bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <i className="mdi--arrow-back text-gray-600"/>
          </Button>

          <Typography className="text-[22px] font-bold">
            Assessment Form
          </Typography>
        </Box>

        {/* MAIN CARD */}
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
                <TextField fullWidth  defaultValue="H234566Y" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography className="text-[11px] font-bold mb-1 uppercase">
                  Date of Assessment
                </Typography>
                <TextField fullWidth  defaultValue="11/11/2026" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography className="text-[11px] font-bold mb-1 uppercase">
                  Assessment No.
                </Typography>
                <TextField fullWidth  defaultValue="ASF-2015-1021" />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Typography className="text-[11px] font-bold mb-1 uppercase">
                  Assessed By
                </Typography>
                <TextField fullWidth  defaultValue="Mason Lee" />
              </Grid>
            </Grid>

            {/* SCORE TABLE */}
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

              {/* LOOP */}
              {scoringSections.map((section) => (
                <Box key={section.id}>

                  {/* SECTION HEADER */}
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

                  {/* OPTIONS */}
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
                </Box>
              ))}

              {/* TOTAL */}
              <Box className="px-4 py-4 flex justify-end gap-6">
                <Typography className="font-extrabold uppercase text-sm">
                  Grand Total Score:
                </Typography>
                <Typography className="text-blue-600 font-extrabold text-lg">
                  78 / 100
                </Typography>
              </Box>
            </Box>

            {/* NOTES */}
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

            {/* FILE UPLOAD INSTEAD OF SIGNATURE */}
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
        <table className="w-full text-left border-collapse whitespace-nowrap">

          <thead>
            <tr className="text-[13px]">
              {[
                "Candidate Name",
                "Application Stage",
                "Token",
                "Status",
                "Last Activity",
                "Actions",
              ].map((head, i) => (
                <th
                  key={i}
                  className={`py-4 px-4 font-semibold border-b border-gray-200 text-[var(--mui-palette-secondary-main)] ${head === "Status" ? "text-center" : ""
                    } ${head === "Actions" ? "text-right" : ""}`}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-[14px]">
            {filteredCandidates.map((candidate, index) => (
              <tr
                key={index}
                onClick={() => {
                  setSelectedCandidate(candidate);
                  setCurrentView("detail");
                }}
                className="border-b border-gray-100 hover:bg-[var(--mui-palette-primary-darkerOpacity)] cursor-pointer transition text-[var(--mui-palette-secondary-main)]"
              >

                <td className="py-3 px-4">
                  <Typography className="font-semibold text-[13px]">
                    {candidate.name}
                  </Typography>
                  <Typography className="text-[12px]">
                    {candidate.id}
                  </Typography>
                </td>

                <td className="py-3 px-4">
                  {candidate.stage}
                </td>

                <td className="py-3 px-4">
                  {candidate.token}
                </td>

                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-3 py-1.5 rounded-full text-[12px] font-semibold ${getBadgeStyle(
                      candidate.status
                    )}`}
                  >
                    {candidate.status}
                  </span>
                </td>

                <td className="py-3 px-4 text-[13px]">
                  {candidate.time}
                </td>

                <td className="py-3 px-4">
                  <Box className="flex justify-end gap-3">
                    <IconButton > <i className="material-symbols-light--chat-bubble-outline"/></IconButton>
                    <IconButton ><i className="material-symbols-light--mail-outline"></i></IconButton>
                    <IconButton ><i className="mdi--user"></i></IconButton>
                  </Box>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default TACDashboard;
