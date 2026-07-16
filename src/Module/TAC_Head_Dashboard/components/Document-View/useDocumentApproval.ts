import { useState, useEffect, useCallback, useRef } from "react";
import { getAwaitingDocumentsAction } from "@/Services/APIs/tacHead/document.action";

export const useDocumentApproval = () => {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = (val: string) => {
        setSearchInput(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(val);
            setPage(1);
        }, 400);
    };

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        const res = await getAwaitingDocumentsAction(page, 10, debouncedSearch);
        if (res && res.success !== false) {
            setLeads(res.data?.leads || []);
            setTotalPages(res.data?.meta?.totalPages || 1);
        }
        setLoading(false);
    }, [page, debouncedSearch]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

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
        handleSearchChange,
        openActionModal,
        fetchDocuments,
    };
};