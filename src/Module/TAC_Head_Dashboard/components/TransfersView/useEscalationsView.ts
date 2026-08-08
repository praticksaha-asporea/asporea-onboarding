import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CamelCase } from "@/Utils/common";
import { getEscalationListAction } from "@/Services/APIs/tacHead/escalation.actions";
import { transferRecord, transferUserRef } from "@/Types/ApiResponse/transferRes.types";
import { transferListPayload } from "@/Types/Frontend_Payload/transfer.types";

dayjs.extend(relativeTime);

export interface enrichedEscalationRow {
  _id: string;
  rawRecord: transferRecord;
  inqNo: string;
  fullName: string;
  leadStatus: string;
  fromName: string;
  toName: string;
  statusLabel: string;
  statusColor: "success" | "error" | "warning";
  timeAgo: string;
  candidateAvatar: string | null;
  fromAvatar: string | null;
  toAvatar: string | null;
}

export const useEscalationsView = () => {
  const [escalations, setEscalations] = useState<transferRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [uniqueTacs, setUniqueTacs] = useState<transferUserRef[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState<transferRecord | null>(null);


  const [filters, setFilters] = useState<transferListPayload>({
    page: 1,
    limit: 10,
    search: "",
    tacId: ""
  });

  const getStatusColor = (status: string): "success" | "error" | "warning" => {
    if (status === "approved") return "success";
    if (status === "rejected") return "error";
    return "warning";
  };

  const fetchEscalations = useCallback(async () => {
    setLoading(true);
    try {

      const res = await getEscalationListAction(filters);

      if (res?.data?.success) {
        const rawList = res.data.data.transfers || [];
        setEscalations(rawList);
        setTotalPages(res.data.data.meta.totalPages || 1);

        if (filters.page === 1 && filters.tacId === "") {
          const tacs = rawList.map((esc) => esc.toId).filter(Boolean) as transferUserRef[];
          const unique = Array.from(new Set(tacs.map((a) => a._id))).map(id => {
            return tacs.find((a) => a._id === id);
          }) as transferUserRef[];
          setUniqueTacs(unique);
        }
      } else {
        toast.error(res?.data?.message || "Failed to load requests");
      }
    } catch (err) {
      toast.error("An unexpected error occurred while loading dashboard.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEscalations();
  }, [fetchEscalations]);

  const openActionModal = (escalation: transferRecord) => {
    setSelectedEscalation(escalation);
    setModalOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      tacId: ""
    });
  };

  const handleSearchChange = (val: string) => {
    setFilters((prev) => ({ ...prev, search: val, page: 1 }));
  };

  const handleTacChange = (val: string) => {
    setFilters((prev) => ({ ...prev, tacId: val, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };
  const formattedEscalationsForUI = escalations.map((row: any): enrichedEscalationRow => {


    const candPic = row.leadId?.createdBy?.id?.profilePic?.path || null;
    const fromPic = row.fromId?.profilePic?.path || null;
    const toPic = row.toId?.profilePic?.path || null;

    return {
      _id: row._id,
      rawRecord: row,
      inqNo: row.leadId?.inqNo || "N/A",
      fullName: row.leadId?.fullName || "—",
      leadStatus: CamelCase(row.leadId?.status || ""),
      fromName: row.fromId ? `${row.fromId.firstName} ${row.fromId.lastName}` : "—",
      toName: row.toId ? `${row.toId.firstName} ${row.toId.lastName}` : "—",
      statusLabel: CamelCase(row.status || ""),
      statusColor: getStatusColor(row.status || ""),
      timeAgo: dayjs(row.createdAt).fromNow(),
      candidateAvatar: candPic,
      fromAvatar: fromPic,
      toAvatar: toPic,
    };
  });
  return {
    escalations: formattedEscalationsForUI,
    loading,
    filters,
    totalPages,
    handleSearchChange,
    handleTacChange,
    handlePageChange,
    uniqueTacs,
    modalOpen,
    setModalOpen,
    selectedEscalation,
    openActionModal,
    handleResetFilters,
    fetchEscalations,
  };
};