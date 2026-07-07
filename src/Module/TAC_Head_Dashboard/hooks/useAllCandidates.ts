import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

import { getAllCandidatesAction } from "@/Services/APIs/tacHead/candidate.action";

export const useAllCandidates = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [tacs, setTacs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

 
  const [filters, setFilters] = useState({
    branchId: "",
    tacId: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);

    const res = await getAllCandidatesAction(
      filters.page,
      filters.limit,
      filters.branchId,
      filters.tacId,
      filters.search
    );

    if (res?.success) {
      const data = res.data;
      setCandidates(data.candidates || []);
      setTotalPages(data.totalPages || 1);

      if (data.candidates && data.candidates.length > 0) {
        const uniqueBranches = Array.from(
          new Map(
            data.candidates.map((c: any) => [
              c.preferences?.branchId?._id,
              c.preferences?.branchId,
            ]),
          ).values(),
        ).filter(Boolean);
const tacMap = new Map();
        data.candidates.forEach((c: any) => {
          const tac = c.preferences?.consultantId;
          const bId = c.preferences?.branchId?._id;
          
          if (tac && tac._id) {
            if (!tacMap.has(tac._id)) {
              tacMap.set(tac._id, { ...tac, branchIds: new Set() });
            }
            if (bId) {
              tacMap.get(tac._id).branchIds.add(bId);
            }
          }
        });
       const uniqueTacs = Array.from(tacMap.values()).map((t: any) => ({
          ...t,
          branchIds: Array.from(t.branchIds),
        }));
        if (branches.length === 0) setBranches(uniqueBranches);
        if (tacs.length === 0) setTacs(uniqueTacs);
      }
    } else {
      toast.error(res?.message || "Failed to fetch candidates");
    }

    setIsLoading(false);
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
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };
const filteredTacs = filters.branchId
    ? tacs.filter((t: any) => t.branchIds.includes(filters.branchId))
    : tacs;
  return {
    candidates,
    branches,
    tacs: filteredTacs,
    filters,
    totalPages,
    isLoading,
    handleFilterChange,
    handlePageChange,
  };
};
