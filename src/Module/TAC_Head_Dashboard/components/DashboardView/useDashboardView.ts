import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { getEscalationListAction } from "@/Services/APIs/tacHead/escalation.actions";

export const useDashboardView = () => {
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTac, setSelectedTac] = useState("");
  const [uniqueTacs, setUniqueTacs] = useState<any[]>([]);
  
  // Modal State Properties
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState<any>(null);

  const fetchEscalations = useCallback(async () => {
    setLoading(true);
    const res = await getEscalationListAction(page, 10, searchTerm, selectedTac);
    if (res?.success) {
      setEscalations(res.data.escalations);
      setTotalPages(res.data.meta.totalPages);

      // Unique TAC Extraction Logic maintained exactly
      if (page === 1 && selectedTac === "") {
        const tacs = res.data.escalations.map((esc: any) => esc.toId).filter(Boolean);
        const unique = Array.from(new Set(tacs.map((a: any) => a._id))).map(id => {
          return tacs.find((a: any) => a._id === id);
        });
        setUniqueTacs(unique);
      }
    } else {
      toast.error(res?.message || "Failed to load requests");
    }
    setLoading(false);
  }, [page, searchTerm, selectedTac]);

  useEffect(() => {
    fetchEscalations();
  }, [fetchEscalations]);

  const openActionModal = (escalation: any) => {
    setSelectedEscalation(escalation);
    setModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedTac("");
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
  };

  const handleTacChange = (val: string) => {
    setSelectedTac(val);
    setPage(1);
  };

  return {
    escalations,
    loading,
    page,
    setPage,
    totalPages,
    searchTerm,
    handleSearchChange,
    selectedTac,
    handleTacChange,
    uniqueTacs,
    modalOpen,
    setModalOpen,
    selectedEscalation,
    openActionModal,
    handleResetFilters,
    fetchEscalations,
  };
};