"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import CandidateDetail from "@/Module/TAC_Dashboard/components/CandidateDetail/CandidateDetail";
import { getTacCandidateDetailAction } from "@/Services/APIs/tac/tac.actions";
import { IAssignment } from "@/lib/models/Assignment.model";
import { ILead } from "@/lib/models/Lead.model";
import { IBranchToken } from "@/lib/models/BranchToken.model";

export default function CandidateDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [data, setData] = useState<{
    lead: ILead;
    branchToken: IBranchToken;
    assignments: IAssignment[];
    assignmentByPhase: Record<string, IAssignment>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTacCandidateDetailAction(id)
      .then((response: any) => setData(response?.data?.data))
      .catch((err) => setError(err?.response?.data?.message ?? "Failed to load candidate"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Typography color="error">{error ?? "Candidate not found"}</Typography>
      </Box>
    );
  }

  const candidate = {
    _id: data.lead._id,
    name: data.lead.fullName ?? "—",
    inqNo: data.lead.inqNo ?? "—",
    stage: data.lead.status ?? "—",
    status: data.lead.status ?? "—",
    contact: data.lead.contact,
    address: data.lead.address,
    preferences: data.lead.preferences,
    source: data.lead.source,
    experience: data.lead.experience,
    documents: data.lead.documents,
    technical: data.lead.technical,
    passport: data.lead.passport,
    token: data.branchToken?.tokenNo ?? null,
    lastActivity: data.lead.updatedAt,
    assignmentByPhase: data.assignmentByPhase ?? {},
    notificationPreference: data?.lead?.contact ?? {},
  };

  return (
    <CandidateDetail
      selectedCandidate={candidate}
      setSelectedCandidate={() => { }}
      setCurrentView={() => router.back()}
    />
  );
}