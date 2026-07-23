import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { getTacListAction } from "@/Services/APIs/Inquiry/inquiry.action";
import { branchById } from "@/Types/Frontend_Payload/branch.types";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";

interface UseCandidateDetailProps {
  selectedCandidate: CandidateLead;
  // setSelectedCandidate?: React.Dispatch<
  //   React.SetStateAction<CandidateLead | null>
  // >;
  // setCurrentView: (view: "dashboard" | "detail") => void;
}
export const useCandidateDetail = ({
  selectedCandidate,
  // setSelectedCandidate,
  // setCurrentView,
}: UseCandidateDetailProps) =>
// setSelectedCandidate: (candidate: CandidateLead) => void,
//   setCurrentView: (view: "dashboard" | "detail") => void}
// ) 
{
  const router = useRouter();
  const currentUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData
  );
  const isFoe = currentUser?.role === "foe" || currentUser?.user?.role === "foe";

  const c = selectedCandidate ?? {};
  const preferences = c.preferences ?? {};
  const source = c.source ?? {};
  const branchId = preferences.branchId as any;
  const consultantId = preferences.consultantId as any;
  const abp = c.assignmentByPhase ?? {};
  const inqAssign = abp["pre"] ?? null;
  const assessAssign = abp["assess"] ?? null;

  const [tacList, setTacList] = useState<any[]>([]);
  const [escalateTo, setEscalateTo] = useState("");

  useEffect(() => {
    const branchObjectId =
      typeof preferences.branchId === "object"
        ? preferences.branchId?._id
        : preferences.branchId;
    if (!branchObjectId) return;

    getTacListAction({ branchId: branchObjectId } as branchById)
      .then((res) => {
        if (res?.data?.success) {
          const myId = currentUser?.id || currentUser?._id;
          setTacList(
            res?.data?.data?.filter((t: any) => String(t._id) !== String(myId))
          );
        }
      })
      .catch(() => { });
  }, [preferences.branchId, currentUser]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      // setSelectedCandidate(null);
      // setCurrentView("dashboard");
      router.replace("/dashboard");
    }
  };

  return {
    c, preferences, source, branchId, consultantId, inqAssign, assessAssign,
    tacList, escalateTo, setEscalateTo, currentUser, isFoe, handleBack
  };
};