import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getTacHeadPendingTrackingAction } from "@/Services/APIs/tacHead/pendingLeads.action";

export const useTacHeadPendingTrackingView = () => {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const [commModalOpen, setCommModalOpen] = useState(false);
  const [commMode, setCommMode] = useState<"chat" | "email" | null>(null);
  const [commCandidate, setCommCandidate] = useState<any | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleStageFilterChange = (val: string) => {
    setStageFilter(val);
    setPage(1);
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTacHeadPendingTrackingAction({
        page,
        limit: 10,
        search,
        stageFilter,
      });
      if (res.data?.success) {
        setData(res.data.data.delayedLeads || []);
        setTotalPages(res.data.data.meta?.totalPages || 1);
      } else {
        setError(res.data?.message || "Failed to fetch data");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [page, search, stageFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const openCommModal = (candidate: any, mode: "chat" | "email") => {
    const formattedCandidate = {
      ...candidate,
      name: candidate.fullName || candidate.name || "N/A",
      contact: candidate.contact || {},
    };
    setCommCandidate(formattedCandidate);
    setCommMode(mode);
    setCommModalOpen(true);
  };

  const getPendingStageLabel = (stages?: any) => {
    if (!stages) return "N/A";
    if (stages.stage1 === "pending") return "Step 1 Pending";
    if (stages.stage2 === "pending") return "Step 2 Pending";
    if (stages.stage3 === "pending") return "Step 3 Pending";
    return "Unknown";
  };

  const onViewCandidate = (id: string) => {
    router.push(`/tac-head/candidate/${id}`);
  };

  return {
    data,
    loading,
    error,
    page,
    setPage,
    totalPages,
    getPendingStageLabel,
    onViewCandidate,
    searchInput,
    setSearchInput,
    stageFilter,
    setStageFilter: handleStageFilterChange,
    openCommModal,
    commModalOpen,
    setCommModalOpen,
    commMode,
    commCandidate,
  };
};