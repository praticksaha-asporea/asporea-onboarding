import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getReminderTargetsAction, sendBulkRemindersAction } from "@/Services/APIs/tacHead/reminder.action";
import { ReminderCandidateTarget, ReminderTacTarget } from "@/Types/reminder.types";

export const useReminders = () => {
  const [status, setStatus] = useState<string>("");
  const [candidates, setCandidates] = useState<ReminderCandidateTarget[]>([]);
  const [tacs, setTacs] = useState<ReminderTacTarget[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

   const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [selectedTacs, setSelectedTacs] = useState<string[]>([]);

   const [candidateHeading, setCandidateHeading] = useState("");
  const [candidateMessage, setCandidateMessage] = useState("");
  const [tacHeading, setTacHeading] = useState("");
  const [tacMessage, setTacMessage] = useState("");

   useEffect(() => {
    if (!status) {
      setCandidates([]);
      setTacs([]);
      return;
    }

    const fetchTargets = async () => {
      setIsLoading(true);
      try {
        const res = await getReminderTargetsAction(status);
        if (res.data.success) {
          setCandidates(res.data.data.candidates || []);
          setTacs(res.data.data.tacs || []);
        } else {
          toast.error(res.data.message || "Failed to fetch targets");
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTargets();
    
     setSelectedCandidates([]);
    setSelectedTacs([]);
    setCandidateHeading("");
    setCandidateMessage("");
    setTacHeading("");
    setTacMessage("");
  }, [status]);

 
  const toggleCandidate = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

   const toggleTac = (rowKey: string) => {
    setSelectedTacs((prev) =>
      prev.includes(rowKey) ? prev.filter((item) => item !== rowKey) : [...prev, rowKey]
    );
  };

  const handleSelectAllCandidates = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map((c) => c.leadId));
    }
  };

  const handleSelectAllTacs = () => {
    if (selectedTacs.length === tacs.length) {
      setSelectedTacs([]);
    } else {
      setSelectedTacs(tacs.map((t) => `${t.tacId}_${t.leadId}`));
    }
  };

   const selectedUniqueTacCount = new Set(
    selectedTacs.map((key) => key.split("_")[0])
  ).size;

   const handleSendReminders = async () => {
    if (selectedCandidates.length === 0 && selectedTacs.length === 0) {
      toast.error("Please select at least one Candidate or TAC.");
      return;
    }

    const payload: any = {};

    if (selectedCandidates.length > 0) {
      if (!candidateHeading.trim() || !candidateMessage.trim()) {
        toast.error("Please fill heading and message for candidates.");
        return;
      }
      payload.candidateReminders = {
        leadIds: selectedCandidates,
        heading: candidateHeading,
        message: candidateMessage,
      };
    }

    if (selectedTacs.length > 0) {
      if (!tacHeading.trim() || !tacMessage.trim()) {
        toast.error("Please fill heading and message for TACs.");
        return;
      }

       const tacItems = selectedTacs.map((rowKey) => {
        const [tacId, leadId] = rowKey.split("_");
        const matchedTac = tacs.find((t) => t.tacId === tacId && t.leadId === leadId);

        return {
          tacId,
          leadId,
          inqNo: matchedTac?.inqNo || "N/A",
        };
      });

      payload.tacReminders = {
        items: tacItems,
        heading: tacHeading,
        message: tacMessage,
      };
    }

    setIsSending(true);
    try {
      const res = await sendBulkRemindersAction(payload);
      if (res.data.success) {
        toast.success(res.data.message || "Reminders sent successfully!");
        
         setSelectedCandidates([]);
        setSelectedTacs([]);
        setCandidateHeading("");
        setCandidateMessage("");
        setTacHeading("");
        setTacMessage("");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send reminders");
    } finally {
      setIsSending(false);
    }
  };

  return {
    status,
    setStatus,
    candidates,
    tacs,
    isLoading,
    isSending,
    selectedCandidates,
    selectedTacs,
    selectedUniqueTacCount,
    toggleCandidate,
    toggleTac,
    handleSelectAllCandidates,
    handleSelectAllTacs,
    candidateHeading,
    setCandidateHeading,
    candidateMessage,
    setCandidateMessage,
    tacHeading,
    setTacHeading,
    tacMessage,
    setTacMessage,
    handleSendReminders,
  };
};