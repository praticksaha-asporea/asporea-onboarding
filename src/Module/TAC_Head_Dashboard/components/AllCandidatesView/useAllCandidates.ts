import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getAllCandidatesAction } from "@/Services/APIs/tacHead/candidate.action";
import { TacHeadCandidate, CandidateBranch, ParsedTacConsultant } from "@/Types/Frontend_Payload/tacHead.types";
import { getTacListAction } from "@/Services/APIs/Inquiry/inquiry.action";
import { CandidateRow, tacData } from "@/Types/object.types";
import { Slot } from "@/Types/Frontend_Payload/assessment.types";
import { CounsellingMode } from "@/Module/Candidate_Dashboard/Pre-Counselling/usePreCounselling";
import { bookSlotAction, cancelBookingAction, getSlotsAction, getTacsListAction } from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import { scheduleAssessmentAction } from "@/Services/APIs/Assessment/assessment.actions";
import { useSelector } from "react-redux";
import { branchListingApi } from "@/Services/APIs/branch/branch.actions";

export const useAllCandidates = () => {
  const router = useRouter();
  const [candidates, setCandidates] = useState<TacHeadCandidate[]>([]);
  const [branches, setBranches] = useState<CandidateBranch[]>([]);
  const [tacs, setTacs] = useState<ParsedTacConsultant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [targetLead, setTargetLead] = useState<CandidateRow | null>(null);
  const [schedulePhase, setSchedulePhase] = useState<"pre" | "assess">("pre");
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [selectedTac, setSelectedTac] = useState<tacData | string>("");
  const [tacList, setTacList] = useState<tacData[]>([]);

  const serverNow = new Date();
  const utcTime = serverNow.getTime() + serverNow.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + 330 * 60000);
  const todayStr = istTime.toISOString().split("T")[0];

  const [date, setDate] = useState(todayStr);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [method, setMethod] = useState<string>(targetLead?.visitType as CounsellingMode);

  const [commModalOpen, setCommModalOpen] = useState(false);
  const [commCandidate, setCommCandidate] = useState<CandidateRow | null>(null);
  const [commMode, setCommMode] = useState<"chat" | "email" | null>(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTargetLead, setCancelTargetLead] = useState<CandidateRow | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const currentUser = useSelector(
    (state: any) => state?.userSlice?.userData || state.user?.userData,
  );

  const [filters, setFilters] = useState({
    branchId: "",
    tacId: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  // ── Debounced Search Local State & Ref tracking ──
  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const preRescheduleStatuses = ["pre_scheduled", "pre_contacted", "pre_queued"];
  const assessScheduleStatuses = [
    "exp_submitted",
    "doc_verified",
    "exp_verified",
    "assess_scheduled",
    "assessment_scheduled",
    "assess_contacted",
    "assess_queued",
    "assess_not_responded",
  ];

  const cancellableStatuses = [
    "pre_scheduled",
    "pre_contacted",
    "pre_queued",
  ];

  const getCandidateStatusBadge = (status: string): string => {
    switch (status) {
      case "inquiry_submitted":
      case "doc_submitted":
      case "exp_submitted":
      case "assessment_submitted":
        return "bg-blue-500 text-white dark:bg-blue-500 dark:text-white";
      case "doc_verified":
      case "exp_verified":
      case "pre_completed":
      case "assess_completed":
        return "bg-green-500 text-white dark:bg-green-90 dark:text-white";
      case "pre_contacted":
      case "assess_contacted":
        return "bg-teal-500 text-white dark:bg-teal-95 dark:text-white";
      case "pre_queued":
      case "assess_queued":
        return "bg-orange-500 text-white dark:bg-orange-95 dark:text-white";
      case "pre_scheduled":
      case "assess_scheduled":
      case "assessment_scheduled":
        return "bg-amber-600 text-white dark:bg-amber-700 dark:text-white";
      case "pre_not_responded":
      case "assess_not_responded":
        return "bg-pink-500 text-white dark:bg-pink-96 dark:text-white";
      case "pre_rejected":
      case "assess_rejected":
      case "exp_rejected":
      case "doc_rejected":
        return "bg-red-600 text-white dark:bg-red-98 dark:text-white";
      case "exp_request_technical":
        return "bg-amber-400 text-white dark:bg-amber-500 dark:text-white";
      case "doc_awaiting_approval":
        return "bg-purple-500 text-white dark:bg-purple-95 dark:text-white";
      default:
        return "bg-slate-400 text-white dark:bg-gray-400 dark:text-white";
    }
  };


  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAllCandidatesAction({
        page: filters.page,
        limit: filters.limit,
        branchId: filters.branchId,
        tacId: filters.tacId,
        search: filters.search
      });

      if (res?.data?.success) {
        const data = res.data.data;
        setCandidates(data.candidates || []);
        setTotalPages(data.totalPages || 1);

        // if (data.candidates && data.candidates.length > 0) {
        //   const uniqueBranches = Array.from(
        //     new Map(
        //       data.candidates.map((c) => [
        //         c.preferences?.branchId?._id,
        //         c.preferences?.branchId,
        //       ]),
        //     ).values(),
        //   ).filter(Boolean) as CandidateBranch[];

        //   const tacMap = new Map();
        //   data.candidates.forEach((c) => {
        //     const tac = c.preferences?.consultantId;
        //     const bId = c.preferences?.branchId?._id;

        //     if (tac && tac._id) {
        //       if (!tacMap.has(tac._id)) {
        //         tacMap.set(tac._id, { ...tac, branchIds: new Set<string>() });
        //       }
        //       if (bId) {
        //         tacMap.get(tac._id).branchIds.add(bId);
        //       }
        //     }
        //   });

        //   const uniqueTacs: ParsedTacConsultant[] = Array.from(tacMap.values()).map((t: any) => ({
        //     ...t,
        //     branchIds: Array.from(t.branchIds),
        //   }));

        //   if (branches.length === 0) setBranches(uniqueBranches);
        //   if (tacs.length === 0) setTacs(uniqueTacs);
        // }
      } else {
        toast.error(res?.data?.message || "Failed to fetch candidates");
      }
    } catch (err) {
      toast.error("An error occurred while fetching candidates.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, branches.length, tacs.length]);


  const fetchBranches = useCallback(
    async () => {
      //lat: number, lng: number
      try {
        const response = await branchListingApi();
        const list = response?.data?.data?.data || [];
        setBranches(list);
      } catch (error) {
        console.error("Branch fetch error:", error);
        toast.error("Failed to fetch nearby branches");
      }
    },
    [],
  );
  useEffect(() => {
    fetchCandidates();
    fetchBranches();
  }, [fetchCandidates]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => {
      const updated = { ...prev, [name]: value, page: 1 };

      if (name === "branchId") {
        if (value !== "") {
          const currentTac = tacs.find((t: any) => t._id === prev.tacId);
          if (currentTac && !currentTac.branchIds.includes(value)) {
            updated.tacId = "";
          }
        }
      }
      return updated;
    });
  };

  const onSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleFilterChange("search", val);
    }, 400);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };
  const handleViewCandidate = (id: string) => {
    router.push(`/tac-head/candidate/${id}`);
  };
  const filteredTacs = filters.branchId
    ? tacs.filter((t: any) => t.branchIds.includes(filters.branchId))
    : tacs;


  const formattedCandidatesForUI = candidates.map((row) => ({
    _id: row._id,
    fullName: row.fullName || "—",
    inqNo: row.inqNo || "—",
    branchTitle: row.preferences?.branchId?.title || "—",
    tacName: row.preferences?.consultantId
      ? `${row.preferences.consultantId.firstName} ${row.preferences.consultantId.lastName}`
      : "Unassigned",
    phone: row.contact?.phone || "—",
    email: row.contact?.email || "—",
    statusClass: getCandidateStatusBadge(row.status || ""),
    statusLabel: row.status ? row.status.replace(/_/g, " ") : "—",
    status: row.status,
    preferences: row.preferences || {}
  }));



  const openScheduleModal = async (
    candidate: any,
    isReschedule = false,
    phase: "pre" | "assess" = "pre",
  ) => {
    // console.log(candidate, 222);
    setSelectedBranch(candidate?.preferences?.branchId?._id);
    setTargetLead({ name: candidate.fullName, ...candidate });
    setSchedulePhase(phase);
    setModalOpen(true);
    let prevId = "";
    if (isReschedule) {
      const rawConsultantId =
        candidate?.preferences?.consultantId || candidate?.consultantId;
      if (rawConsultantId) {
        prevId =
          typeof rawConsultantId === "object" && rawConsultantId._id
            ? rawConsultantId._id.toString()
            : rawConsultantId.toString();
      }
    }

    // setSelectedTac(prevId);
    setDate(todayStr);
    setSlots([]);
    setSelectedSlot(null);
    setMethod(candidate?.preferences?.visitType == "off" ? "offline" : "online");

    if (candidate?.preferences?.branchId?._id) {
      await fetchTacs(candidate?.preferences?.branchId?._id, method, candidate?.preferences?.consultantId?._id);
      // setSelectedTac(candidate?.preferences?.consultantId?._id || "");

    }
  };
  // const loadTacList = async (selectedBranch: string) => {
  // if (selectedBranch) {
  //     const res = await getTacListAction({ branchId: selectedBranch });
  //     if (res?.data?.success) setTacList(res?.data?.data);
  //   }
  // }

  const fetchTacs = async (selectedBranch: string, mode: string, selectedConsultantId?: string) => {
    if (!selectedBranch) {
      setTacs([]);
      return;
    }
    // setLoadingTacs(true);
    try {
      if (selectedBranch && mode) {
        const payload = {
          page: 1,
          limit: 10,
          search: '',
          mode: mode as CounsellingMode,
          branchId: selectedBranch,
        };
        const res = await getTacsListAction(payload);
        // console.log(res, 77777);

        const list = res?.data?.data?.tacList || [];
        setTacList(list as any);
        setSelectedTac(selectedConsultantId as string);
      }

    } catch (err) {
      console.error("TAC fetch error:", err);
      setTacList([]);
    } finally {
      // setLoadingTacs(false);
    }
  };
  // Fetch TAC list
  useEffect(() => {
    fetchTacs(selectedBranch, method);
  }, [selectedBranch, method]);

  // useEffect(() => {
  //   loadTacList(selectedBranch);
  // }, [selectedBranch])

  const openCancelModal = (candidate: CandidateRow) => {
    setCancelTargetLead(candidate);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleBookSlot = async () => {
    if (!selectedBranch || !method || !targetLead || !selectedTac || !selectedSlot) return;
    setBookingLoading(true);
    const methodMentioned = (method === "online" ? "on" : "off") as
      | "on"
      | "off";
    // const payload = {
    //   leadId: targetLead._id,
    //   consultantId: selectedTac as string,
    //   date,
    //   from: selectedSlot.from as keyof Slot,
    //   to: selectedSlot.to as keyof Slot,
    //   method: method as "on" | "off",
    // };

    const payload = new FormData();
    payload.append("leadId", targetLead._id);
    payload.append("branchId", selectedBranch);
    payload.append("method", methodMentioned);

    if (selectedTac) {
      payload.append("consultantId", selectedTac?.toString());
      payload.append("date", date);
      payload.append("from", selectedSlot?.from as string);
      payload.append("to", selectedSlot?.to as string);
    }

    let res;

    if (schedulePhase === "pre") {
      res = await bookSlotAction(payload);
    } else {
      res = await scheduleAssessmentAction(payload);
    }

    if (res?.data?.success) {
      toast.success(
        `${schedulePhase === "pre" ? "Pre-Counselling" : "Assessment"} session scheduled successfully!`,
      );
      setModalOpen(false);
      fetchCandidates();
    } else {
      toast.error(res?.data?.message || "Failed to book slot");
    }
    setBookingLoading(false);
  };


  const handleConfirmCancel = async () => {
    if (!cancelTargetLead) return;

    if (!cancelReason?.trim()) {
      return toast.error("Please enter a reason for cancellation.");
    }

    setCancelLoading(true);
    try {
      const res = await cancelBookingAction({
        leadId: cancelTargetLead._id,
        actionBy: currentUser?._id || currentUser?.id,
        cancelReason: cancelReason?.trim(),
      });

      if (res?.data?.success) {
        toast.success("Session cancelled successfully!");
        setCancelModalOpen(false);
        setCancelTargetLead(null);
        setCancelReason("");
        fetchCandidates();
      } else {
        toast.error(res?.data?.message || "Failed to cancel session.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setCancelLoading(false);
    }
  };


  useEffect(() => {

    const loadSlots = async () => {
      if (!selectedTac || !date || !modalOpen) return;
      setSlotsLoading(true);
      setSelectedSlot(null);
      const res = await getSlotsAction({
        consultantId: selectedTac as string,
        date,
      });
      if (res?.data?.success) {
        setSlots(res?.data?.data);
      } else {
        toast.error(res?.data?.message || "Failed to fetch slots");
        setSlots([]);
      }
      setSlotsLoading(false);
    };
    loadSlots();
  }, [selectedTac, date, modalOpen]);

  return {
    candidates: formattedCandidatesForUI, // 🌟 UI gets fully formatted model
    branches,
    tacs: filteredTacs,
    filters,
    totalPages,
    isLoading,
    searchInput,
    onSearchChange,
    handleFilterChange,
    handlePageChange,
    handleViewCandidate,
    preRescheduleStatuses,
    assessScheduleStatuses,
    cancellableStatuses,
    openScheduleModal,
    openCancelModal,

    modalOpen, setModalOpen,
    targetLead, setTargetLead,
    tacList, selectedTac, setSelectedTac,
    date,
    setDate,
    todayStr,
    slotsLoading,
    slots,
    selectedSlot,
    setSelectedSlot,
    handleBookSlot,
    bookingLoading,
    schedulePhase,
    selectedBranch,
    setSelectedBranch,
    method,
    setMethod,
    commModalOpen, setCommModalOpen,
    cancelModalOpen, setCancelModalOpen,
    commCandidate, setCommCandidate,
    commMode, setCommMode,
    cancelReason, setCancelReason,
    handleConfirmCancel,
    cancelLoading, setCancelLoading,
    cancelTargetLead
  };
};