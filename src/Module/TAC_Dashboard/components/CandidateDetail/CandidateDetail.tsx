"use client";

import React, { useEffect, useState } from "react";
// 👉 Tabs, Tab import kar liya hai
import { Box, Grid, Stack, CircularProgress, Typography, Tabs, Tab } from "@mui/material";
import { useParams } from "next/navigation";

// Components Imports
import CandidateHeader from "./CandidateHeader";
import InquiryDetailsForm from "./InquiryDetailsForm";
import PreCounsellingForm from "./PreCounsellingForm";
import ProgressSidebar from "./ProgressSidebar";
import LeadNotesCard from "./LeadNotesCard";
import AssessmentFormSection from "./AssessmentFormSection";
import { useCandidateDetail } from "./useCandidateDetail";
import { UserData } from "@/Redux/Auth/user.slice";
import { getTacCandidateDetailAction } from "@/Services/APIs/tac/tac.actions";
import LeadLogsCard from "./LeadLogsCard";

interface CandidateDetailProps {}

const CandidateDetail: React.FC<CandidateDetailProps> = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  
  // 👉 Tab Control State
  const [tabValue, setTabValue] = useState(0); 

  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  } = useCandidateDetail({ selectedCandidate });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTacCandidateDetailAction(id)
      .then((response: any) => {
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

  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box className="w-full min-h-screen p-4 md:p-6">
      <CandidateHeader candidate={c} onBack={handleBack} />

      {/* ---------------- TABS MENU ---------------- */}
      <Box className="bg-[var(--mui-palette-primary)] rounded-xl shadow-2xl mb-6 mt-4   px-2">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
         className="min-h-[54px] [&_.MuiTab-root]:min-h-[54px] [&_.MuiTab-root]:normal-case [&_.MuiTab-root]:font-medium [&_.MuiTab-root]:text-[16px] [&_.MuiTab-root]:text-[var(--mui-palette-text-secondary)] [&_.MuiTab-root]:gap-2 [&_.Mui-selected]:!text-[var(--mui-palette-primary-main)]"
        >
          <Tab label="Inquiry Details" icon={<i className="ri-file-list-3-line text-[18px]" />} iconPosition="start" />
          <Tab label="Notes" icon={<i className="ri-sticky-note-line text-[18px]" />} iconPosition="start" />
          <Tab label="Activity Logs" icon={<i className="ri-history-line text-[18px]" />} iconPosition="start" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        
       
        <Grid size={{ xs: 12, lg: 9 }}>
          
          {/* TAB 0: Forms */}
          {tabValue === 0 && (
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
                  />
                )}
            </Stack>
          )}

          {/* TAB 1: Lead Notes */}
          {tabValue === 1 && c._id && (
            <LeadNotesCard leadId={c._id} />
          )}

          {/* TAB 2: Activity Logs */}
          {tabValue === 2 && c._id && (
            <LeadLogsCard leadId={c._id} />
          )}

        </Grid>

        {/* ---------------- RIGHT SIDEBAR ---------------- */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <Box className="flex flex-col gap-6 w-full">
            {/* Ab sidebar me sirf Progress bacha hai, baaki sab Tabs me shift ho gaya */}
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
          </Box>
        </Grid>
        
      </Grid>
    </Box>
  );
};

export default CandidateDetail;