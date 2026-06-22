import React, { useState, useEffect, useMemo } from "react";
import { Box, Card, CardContent } from "@mui/material";

// Sub-components Imports
import AssessmentBasicInfo from "./AssessmentBasicInfo";
import AssessmentScoringTable from "./AssessmentScoringTable";
import AssessmentNotes from "./AssessmentNotes";
import AssessmentSignatures from "./AssessmentSignatures";
import { getAssessmentQuestionsList, QuestionType, updateAssessmentScoreAction } from "@/Services/APIs/tac/tac.actions";
import { useFormik } from "formik";
import * as yup from "yup";
import axiosClient from "@/Services/AxiosConfig/axiosClient";
import toast from "react-hot-toast";
import { CamelCase } from "@/Utils/common";

interface AssessmentFormProps {
  selectedCandidate: any;
  assessAssign: any;
  assessBasicForm: any;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  selectedCandidate,
  assessAssign,
  assessBasicForm
}) => {
  useEffect(() => {
    //   window.scrollTo({ top: 0, behavior: "smooth" });
    getAssessmentQuestion();
    setAssessmentStatus(assessAssign?.status);
  }, []);

  const getAssessmentQuestion = async () => {
    const result = await getAssessmentQuestionsList();
    setDbQuestions(result?.data?.data?.data);
  }

  const [dbQuestions, setDbQuestions] = useState<QuestionType[]>();
  const [assessmentStatus, setAssessmentStatus] = useState<string>("");
  const [customScores, setCustomScores] = useState<Record<number, Record<number, number>>>({});

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
        { label: questionsByShortName.prof_L7?.title, score: questionsByShortName.prof_L7?.marks },
        { label: questionsByShortName.prof_L6?.title, score: questionsByShortName.prof_L6?.marks },
        { label: questionsByShortName.prof_l4_l5_Diploma_2yrs?.title, score: questionsByShortName.prof_l4_l5_Diploma_2yrs?.marks },
        { label: questionsByShortName.prof_1yrs?.title, score: questionsByShortName.prof_1yrs?.marks },
        { label: questionsByShortName.prof_ITI_L1_L2?.title, score: questionsByShortName.prof_ITI_L1_L2?.marks },
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
        { label: questionsByShortName.ADAP_FAMILY_ABROAD?.title, score: questionsByShortName.ADAP_FAMILY_ABROAD?.marks },
        { label: questionsByShortName.ADAP_RECET_ABROAD?.title, score: questionsByShortName.ADAP_RECET_ABROAD?.marks },
        { label: questionsByShortName.ADAP_EDU_ABROAD?.title, score: questionsByShortName.ADAP_EDU_ABROAD?.marks },
        { label: questionsByShortName.ADAP_WORKING_ABROAD?.title, score: questionsByShortName.ADAP_WORKING_ABROAD?.marks },
        { label: questionsByShortName.ADAP_WORKED_ABROAD?.title, score: questionsByShortName.ADAP_WORKED_ABROAD?.marks }
      ],
    },
  ];

  const languageSections = {
    english: [
      questionsByShortName.Lang_Lis,
      questionsByShortName.Lang_Spea,
      questionsByShortName.Lang_Wri,
      questionsByShortName.Lang_Read,
    ].filter(Boolean),

    other: [
      questionsByShortName.Lang_3rd_Lis,
      questionsByShortName.Lang_3rd_Spe,
      questionsByShortName.Lang_3rd_Wri,
      questionsByShortName.Lang_3rd_Read,
    ].filter(Boolean),
  };

  const totalScore = scoringSections.reduce((acc, section) => {
    const selected = selectedOptions[section.id];
    let score = 0;

    if (Array.isArray(selected)) {
      score = selected.reduce((sum: number, idx: number) => {
        const option = section.options[idx];

        return (
          sum +
          (option?.score > 0
            ? option.score
            : customScores[section.id]?.[idx] || 0)
        );
      }, 0);
    } else if (selected !== null && selected !== undefined) {
      const option = section.options[selected];

      score =
        option?.score > 0
          ? option.score
          : customScores[section.id]?.[selected] || 0;
    }

    return acc + score;
  }, 0);

  const englishTotal = languageSections.english.reduce(
    (acc, q) =>
      acc + (levelScoreMap[languageLevels.english?.[q.shortName]] || 0),
    0
  );

  const otherTotal = languageSections.other.reduce(
    (acc, q) =>
      acc + (languageLevels.other?.[q.shortName] ? q.marks : 0),
    0
  );

  const finalTotal = totalScore + englishTotal + otherTotal;

  const signatureFields = [
    {
      label: "Candidate Signature",
      field: "candidateSign",
    },
    {
      label: "Assessor Signature",
      field: "assessorSign",
    },
  ];

  const assessmentForm = useFormik({
    initialValues: {
      passportNo: selectedCandidate?.passport?.no || "",
      note1: "",
      note2: "",
      note3: "",
      note4: "",
      candidateSign: null as File | null,
      assessorSign: null as File | null,
    },
    validationSchema: yup.object({
      //   passportNo: yup
      //     .string()
      //     .trim()
      //     .required("Passport No is required")
      // })
      note1: yup.string().required("Note 1 is required"),
      // note2: yup.string().required("Note 2 is required"),
      // note3: yup.string(),
      // note4: yup.string(),
      candidateSign: yup.mixed()
        .required("Candidate signature is required, Supports only .pdf, .jpg, .jpeg, .png within size 2mb"),

      assessorSign: yup.mixed()
        .required("Assessor signature is required, Supports only .pdf, .jpg, .jpeg, .png within size 2mb"),

    }),
    onSubmit: async (values) => {
      if (finalTotal > 100) {
        toast.error('Total mark is greater than 100 ');
        return;
      }
      else if (finalTotal === 0) {
        toast.error('Total mark must be more than 0 ');
        return;
      }
      const formData = new FormData();

      formData.append("id", assessAssign?._id);
      formData.append("passportNo", values.passportNo);
      formData.append("totalMarks", String(finalTotal));

      ["note1", "note2", "note3", "note4"].forEach((key) => {
        formData.append(key, values[key as keyof typeof values] as string);
      });

      if (values.candidateSign) {
        formData.append("candidateSign", values.candidateSign);
      }

      if (values.assessorSign) {
        formData.append("assessorSign", values.assessorSign);
      }
      const result = await updateAssessmentScoreAction(formData);
      setAssessmentStatus(result?.data?.data?.status);
      console.log(result?.data?.data?.status, result?.data, 5844);

      if (result?.data?.data?.status === "completed") {
        toast.success("Assessment result recorded: Candidate Passed.");
        assessBasicForm.status.values(result?.data?.data?.status);
      }
      else if (result?.data?.data?.status === "rejected") {
        toast.error("Assessment result recorded: Candidate Failed.");
        assessBasicForm.status.values(result?.data?.data?.status);
      }
    },
  });

  return (
    <Box className="w-full min-h-screen p-4 md:p-8 text-gray-900" >
      {/* <AssessmentHeader onBack={() => setCurrentView("detail")} /> */}

      < Card className="rounded-xl border border-gray-200 shadow-sm" >
        {assessmentStatus !== "completed" && assessmentStatus !== "rejected" ? (
          <CardContent className="p-6 md:p-8">
            <AssessmentBasicInfo selectedCandidate={selectedCandidate} assessmentForm={assessmentForm} />

            <AssessmentScoringTable
              scoringSections={scoringSections}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              languageLevels={languageLevels}
              setLanguageLevels={setLanguageLevels}
              levels={levels}
              skills={skills}
              languageSections={languageSections}
              levelScoreMap={levelScoreMap}
              finalTotal={finalTotal}
              customScores={customScores}
              setCustomScores={setCustomScores}
            />

            <AssessmentNotes assessmentForm={assessmentForm} />

            <AssessmentSignatures signatureFields={signatureFields} assessmentForm={assessmentForm} assessmentStatus={assessmentStatus} assessAssign={assessAssign} />
          </CardContent>
        ) : <CardContent className="p-6 md:p-8">
          The Candidate already {CamelCase(assessmentStatus)} this assessment.
        </CardContent>}
      </Card >
    </Box >
  );
};

export default AssessmentForm;