import { useState, useEffect, useCallback, useRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getAwaitingDocumentsAction } from "@/Services/APIs/tacHead/document.action";
import { documentApprovalListPayload } from "@/Types/Frontend_Payload/document.types";
import { awaitingDocLeadRecord } from "@/Types/ApiResponse/documentRes.types";

dayjs.extend(relativeTime);

export interface enrichedDocumentLead {
  _id: string;
  rawRecord: awaitingDocLeadRecord;
  fullName: string;
  inqNo: string;
  assignedTac: string;
  positionApplied: string;
  submittedOnTimeAgo: string;
}

export const useDocumentApproval = () => {
  const [leads, setLeads] = useState<awaitingDocLeadRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<awaitingDocLeadRecord | null>(null);
  
  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filters, setFilters] = useState<documentApprovalListPayload>({
    page: 1,
    limit: 10,
    search: "",
  });

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: val, page: 1 }));
    }, 400);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
    
      const res = await getAwaitingDocumentsAction(filters);
      
       
      if (res?.data?.success) {
        setLeads(res.data.data?.leads || []);
        setTotalPages(res.data.data?.meta?.totalPages || 1);
      }
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const openActionModal = (lead: awaitingDocLeadRecord) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  const formattedLeadsForUI = leads.map((lead): enrichedDocumentLead => ({
    _id: lead._id,
    rawRecord: lead,
    fullName: lead.fullName,
    inqNo: lead.inqNo || "N/A",
    assignedTac: lead.preferences?.consultantId 
      ? `${lead.preferences.consultantId.firstName} ${lead.preferences.consultantId.lastName}` 
      : "Unassigned",
    positionApplied: lead.documents?.position?.title || "N/A",
    submittedOnTimeAgo: lead.documents?.submittedOn 
      ? dayjs(lead.documents.submittedOn).fromNow() 
      : "N/A",
  }));

  return {
    leads: formattedLeadsForUI,
    loading,
    filters,
    totalPages,
    modalOpen,
    setModalOpen,
    selectedLead,
    searchInput,
    handleSearchChange,
    handlePageChange,
    openActionModal,
    fetchDocuments,
  };
};