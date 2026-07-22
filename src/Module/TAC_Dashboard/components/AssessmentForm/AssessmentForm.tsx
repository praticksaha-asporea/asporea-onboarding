import React from "react";
import { Box, Card, CardContent } from "@mui/material";

// Sub-components Imports
import AssessmentBasicInfo from "./AssessmentBasicInfo";
import AssessmentScoringTable from "./AssessmentScoringTable";
import AssessmentNotes from "./AssessmentNotes";
import AssessmentSignatures from "./AssessmentSignatures";
import { FormikProps } from "formik";
import { CamelCase } from "@/Utils/common";
import { AssessBasicFormValues } from "@/Types/object.types";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";
import { IAssignment } from "@/lib/models/Assignment.model";
import { SignatureFieldItem, signatureFields, useAssessmentForm } from "./useAssessmentForm";

interface AssessmentFormProps {
  selectedCandidate: CandidateLead;
  assessAssign: IAssignment;
  assessBasicForm: FormikProps<AssessBasicFormValues>;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  selectedCandidate,
  assessAssign,
  assessBasicForm
}) => {
  const { assessmentStatus, assessmentForm, scoringSections, selectedOptions, setSelectedOptions, languageLevels, setLanguageLevels, levels, skills, languageSections, levelScoreMap, finalTotal, customScores, setCustomScores
  } = useAssessmentForm({ selectedCandidate, assessAssign, assessBasicForm });
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

            <AssessmentSignatures signatureFields={signatureFields as SignatureFieldItem[]} assessmentForm={assessmentForm} assessmentStatus={assessmentStatus} assessAssign={assessAssign} />
          </CardContent>
        ) : <CardContent className="p-6 md:p-8">
          The candidate assessment status is: {CamelCase(assessmentStatus)}.
        </CardContent>}
      </Card >
    </Box >
  );
};

export default AssessmentForm;