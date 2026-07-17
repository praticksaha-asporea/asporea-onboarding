import { useState, useEffect, useCallback, useRef } from "react";
import { getAwaitingExperienceAction } from "@/Services/APIs/tacHead/experience.action";
import { technicalRequestedLeadRecord, technicalListResponse } from "@/Types/ApiResponse/technicalRes.types";
import { formatDistanceToNow } from "date-fns";
import { technicalListPayload } from "@/Types/Frontend_Payload/technical.types";

export const useTechnicalView = () => {
  // 🌟 HIGHLIGHT: Strict array typing bound directly to JSON list contract
  const [leads, setLeads] = useState<any[]>([]); // We use mapped data here, see below
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<technicalRequestedLeadRecord | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const requestPayload: technicalListPayload = {
      page: page,
      limit: 10,
      search: debouncedSearch,
      status: statusFilter
    };
const res = await getAwaitingExperienceAction(requestPayload) as technicalListResponse;    
    if (res && res.success !== false) {
       const flatLeads = (res.data?.technicalRequestedLeads || []).map((lead) => {
        let submittedOnTimeAgo = "N/A";
        if (lead.experience?.submittedOn) {
          try {
            submittedOnTimeAgo = formatDistanceToNow(new Date(lead.experience.submittedOn), { addSuffix: true });
          } catch (e) {
            console.error("Date formatting failed", e);
          }
        }

        return {
          ...lead,
          assignedTac: lead.preferences?.consultantId
            ? `${lead.preferences.consultantId.firstName} ${lead.preferences.consultantId.lastName}`
            : "Unassigned",
          expType: lead.experience?.type || "N/A",
          submittedOnTimeAgo,
          rawRecord: lead // Save raw record to pass to modal
        };
      });

      setLeads(flatLeads);
      setTotalPages(res.data?.meta?.totalPages || 1);
    }
    setLoading(false);
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchTechnicalRequests();
  }, [fetchTechnicalRequests]);

  const openActionModal = (lead: technicalRequestedLeadRecord) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  return {
    leads, loading, page, setPage, totalPages, modalOpen, setModalOpen,
    selectedLead, searchInput, statusFilter, handleSearchChange, handleStatusChange,
    openActionModal, fetchTechnicalRequests,
  };
};