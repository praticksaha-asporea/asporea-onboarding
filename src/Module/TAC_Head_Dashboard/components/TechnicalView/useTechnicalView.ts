import { useState, useEffect, useCallback, useRef } from "react";
import { getAwaitingExperienceAction } from "@/Services/APIs/tacHead/experience.action";
import { technicalRequestedLeadRecord, technicalListResponse } from "@/Types/ApiResponse/technicalRes.types";
import { formatDistanceToNow } from "date-fns";
import { technicalListPayload } from "@/Types/Frontend_Payload/technical.types";


const responsiveTableSx = {
  "& .resp-thead": { "@media (max-width: 767px)": { display: "none" } },
  "& .resp-row": {
    "@media (max-width: 767px)": { display: "block", borderBottom: "2px solid", borderColor: "divider", mb: 1, borderRadius: 2, overflow: "hidden" },
  },
  "& .resp-cell": {
    "@media (max-width: 767px)": {
      display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: "none" },
      "&::before": { content: "attr(data-label)", fontWeight: 600, fontSize: "0.72rem", color: "text.secondary", flexShrink: 0, mr: 2, minWidth: 110 },
    },
  },
};


const getTechStatusBadge = (status: string) => {
  switch (status) {
    case "refered": return "bg-[var(--mui-palette-warning-main)] text-white";
    case "passed": return "bg-[var(--mui-palette-success-main)] text-white";
    case "failed": return "bg-[var(--mui-palette-error-main)] text-white";
    default: return "bg-[--mui-palette-grey-400] text-white";
  }
};

const COLS = ["Candidate", "Assigned TAC", "Technical Status", "Contact", "Actions"];


export const useTechnicalView = () => {
   const [leads, setLeads] = useState<any[]>([]); 
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

    const res = await getAwaitingExperienceAction(requestPayload);

    if (res && res.data?.success !== false) {

      const flatLeads = (res.data.data?.technicalRequestedLeads || []).map((Lead) => {
        let submittedOnTimeAgo = "N/A";
        if (Lead.experience?.submittedOn) {
          try {
            submittedOnTimeAgo = formatDistanceToNow(new Date(Lead.experience.submittedOn), { addSuffix: true });
          } catch (e) {
            console.error("Date formatting failed", e);
          }
        }

        return {
          ...Lead,
          assignedTac: Lead.preferences?.consultantId
            ? `${Lead.preferences.consultantId.firstName} ${Lead.preferences.consultantId.lastName}`
            : "Unassigned",
          expType: Lead.experience?.type || "N/A",
          submittedOnTimeAgo,
          rawRecord: Lead
        };
      });

      setLeads(flatLeads);

      setTotalPages(res.data.data?.meta?.totalPages || 1);
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
    responsiveTableSx, getTechStatusBadge, COLS
  };
};