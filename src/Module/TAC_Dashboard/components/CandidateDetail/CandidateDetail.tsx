"use client";
import React from "react";
import { Box, Grid, Stack, CircularProgress, Typography } from "@mui/material";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// Components Imports
import CandidateHeader from "./CandidateHeader";
import InquiryDetailsForm from "./InquiryDetailsForm";
import PreCounsellingForm from "./PreCounsellingForm";
import ProgressSidebar from "./ProgressSidebar";
import AssessmentFormSection from "./AssessmentFormSection";
import { useCandidateDetail } from "./useCandidateDetail";
import { UserData } from "@/Redux/Auth/user.slice";
import { getTacCandidateDetailAction } from "@/Services/APIs/tac/tac.actions";
// import { IAssignment } from "@/lib/models/Assignment.model";
// import { ILead } from "@/lib/models/Lead.model";
// import { IBranchToken } from "@/lib/models/BranchToken.model";
interface CandidateDetailProps {
  //   selectedCandidate: CandidateLead;
  //   setSelectedCandidate: (candidate: CandidateLead) => void;
  // setCurrentView: (view: "dashboard" | "detail") => void;
}

const CandidateDetail: React.FC<CandidateDetailProps> = (
  {
    // setCurrentView
  },
) => {
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  const params = useParams<{ id: string }>();
  const id = params?.id;

  // const [data, setData] = useState<{
  //   lead: ILead;
  //   branchToken: IBranchToken;
  //   assignments: IAssignment[];
  //   assignmentByPhase: Record<string, IAssignment>;
  // } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //, setSelectedCandidate
  const {
    c,
    preferences,
    source,
    branchId,
    consultantId,
    inqAssign,
    assessAssign,
    tacList,
    transferTo,
    setTransferTo,
    currentUser,
    isFoe,
    handleBack,
    // , setSelectedCandidate
  } = useCandidateDetail({ selectedCandidate });
  //, setCurrentView

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTacCandidateDetailAction(id)
      .then((response: any) => {
        // setData(response?.data?.data);
        setSelectedCandidate({
          _id: response?.data?.data.lead._id,
          name: response?.data?.data.lead.fullName ?? "—",
          inqNo: response?.data?.data.lead.inqNo ?? "—",
          stage: response?.data?.data.lead.status ?? "—",
          status: response?.data?.data.lead.status ?? "—",
          profilePic: response?.data?.data.lead.profilePic,
          contact: response?.data?.data.lead.contact,
          address: response?.data?.data.lead.address,
          preferences: response?.data?.data.lead.preferences
            ? {
              branchId: response?.data?.data.lead.preferences.branchId,
              consultantId:
                response?.data?.data.lead.preferences.consultantId,
              visitType: response?.data?.data.lead.preferences.visitType,
            }
            : undefined,
          source: response?.data?.data.lead.source,
          experience: response?.data?.data.lead.experience,
          documents: response?.data?.data.lead.documents,
          technical: response?.data?.data.lead.technical,
          passport: response?.data?.data.lead.passport,
          token: response?.data?.data.branchToken?.tokenNo ?? null,
          lastActivity: response?.data?.data.lead.updatedAt,
          assignmentByPhase: response?.data?.data.assignmentByPhase ?? {},
          notificationPreference:
            response?.data?.data.lead?.notificationPreference ?? {},
        });
      })
      .catch((err) =>
        setError(err?.response?.data?.message ?? "Failed to load candidate"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Typography color="error">{error ?? "Candidate not found"}</Typography>
      </Box>
    );
  }

  return (
    <Box className="w-full min-h-screen p-4 md:p-6">
      <CandidateHeader candidate={c} onBack={handleBack} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <Stack spacing={3}>
            <InquiryDetailsForm candidate={c} />

            {!!Object.keys(c.assignmentByPhase ?? {}).length && (
              <PreCounsellingForm
                candidate={c}
                inqAssign={inqAssign}
                branchId={branchId}
                consultantId={inqAssign?.assignedTo || consultantId}
                source={source}
                preferences={preferences}
                candidatePhone={c?.contact?.phone ?? ""}
              />
            )}

            {!!Object.keys(c.assignmentByPhase ?? {}).length &&
              inqAssign?.status === "completed" &&
              assessAssign && (
                <AssessmentFormSection
                  candidate={c}
                  assessAssign={assessAssign}
                  isFoe={isFoe}
                  branchTitle={
                    typeof branchId === "string"
                      ? branchId
                      : ((branchId as any)?.title ?? "—")
                  }
                // setCurrentView={setCurrentView}
                />
              )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
          <ProgressSidebar
            candidate={c}
            isFoe={isFoe}
            branchId={branchId}
            consultantId={consultantId}
            tacList={tacList}
            transferTo={transferTo}
            setTransferTo={setTransferTo}
            currentUser={currentUser as UserData}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CandidateDetail;
