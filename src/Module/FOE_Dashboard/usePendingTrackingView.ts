import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPendingTrackingAction } from "../../Services/APIs/tac/tac.actions";

export const usePendingTrackingView = () => {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
 
    const [commModalOpen, setCommModalOpen] = useState(false);
    const [commMode, setCommMode] = useState<"chat" | "email" | null>(null);
    const [commCandidate, setCommCandidate] = useState<any | null>(null);
     
useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);  
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

    const fetchLeads = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPendingTrackingAction({ page, limit: 10,search });
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
    };

    useEffect(() => {
        fetchLeads();
    }, [page,search]);

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
        router.push(`/dashboard/candidate/${id}`);
    };

    const cols = [
        "Candidate Name",
        "Inquiry No",
        "Pending Stage",
        "Pending Since",
        "Actions",
    ];

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
        openCommModal,
        commModalOpen,
        setCommModalOpen,
        commMode,
        commCandidate,
        cols,
    };
};