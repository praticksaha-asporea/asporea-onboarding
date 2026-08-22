import { useEffect, useState, useCallback } from "react";
import { getLeadLogsAction } from "@/Services/APIs/leadLogs/leadLogs.actions";
import { ILeadLogItem } from "@/Types/ApiResponse/leadLogRes.types";

export const useLeadLogsCard = (leadId: string) => {
  const [logs, setLogs] = useState<ILeadLogItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const res = await getLeadLogsAction({ leadId });
      if (res.data?.success) {
        setLogs(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch lead logs", error);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    refetchLogs: fetchLogs,
  };
};
