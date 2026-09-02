"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  CircularProgress,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import { useParams } from "next/navigation";
import { updateLeadAction } from "@/Services/APIs/tac/tac.actions";
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
import { confirmToast } from "@/Utils/confirmToast";
import toast from "react-hot-toast";

interface CandidateDetailProps { }

const CandidateDetail: React.FC<CandidateDetailProps> = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);


  const [tabValue, setTabValue] = useState<string>("inquiry");
  const [updatingFollowUp, setUpdatingFollowUp] = useState(false);
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
          followUpRequired: response?.data?.data.lead.followUpRequired ?? false,
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
          createdAt: response?.data?.data.lead.createdAt,
          assignmentByPhase: response?.data?.data.assignmentByPhase ?? {},
          notificationPreference:
            response?.data?.data.lead?.notificationPreference ?? {},
          inquiryStages: response?.data?.data.lead.inquiryStages ?? {},
          inqForType: response?.data?.data.lead.inqForType ?? "",
          inqForPosition: response?.data?.data.lead.inqForPosition ?? "",
          user: response?.data?.data?.user ?? "",
          offeredPosition: response?.data?.data.lead.offeredPosition ?? "",
        });
      })
      .catch((err) =>
        setError(err?.response?.data?.message ?? "Failed to load candidate"),
      )
      .finally(() => setLoading(false));
  }, [id]);
  const handleToggleFollowUp = async (checked: boolean) => {
    if (!c?._id) return;

    const msg = checked
      ? "Are you sure you want to flag this candidate for priority follow-up?"
      : "Are you sure you want to remove the follow-up requirement for this candidate?";

    const confirmed = await confirmToast(msg);
    if (!confirmed) return;

    setUpdatingFollowUp(true);
    try {
      await updateLeadAction({
        id: c._id,
        followUpRequired: checked,
      });
      setSelectedCandidate((prev: any) => ({
        ...prev,
        inqForType: prev?.inqForType ?? "",
        inqForPosition: prev?.inqForPosition ?? "",
        followUpRequired: checked,
      }));
      toast.success(
        checked
          ? "Candidate successfully flagged for priority follow-up."
          : "Follow-up requirement removed from candidate profile."
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
        "Failed to update candidate follow-up status. Please try again."
      );
    } finally {
      setUpdatingFollowUp(false);
    }
  };

  if (error) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Typography color="error">{error ?? "Candidate not found"}</Typography>
      </Box>
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const showPreCounselling = !!Object.keys(c?.assignmentByPhase ?? {}).length;
  const showAssessment =
    showPreCounselling &&
    inqAssign?.status === "completed" &&
    Boolean(assessAssign);

  return (
    <Box className="w-full min-h-screen p-4 md:p-6">
      <CandidateHeader
        candidate={c}
        onBack={handleBack}
        onToggleFollowUp={handleToggleFollowUp}
        updatingFollowUp={updatingFollowUp}
      />

      <Box className="bg-[var(--mui-palette-primary)] rounded-xl shadow-2xl mb-6 mt-4 px-2">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          className="min-h-[54px] [&_.MuiTab-root]:min-h-[54px] [&_.MuiTab-root]:normal-case [&_.MuiTab-root]:font-medium [&_.MuiTab-root]:text-[16px] [&_.MuiTab-root]:text-[var(--mui-palette-text-secondary)] [&_.MuiTab-root]:gap-2 [&_.Mui-selected]:!text-[var(--mui-palette-primary-main)]"
        >
          <Tab
            label="Inquiry Details"
            value="inquiry"
            icon={<i className="ri-file-list-3-line text-[18px]" />}
            iconPosition="start"
          />

          {showPreCounselling && (
            <Tab
              label="Pre-Counselling"
              value="precounselling"
              icon={<i className="ri-calendar-check-line text-[18px]" />}
              iconPosition="start"
            />
          )}

          {showAssessment && (
            <Tab
              label="Assessment"
              value="assessment"
              icon={<i className="ri-task-line text-[18px]" />}
              iconPosition="start"
            />
          )}

          <Tab
            label="Notes"
            value="notes"
            icon={<i className="ri-sticky-note-line text-[18px]" />}
            iconPosition="start"
          />
          <Tab
            label="Activity Logs"
            value="logs"
            icon={<i className="ri-history-line text-[18px]" />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 9 }}>
          {tabValue === "inquiry" && <InquiryDetailsForm candidate={c} />}

          {tabValue === "precounselling" && showPreCounselling && (
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

          {tabValue === "assessment" && showAssessment && (
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

          {tabValue === "notes" && c._id && <LeadNotesCard leadId={c._id} />}

          {tabValue === "logs" && c._id && <LeadLogsCard leadId={c._id} />}
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
          <Box className="flex flex-col gap-6 w-full">
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
