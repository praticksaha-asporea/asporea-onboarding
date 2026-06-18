import React, { useState, useEffect, useMemo } from "react";
import { Box, Card, CardContent } from "@mui/material";

// Sub-components Imports
import AssessmentBasicInfo from "./AssessmentBasicInfo";
import AssessmentScoringTable from "./AssessmentScoringTable";
import AssessmentNotes from "./AssessmentNotes";
import AssessmentSignatures from "./AssessmentSignatures";
import { getAssessmentQuestionsList, QuestionType } from "@/Services/APIs/tac/tac.actions";

interface AssessmentFormProps {
  selectedCandidate: any
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  selectedCandidate
}) => {
  useEffect(() => {
    //   window.scrollTo({ top: 0, behavior: "smooth" });
    getAssessmentQuestion();
  }, []);

  const getAssessmentQuestion = async () => {
    const result = await getAssessmentQuestionsList();
    setDbQuestions(result?.data?.data?.data);
  }

  const [candidateSignature, setCandidateSignature] = useState<File | null>(null);
  const [assessorSignature, setAssessorSignature] = useState<File | null>(null);
  const [dbQuestions, setDbQuestions] = useState<QuestionType[]>();

  const [selectedOptions, setSelectedOptions] = useState<any>({
    1: null, 2: null, 4: [], 5: null, 6: null, 7: null, 8: null, 9: null, 10: [], 11: [],
  });
  const questionsByShortName = useMemo(() => {
    return (dbQuestions || []).reduce((acc: Record<string, QuestionType>, q) => {
      acc[q.shortName] = q;
      return acc;
    }, {});
  }, [dbQuestions]);

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
        {
          label: questionsByShortName.acad_masters?.title, score: questionsByShortName.acad_masters?.marks, selected: true
        },
        { label: questionsByShortName.acad_Honours_4yrs?.title, score: questionsByShortName.acad_Honours_4yrs?.marks },
        { label: questionsByShortName.acad_undergrad_3yrs?.title, score: questionsByShortName.acad_undergrad_3yrs?.marks },
        { label: questionsByShortName.acad_High_School?.title, score: questionsByShortName.acad_High_School?.marks },
        { label: questionsByShortName.acad_Sec_School?.title, score: questionsByShortName.acad_Sec_School?.marks },
      ],
    },
    {
      id: 2, title: "PROFESSIONAL QUALIFICATION", max: 10, bg: "bg-[#f3e8ff]",
      options: [
        { label: questionsByShortName.prof_L7?.title, score: questionsByShortName.prof_L7?.marks},
        { label: questionsByShortName.prof_L6?.title, score: questionsByShortName.prof_L6?.marks},
        { label: questionsByShortName.prof_l4_l5_Diploma_2yrs?.title, score: questionsByShortName.prof_l4_l5_Diploma_2yrs?.marks},
        { label: questionsByShortName.prof_1yrs?.title, score: questionsByShortName.prof_1yrs?.marks},
        { label: questionsByShortName.prof_ITI_L1_L2?.title, score: questionsByShortName.prof_ITI_L1_L2?.marks},
        { label: questionsByShortName.prof_Dipl_Recog?.title, score: questionsByShortName.prof_Dipl_Recog?.marks },
        { label: questionsByShortName.prof_Skill_Cert?.title, score: questionsByShortName.prof_Skill_Cert?.marks },
        { label: 'Others:', score: 0 }
      ],
    },
    {
      id: 4, title: "GENERAL ABILITIES", max: 7, bg: "bg-[#f5f5dc]",
      options: [
        { label: questionsByShortName.GEN_AB_COMM?.title, score: questionsByShortName.GEN_AB_COMM?.marks },
        { label: questionsByShortName.GEN_ABI_PERSO?.title, score: questionsByShortName.GEN_ABI_PERSO?.marks },
      ],
    },
    {
      id: 5, title: "WORK EXPERIENCE (RELEVANCE TO ACADEMIC/PROFESSIONAL QUALIFICATION)", max: 10, bg: "bg-[#f3e8ff]",
      options: [
        { label: questionsByShortName.WORK_EXP_1?.title, score: questionsByShortName.WORK_EXP_1?.marks },
        { label: questionsByShortName.WORK_EXP_2_OR_3?.title, score: questionsByShortName.WORK_EXP_2_OR_3?.marks },
        { label: questionsByShortName.WORK_EXP_4_5?.title, score: questionsByShortName.WORK_EXP_4_5?.marks },
        { label: questionsByShortName.WORK_EXP_6_7?.title, score: questionsByShortName.WORK_EXP_6_7?.marks },
      ],
    },
    {
      id: 6, title: "ABROAD WORK EXPERIENCE (RELEVENCE TO ACAMEDIC/PROFESSIONAL QUALIFICATION)", max: 10, bg: "bg-[#f3e8ff]",
      options: [
        { label: questionsByShortName.ABR_WO_EXP_1?.title, score: questionsByShortName.ABR_WO_EXP_1?.marks },
        { label: questionsByShortName.ABR_WO_EXP_2_3?.title, score: questionsByShortName.ABR_WO_EXP_2_3?.marks },
        { label: questionsByShortName.ABR_WO_EXP_4_5?.title, score: questionsByShortName.ABR_WO_EXP_4_5?.marks },
        { label: questionsByShortName.ABR_WO_EXP_6_7?.title, score: questionsByShortName.ABR_WO_EXP_6_7?.marks },
      ],
    },
    {
      id: 7, title: "STABILITY ", max: 5, bg: "bg-[#f3e8ff]",
      options: [
        { label: questionsByShortName.STAB_2yrs?.title, score: questionsByShortName.STAB_2yrs?.marks },
        { label: questionsByShortName.STAB_2_TO_5yrs?.title, score: questionsByShortName.STAB_2_TO_5yrs?.marks },
        { label: questionsByShortName.STAB_MOR_5yrs?.title, score: questionsByShortName.STAB_MOR_5yrs?.marks },
      ],
    },
    {
      id: 8, title: "CAREER INITIATIVE  (EACH EMPLOYMENT MUST BE MORE THAN 12 MONTHS PERIOD)", max: 5, bg: "bg-[#f3e8ff]",
      options: [
        { label: questionsByShortName.CAR_TWO_EMP?.title, score: questionsByShortName.CAR_TWO_EMP?.marks },
        { label: questionsByShortName.CAR_INI_LST3MONTHS?.title, score: questionsByShortName.CAR_INI_LST3MONTHS?.marks },
        { label: questionsByShortName.CAR_INIT_LAST4MONTHS?.title, score: questionsByShortName.CAR_INIT_LAST4MONTHS?.marks },
      ],
    },
    {
      id: 9, title: "AGE", max: 10, bg: "bg-[#f3e8ff]",
      options: [
        { label: questionsByShortName.AGE_19_25YRS?.title, score: questionsByShortName.AGE_19_25YRS?.marks },
        { label: questionsByShortName.AGE_26_30YRS?.title, score: questionsByShortName.AGE_26_30YRS?.marks },
        { label: questionsByShortName.AGE_31_35YRS?.title, score: questionsByShortName.AGE_31_35YRS?.marks },
        { label: questionsByShortName.AGE_MOR_35YRS?.title, score: questionsByShortName.AGE_MOR_35YRS?.marks },
      ],
    },
    {
      id: 10, title: "EXISTING PROFESSIONAL LICENSE", max: 5, bg: "bg-[#f3e8ff]",
      options: [
        { label: questionsByShortName.EXIS_PROF_INDIA?.title, score: questionsByShortName.EXIS_PROF_INDIA?.marks },
        { label: questionsByShortName.EXIS_PROF_FOREIGN?.title, score: questionsByShortName.EXIS_PROF_FOREIGN?.marks },
      ],
    },
    {
      id: 11, title: "ADAPTABILITY", max: 8, bg: "bg-[#f3e8ff]",
      options: [
        { label: questionsByShortName.ADAP_1YR?.title, score: questionsByShortName.ADAP_1YR?.marks },
        { label: questionsByShortName.ADAP_ABROAD?.title, score: questionsByShortName.ADAP_ABROAD?.marks },
        { label: questionsByShortName.ADAP_FAMILY_ABROAD?.title, score: questionsByShortName.ADAP_FAMILY_ABROAD?.marks},
        { label: questionsByShortName.ADAP_RECET_ABROAD?.title, score: questionsByShortName.ADAP_RECET_ABROAD?.marks},
        { label: questionsByShortName.ADAP_EDU_ABROAD?.title, score: questionsByShortName.ADAP_EDU_ABROAD?.marks},
        { label: questionsByShortName.ADAP_WORKING_ABROAD?.title, score: questionsByShortName.ADAP_WORKING_ABROAD?.marks},
        { label: questionsByShortName.ADAP_WORKED_ABROAD?.title, score: questionsByShortName.ADAP_WORKED_ABROAD?.marks}
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