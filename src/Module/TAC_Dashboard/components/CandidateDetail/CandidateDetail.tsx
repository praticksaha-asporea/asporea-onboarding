"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Grid, Stack } from "@mui/material";
import { useSelector } from "react-redux";
import { getTacListAction } from "@/Services/APIs/Inquiry/inquiry.action";

// Components Imports (Adjust paths accordingly)
import CandidateHeader from "./CandidateHeader";
import InquiryDetailsForm from "./InquiryDetailsForm";
import PreCounsellingForm from "./PreCounsellingForm";
import ProgressSidebar from "./ProgressSidebar";
import AssessmentFormSection from "./AssessmentFormSection";
interface CandidateDetailProps {
  selectedCandidate: any;
  setSelectedCandidate: (candidate: any) => void;
  setCurrentView: (view: "dashboard" | "detail" | "assessment") => void;
}

const CandidateDetail: React.FC<CandidateDetailProps> = ({
  selectedCandidate,
  setSelectedCandidate,
  setCurrentView,
}) => {
  const router = useRouter();
  const currentUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const isFoe =
    currentUser?.role === "foe" || currentUser?.user?.role === "foe";

  // useEffect(() => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }, []);

  const c = selectedCandidate ?? {};
  const preferences = c.preferences ?? {};
  const source = c.source ?? {};
  const branchId = preferences.branchId ?? {};
  const consultantId = preferences.consultantId ?? {};
  const abp = c.assignmentByPhase ?? {};
  const inqAssign = abp["pre"] ?? null;
  const assessAssign = abp["assess"] ?? null;
  console.log("ABP Log Check:", abp);
  console.log("Assessment Assign Data:", assessAssign);
  const [tacList, setTacList] = useState<any[]>([]);
  const [escalateTo, setEscalateTo] = useState("");

  useEffect(() => {
    const branchObjectId =
      typeof preferences.branchId === "object"
        ? preferences.branchId?._id
        : preferences.branchId;
    if (!branchObjectId) return;
    getTacListAction(String(branchObjectId))
      .then((res) => {
        if (res.success) {
          const myId = currentUser?.id || currentUser?._id;
          setTacList(
            res.data.filter((t: any) => String(t._id) !== String(myId)),
          );
        }
      })
      .catch(() => {});
  }, [preferences.branchId, currentUser]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      setSelectedCandidate(null);
      setCurrentView("dashboard");
    }
  };

  return (
    <Box className="w-full min-h-screen p-4 md:p-6">
      <CandidateHeader candidate={c} onBack={handleBack} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <Stack spacing={3}>
            <InquiryDetailsForm candidate={c} />

            {!!Object.keys(abp).length && (
              <PreCounsellingForm
                candidate={c}
                inqAssign={inqAssign}
                branchId={branchId}
                consultantId={consultantId}
                source={source}
                preferences={preferences}
                candidatePhone={c.contact?.phone ?? ""}
              />
            )}

            {/* --- Assessment Form Section (Tab 3) --- */}
            {!!Object.keys(abp).length && inqAssign?.status === "completed" && (
              <AssessmentFormSection
                candidate={c}
                assessAssign={assessAssign}
                isFoe={isFoe}
                branchTitle={branchId.title ?? "—"}
                setCurrentView={setCurrentView}
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
            escalateTo={escalateTo}
            setEscalateTo={setEscalateTo}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CandidateDetail;
