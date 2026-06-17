import React, { useState, useEffect } from "react";
import { Box, Card, CardContent } from "@mui/material";

// Sub-components Imports
import AssessmentBasicInfo from "./AssessmentBasicInfo";
import AssessmentScoringTable from "./AssessmentScoringTable";
import AssessmentNotes from "./AssessmentNotes";
import AssessmentSignatures from "./AssessmentSignatures";

interface AssessmentFormProps {
  selectedCandidate: any
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  selectedCandidate
}) => {
  // useEffect(() => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }, []);

  const [candidateSignature, setCandidateSignature] = useState<File | null>(null);
  const [assessorSignature, setAssessorSignature] = useState<File | null>(null);
  
  const [selectedOptions, setSelectedOptions] = useState<any>({
    1: null, 2: null, 4: [], 5: null, 6: null, 7: null, 8: null, 9: null, 10: [], 11: [],
  });

  const [languageLevels, setLanguageLevels] = useState<any>({
    english: { Listening: null, Speaking: null, Writing: null, Reading: null },
    other: { Listening: null, Speaking: null, Writing: null, Reading: null },
  });

  const levels = ["L1", "L2", "L3", "L4"];
  const skills = ["Listening", "Speaking", "Writing", "Reading"];
  const levelScoreMap: any = { L1: 1, L2: 2, L3: 3, L4: 4 };

  const scoringSections = [
    {
      id: 1, title: "ACADEMIC QUALIFICATION", max: 10, bg: "bg-[#f3e8ff]",
      options: [
        { label: "Post Graduate Certificate / Diploma / Master Degree", score: 10, selected: true },
        { label: "3 Years Honours Undergraduate Degree / 4 Years Degree", score: 7 },
        { label: "3 Years Undergraduate Degree", score: 6 },
        { label: "Higher / Senior Secondary Education", score: 5 },
        { label: "Secondary School Education", score: 3 },
      ],
    },
    {
      id: 2, title: "PROFESSIONAL QUALIFICATION", max: 10, bg: "bg-[#f3e8ff]",
      options: [
        { label: "Professional Certification / L7 [Recognized]", score: 10 },
        { label: "3 Years Diploma Course / L6 [Recognized]", score: 8, selected: true },
        { label: "2 Years Diploma Course / L4/L5 [Recognized]", score: 7 },
        { label: "ITI  /Trade Certificate / L1/L2 [Recognized]", score: 4 },
        { label: "Diploma Course [Recognzied/Non-recognized]", score: 3 },
        { label: "Certificate Course / Skill Development Course [Recognized/Non-recognized]", score: 2 },
        { label: "Others:" }
      ],
    },
    {
      id: 4, title: "GENERAL ABILITIES", max: 7, bg: "bg-[#f5f5dc]",
      options: [
        { label: "Communication Skills", score: 4, selected: true },
        { label: "Personality", score: 3 },
      ],
    },
    {
      id: 5, title: "WORK EXPERIENCE (RELEVANT TO ACADEMIC/PROFESSIONAL QUALIFICATION)", max: 10, bg: "bg-[#f3e8ff]",
      options: [
        { label: "One year", score: 3 },
        { label: "Two to Three years", score: 5 },
        { label: "Four to Five years", score: 7, selected: true },
        { label: "Six years or more", score: 10 },
      ],
    },
    {
      id: 6, title: "ABROAD WORK EXPERIENCE (RELEVENCE TO ACAMEDIC/PROFESSIONAL QUALIFICATION)", max: 10, bg: "bg-[#f3e8ff]",
      options: [
        { label: "One year", score: 3 },
        { label: "Two to Three years", score: 5, selected: true },
        { label: "Four to five years", score: 7 },
        { label: "Six years or more", score: 10 },
      ],
    },
    {
      id: 7, title: "STABILITY ", max: 5, bg: "bg-[#f3e8ff]",
      options: [
        { label: "Has worked in one employer for 2 years", score: 3 },
        { label: "Has worked in one employer for 2 to 5 years", score: 4, selected: true },
        { label: "Has worked in one employer for more than 5 years", score: 5 },
      ],
    },
    {
      id: 8, title: "CAREER INITIATIVE  (EACH EMPLOYMENT MUST BE MORE THAN 12 MONTHS PERIOD)", max: 5, bg: "bg-[#f3e8ff]",
      options: [
        { label: " Has Changed employment in same industry in last two employment", score: 3 },
        { label: " Has Changed employment in same industry in last three employment", score: 4, selected: true },
        { label: "  Has changed employment in same industry in last four or more than four employment", score: 5, selected: true },
      ],
    },
    {
      id: 9, title: "AGE", max: 10, bg: "bg-[#f3e8ff]",
      options: [
        { label: "19 to 25 years", score: 10 },
        { label: "26 to 30 years", score: 7, selected: true },
        { label: "31 to 35 years", score: 5 },
        { label: "More than 35 years", score: 1 },
      ],
    },
    {
      id: 10, title: "EXISTING PROFESSIONAL LICENSE", max: 5, bg: "bg-[#f3e8ff]",
      options: [
        { label: "Has obtained any License to the profession from India / Foreign Country", score: 2.5 },
        { label: "Has obtained Driving License from Foreign Country", score: 2.5, selected: true },
      ],
    },
    {
      id: 11, title: "ADAPTABILITY", max: 8, bg: "bg-[#f3e8ff]",
      options: [
        { label: "Applicant has a minimum of 1 year skilled Work experience in Abroad", score: 2, selected: true },
        { label: "Applicant spouse is working in Abroad", score: 1, selected: true },
        { label: "Applicant family member [other than spouse] working in Abroad", score: 1 },
        { label: "Applicant family member [including spouse] recently worked in Abroad", score: 1 },
        { label: "Applicant family member [including spouse] educated in Abroad", score: 1 },
        { label: "Applicant spouse family member is working in Abroad", score: 1 },
        { label: "Applicant spouse family member recently worked in Aborad", score: 1 }
      ],
    },
  ];

  const totalScore = scoringSections.reduce((acc, section) => {
    const selected = selectedOptions[section.id];
    let score = 0;
    if (Array.isArray(selected)) {
      score = selected.reduce((sum: number, idx: number) => sum + (section.options[idx]?.score || 0), 0);
    } else if (selected !== null && selected !== undefined) {
      score = section.options[selected]?.score || 0;
    }
    return acc + score;
  }, 0);

  const englishTotal: number = Object.values(languageLevels.english).reduce(
    (acc: number, lvl: any) => acc + (levelScoreMap[lvl] || 0), 0
  );

  const otherTotal: number = Object.values(languageLevels.other).reduce(
    (acc: number, lvl: any) => acc + (lvl ? 1 : 0), 0
  );

  const finalTotal = totalScore + englishTotal + otherTotal;

  const signatureFields = [
    { label: "Candidate Signature", file: candidateSignature, setFile: setCandidateSignature },
    { label: "Assessor Signature", file: assessorSignature, setFile: setAssessorSignature },
  ];

  return (
    <Box className="w-full min-h-screen p-4 md:p-8 text-gray-900">
      {/* <AssessmentHeader onBack={() => setCurrentView("detail")} /> */}

      <Card className="rounded-xl border border-gray-200 shadow-sm">
        <CardContent className="p-6 md:p-8">
          <AssessmentBasicInfo selectedCandidate={selectedCandidate} />

          <AssessmentScoringTable 
            scoringSections={scoringSections}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            languageLevels={languageLevels}
            setLanguageLevels={setLanguageLevels}
            levels={levels}
            skills={skills}
            levelScoreMap={levelScoreMap}
            finalTotal={finalTotal}
          />

          <AssessmentNotes />

          <AssessmentSignatures signatureFields={signatureFields} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default AssessmentForm;