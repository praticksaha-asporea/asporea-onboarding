import { useState, useEffect, useCallback, useRef } from "react";
import { getAwaitingExperienceAction } from "@/Services/APIs/tacHead/experience.action";

export const useTechnicalView = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // ── Filters State Management ──
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce logic framework implementation
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const fetchTechnicalRequests = useCallback(async () => {
    setLoading(true);
    const res = await getAwaitingExperienceAction(page, 10, debouncedSearch, statusFilter);
    if (res && res.success !== false) {
      setLeads(res.data?.technicalRequestedLeads || []);
      setTotalPages(res.data?.meta?.totalPages || 1);
    }
    setLoading(false);
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchTechnicalRequests();
  }, [fetchTechnicalRequests]);

  const openActionModal = (lead: any) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  return {
    leads,
    loading,
    page,
    setPage,
    totalPages,
    modalOpen,
    setModalOpen,
    selectedLead,
    searchInput,
    statusFilter,
    handleSearchChange,
    handleStatusChange,
    openActionModal,
    fetchTechnicalRequests,
  };
};