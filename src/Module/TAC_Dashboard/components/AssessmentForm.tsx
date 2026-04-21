import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

interface AssessmentFormProps {
  selectedCandidate: any;
  setCurrentView: (view: "dashboard" | "detail" | "assessment") => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  selectedCandidate,
  setCurrentView,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<any>({
    1: null,
    2: null,
    4: [],
    5: null,
    6: null,
    7: null,
    8: null,
    9: null,
    10: [],
    11: null,
  });

  const [languageLevels, setLanguageLevels] = useState<any>({
    english: {
      Listening: null,
      Speaking: null,
      Writing: null,
      Reading: null,
    },
    other: { Listening: null, Speaking: null, Writing: null, Reading: null },
  });

  const levels = ["L1", "L2", "L3", "L4"];
  const skills = ["Listening", "Speaking", "Writing", "Reading"];

  const levelScoreMap: any = { L1: 1, L2: 2, L3: 3, L4: 4 };

  const scoringSections = [
    {
      id: 1,
      title: "ACADEMIC QUALIFICATION",
      max: 10,
      bg: "bg-[#f3e8ff]",
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
      options: [
        { label: "Professional Certification / L7 (Recognized)", score: 10 },
        {
          label: "3 Years Diploma Course / L6 (Recognized)",
          score: 8,
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
    {
      id: 4,
      title: "GENERAL ABILITIES",
      max: 7,
      bg: "bg-[#f5f5dc]",
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
      options: [
        { label: "19 to 25 years", score: 10 },
        { label: "26 to 30 years", score: 7, selected: true },
        { label: "31 to 35 years", score: 5 },
        { label: "More than 35 years", score: 1 },
      ],
    },
    {
      id: 10,
      title: "EXISTING PROFESSIONAL LICENSE",
      max: 5,
      bg: "bg-[#f3e8ff]",
      options: [
        {
          label:
            "Has obtained any License to the profession from India / Foreign",
          score: 2.5,
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
      max: 8,
      bg: "bg-[#f3e8ff]",
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
        {
          label: "Applicant spouse family member is working in Abroad",
          score: 1,
        },
      ],
    },
  ];

  const totalScore = scoringSections.reduce((acc, section) => {
    const selected = selectedOptions[section.id];
    let score = 0;
    if (Array.isArray(selected)) {
      score = selected.reduce(
        (sum: number, idx: number) => sum + (section.options[idx]?.score || 0),
        0,
      );
    } else if (selected !== null && selected !== undefined) {
      score = section.options[selected]?.score || 0;
    }
    return acc + score;
  }, 0);

  const englishTotal: number = Object.values(languageLevels.english).reduce(
    (acc: number, lvl: any) => acc + (levelScoreMap[lvl] || 0),
    0,
  );

  const otherTotal: number = Object.values(languageLevels.other).reduce(
    (acc: number, lvl: any) => acc + (lvl ? 1 : 0),
    0,
  );

  const finalTotal = totalScore + englishTotal + otherTotal;

  return (
    <Box className="w-full min-h-screen p-4 md:p-8 text-gray-900">
      {/* Header */}
      <Box className="flex items-center gap-4 mb-8">
        <Button
          onClick={() => setCurrentView("detail")}
          variant="outlined"
          className="min-w-0 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
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
                      <Box
                        className={`flex justify-between px-4 py-2.5 border-t ${section.bg}`}
                      >
                        <Box className="flex gap-4 w-full">
                          <span className="w-8 text-[var(--mui-palette-primary-dark)]">
                            {section.id}
                          </span>
                          <span className="flex-1 uppercase font-semibold text-[var(--mui-palette-primary-dark)]">
                            LANGUAGE ABILITIES (2ND & 3RD LANGUAGES)
                          </span>
                        </Box>
                        <Box className="flex gap-10 min-w-[120px] justify-end">
                          <span className="text-gray-500 text-[11px]">Max</span>
                          <span className="text-gray-500 font-bold">20</span>
                        </Box>
                      </Box>

                      <Box className="px-4 py-1.5 bg-gray-50 border-b border-gray-200">
                        <Typography className="pl-8 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                          2nd Language (English)
                        </Typography>
                      </Box>

                      {skills.map((skill, i) => (
                        <Box
                          key={`eng-${i}`}
                          className="px-4 py-2 border-b border-gray-100 flex items-center justify-between hover:bg-[var(--mui-palette-primary-darkerOpacity)]"
                        >
                          <Typography className="pl-12 text-[13px] w-[200px]">
                            {skill}
                          </Typography>
                          <ToggleButtonGroup
                            exclusive
                            size="small"
                            className="flex-1 justify-end pr-10"
                            value={languageLevels.english[skill]}
                            onChange={(e, newValue) => {
                              setLanguageLevels((prev: any) => ({
                                ...prev,
                                english: {
                                  ...prev.english,
                                  [skill]:
                                    prev.english[skill] === newValue
                                      ? null
                                      : newValue,
                                },
                              }));
                            }}
                          >
                            {levels.map((lvl) => (
                              <ToggleButton
                                key={lvl}
                                value={lvl}
                                className="!text-[11px] !px-2 !py-1 !border !border-gray-200 [&.Mui-selected]:bg-[var(--mui-palette-primary-darkerOpacity)] [&.Mui-selected]:text-[var(--mui-palette-primary-light)]"
                              >
                                {lvl}
                              </ToggleButton>
                            ))}
                          </ToggleButtonGroup>
                          <Typography className="mr-3 text-[13px] w-6 text-center">
                            {" "}
                            {levelScoreMap[languageLevels.english[skill]] || 0}
                          </Typography>
                        </Box>
                      ))}

                      <Box className="px-4 py-1.5 bg-gray-50 border-b border-gray-200">
                        <Typography className="pl-8 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                          3rd Language (Arabic / German / Japanese)
                        </Typography>
                      </Box>

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
                            className="flex-1 justify-end pr-10"
                            value={languageLevels.other[skill]}
                            onChange={(e, newValue) => {
                              setLanguageLevels((prev: any) => ({
                                ...prev,
                                other: { ...prev.other, [skill]: newValue },
                              }));
                            }}
                          >
                            {levels.map((lvl) => (
                              <ToggleButton
                                key={lvl}
                                value={lvl}
                                className="!text-[11px] !px-2 !py-1 !border !border-gray-200 [&.Mui-selected]:bg-[var(--mui-palette-primary-darkerOpacity)] [&.Mui-selected]:text-[var(--mui-palette-primary-light)]"
                              >
                                {lvl}
                              </ToggleButton>
                            ))}
                          </ToggleButtonGroup>
                          <Typography className="mr-3 text-[13px] w-6 text-center">
                            {languageLevels.other[skill] ? 1 : 0}
                          </Typography>
                        </Box>
                      ))}
                    </>
                  )}

                  <Box
                    className={`flex justify-between px-4 py-2.5 border-t ${section.bg}`}
                  >
                    <Box className="flex gap-4 w-full">
                      <span className="w-8 text-[var(--mui-palette-primary-dark)]">
                        {section.id}
                      </span>
                      <span className="flex-1 uppercase font-semibold text-[var(--mui-palette-primary-dark)]">
                        {section.title}
                      </span>
                    </Box>
                    <Box className="flex gap-10 min-w-[120px] justify-end">
                      <span className="text-gray-500 text-[11px]">Max</span>
                      <span className="text-gray-500 font-bold">
                        {section.max}
                      </span>
                    </Box>
                  </Box>

                  {section.options.map((opt, i) => {
                    const isMulti = section.id === 4 || section.id === 10;
                    const isSelected = isMulti
                      ? selectedOptions[section.id]?.includes(i)
                      : selectedOptions[section.id] === i;

                    return (
                      <Box
                        key={i}
                        onClick={() => {
                          setSelectedOptions((prev: any) => {
                            if (isMulti) {
                              const prevArr = prev[section.id] || [];
                              return {
                                ...prev,
                                [section.id]: prevArr.includes(i)
                                  ? prevArr.filter((val: number) => val !== i)
                                  : [...prevArr, i],
                              };
                            } else {
                              return {
                                ...prev,
                                [section.id]: prev[section.id] === i ? null : i,
                              };
                            }
                          });
                        }}
                        className={`flex justify-between px-4 py-2 border-t cursor-pointer ${isSelected ? " bg-[var(--mui-palette-primary-darkerOpacity)]  " : "hover:bg-[var(--mui-palette-primary-lighterOpacity)]"}`}
                      >
                        <Typography className="text-[13px] pl-12 flex items-center gap-2">
                          {opt.label}
                        </Typography>
                        <Box className="flex items-center gap-12">
                          {isSelected && (
                            <i className="material-symbols--check-circle-outline text-blue-500 text-[18px]" />
                          )}
                          <Typography className="text-[13px] font-bold">
                            {opt.score}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </React.Fragment>
              );
            })}

            <Box className="px-4 py-4 flex justify-end gap-6">
              <Typography className="font-extrabold uppercase text-sm">
                Grand Total Score:
              </Typography>
              <Typography className="text-blue-600 font-extrabold text-lg">
                {finalTotal} / 100
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
};

export default AssessmentForm;
