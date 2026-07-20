import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { getAllCandidatesAction } from "@/Services/APIs/tacHead/candidate.action";
import { TacHeadCandidate, CandidateBranch, ParsedTacConsultant } from "@/Types/Frontend_Payload/tacHead.types";

export const useAllCandidates = () => {
 
  const [candidates, setCandidates] = useState<TacHeadCandidate[]>([]);
  const [branches, setBranches] = useState<CandidateBranch[]>([]);
  const [tacs, setTacs] = useState<ParsedTacConsultant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState({
    branchId: "",
    tacId: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  // ── Debounced Search Local State & Ref tracking ──
  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 
  const getCandidateStatusBadge = (status: string): string => {
    switch (status) {
      case "inquiry_submitted":
      case "doc_submitted":
      case "exp_submitted":
      case "assessment_submitted":
        return "bg-blue-500 text-white dark:bg-blue-500 dark:text-white";
      case "doc_verified":
      case "exp_verified":
      case "pre_completed":
      case "assess_completed":
        return "bg-green-500 text-white dark:bg-green-90 dark:text-white";
      case "pre_contacted":
      case "assess_contacted":
        return "bg-teal-500 text-white dark:bg-teal-95 dark:text-white";
      case "pre_queued":
      case "assess_queued":
        return "bg-orange-500 text-white dark:bg-orange-95 dark:text-white";
      case "pre_scheduled":
      case "assess_scheduled":
      case "assessment_scheduled":
        return "bg-amber-600 text-white dark:bg-amber-700 dark:text-white";
      case "pre_not_responded":
      case "assess_not_responded":
        return "bg-pink-500 text-white dark:bg-pink-96 dark:text-white";
      case "pre_rejected":
      case "assess_rejected":
      case "exp_rejected":
      case "doc_rejected":
        return "bg-red-600 text-white dark:bg-red-98 dark:text-white";
      case "exp_request_technical":
        return "bg-amber-400 text-white dark:bg-amber-500 dark:text-white";
      case "doc_awaiting_approval":
        return "bg-purple-500 text-white dark:bg-purple-95 dark:text-white";
      default:
        return "bg-slate-400 text-white dark:bg-gray-400 dark:text-white";
    }
  };

   
  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAllCandidatesAction({
        page: filters.page,
        limit: filters.limit,
        branchId: filters.branchId,
        tacId: filters.tacId,
        search: filters.search
      });

      if (res?.data?.success) {
        const data = res.data.data;
        setCandidates(data.candidates || []);
        setTotalPages(data.totalPages || 1);

        if (data.candidates && data.candidates.length > 0) {
          const uniqueBranches = Array.from(
            new Map(
              data.candidates.map((c) => [
                c.preferences?.branchId?._id,
                c.preferences?.branchId,
              ]),
            ).values(),
          ).filter(Boolean) as CandidateBranch[];

          const tacMap = new Map();
          data.candidates.forEach((c) => {
            const tac = c.preferences?.consultantId;
            const bId = c.preferences?.branchId?._id;
            
            if (tac && tac._id) {
              if (!tacMap.has(tac._id)) {
                tacMap.set(tac._id, { ...tac, branchIds: new Set<string>() });
              }
              if (bId) {
                tacMap.get(tac._id).branchIds.add(bId);
              }
            }
          });

          const uniqueTacs: ParsedTacConsultant[] = Array.from(tacMap.values()).map((t: any) => ({
            ...t,
            branchIds: Array.from(t.branchIds),
          }));

          if (branches.length === 0) setBranches(uniqueBranches);
          if (tacs.length === 0) setTacs(uniqueTacs);
        }
      } else {
        toast.error(res?.data?.message || "Failed to fetch candidates");
      }
    } catch (err) {
      toast.error("An error occurred while fetching candidates.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, branches.length, tacs.length]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => {
      const updated = { ...prev, [name]: value, page: 1 };

      if (name === "branchId") {
        if (value !== "") {
          const currentTac = tacs.find((t: any) => t._id === prev.tacId);
          if (currentTac && !currentTac.branchIds.includes(value)) {
            updated.tacId = ""; 
          }
        }
      }
      return updated;
    });
  };

  const onSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleFilterChange("search", val);
    }, 400);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const filteredTacs = filters.branchId
    ? tacs.filter((t: any) => t.branchIds.includes(filters.branchId))
    : tacs;

   
  const formattedCandidatesForUI = candidates.map((row) => ({
    _id: row._id,
    fullName: row.fullName || "—",
    inqNo: row.inqNo || "—",
    branchTitle: row.preferences?.branchId?.title || "—",
    tacName: row.preferences?.consultantId
      ? `${row.preferences.consultantId.firstName} ${row.preferences.consultantId.lastName}`
      : "Unassigned",
    phone: row.contact?.phone || "—",
    email: row.contact?.email || "—",
    statusClass: getCandidateStatusBadge(row.status || ""),
    statusLabel: row.status ? row.status.replace(/_/g, " ") : "—"
  }));

  return {
    candidates: formattedCandidatesForUI, // 🌟 UI gets fully formatted model
    branches,
    tacs: filteredTacs,
    filters,
    totalPages,
    isLoading,
    searchInput,
    onSearchChange,
    handleFilterChange,
    handlePageChange,
  };
};