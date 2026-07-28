import { scheduleAssessmentAction } from "@/Services/APIs/Assessment/assessment.actions";
import { getTacListAction } from "@/Services/APIs/Inquiry/inquiry.action";
import {
  bookSlotAction,
  getSlotsAction,
} from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import { getTacCandidatesAction } from "@/Services/APIs/tac/tac.actions";
import { Slot } from "@/Types/Frontend_Payload/assessment.types";
import { CandidateRow, tacData } from "@/Types/object.types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";


export interface kpiTypes { openCases: number, pendingCounselling: number, pendingAssessment: number, escalationsRaised: number, unassignedInquiries: number } //dueToday: number,

export const useDashboardView = () => {
  const router = useRouter();
  const currentUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const isFoe =
    currentUser?.role === "foe" || currentUser?.user?.role === "foe";

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 10;

    const [rows, setRows] = useState<CandidateRow[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    // const [total, setTotal] = useState(0);
    const [kpis, setKpis] = useState<kpiTypes | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [targetLead, setTargetLead] = useState<CandidateRow | null>(null);
  const [commModalOpen, setCommModalOpen] = useState(false);
  const [commMode, setCommMode] = useState<"chat" | "email" | null>(null);
  const [commCandidate, setCommCandidate] = useState<CandidateRow | null>(null);

  const [tacList, setTacList] = useState<tacData[]>([]);
  const [selectedTac, setSelectedTac] = useState<tacData | string>("");

  const serverNow = new Date();
  const utcTime = serverNow.getTime() + serverNow.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + 330 * 60000);
  const todayStr = istTime.toISOString().split("T")[0];

  const [date, setDate] = useState(todayStr);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [schedulePhase, setSchedulePhase] = useState<"pre" | "assess">("pre");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const openCommModal = (candidate: CandidateRow, mode: "chat" | "email") => {
    setCommCandidate(candidate);
    setCommMode(mode);
    setCommModalOpen(true);
  };

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, experienceFilter]);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTacCandidatesAction({
        page,
        limit: LIMIT,
        search: search || undefined,
        status: statusFilter || undefined,
        experience: experienceFilter || undefined,
        kpis: kpis === null,
      });
      setRows(res.data?.data?.data);
      setTotalPages(res?.data?.data?.pagination.totalPages);
    //   setTotal(res?.data?.data?.pagination.total);
      if (res?.data?.data?.kpis) setKpis(res?.data?.data?.kpis);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, experienceFilter]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const openScheduleModal = async (
    candidate: any,
    isReschedule = false,
    phase: "pre" | "assess" = "pre",
  ) => {
    setTargetLead(candidate);
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

    setSelectedTac(prevId);
    setDate(todayStr);
    setSlots([]);
    setSelectedSlot(null);

    if (candidate.branchId) {
      const res = await getTacListAction({ branchId: candidate.branchId });
      if (res?.data?.success) setTacList(res?.data?.data);
    }
  };

  useEffect(() => {
    console.log(selectedTac, date, modalOpen, 2222);

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

  const handleBookSlot = async () => {
    if (!targetLead || !selectedTac || !selectedSlot) return;
    setBookingLoading(true);
    const method = (targetLead.visitType === "online" ? "on" : "off") as
      | "on"
      | "off";
    const payload = {
      leadId: targetLead._id,
      consultantId: selectedTac as string,
      date,
      from: selectedSlot.from as keyof Slot,
      to: selectedSlot.to as keyof Slot,
      method: method as "on" | "off",
    };

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

  const lastCandidate = rows.length > 0 ? rows[0] : null;

  return {
    isFoe,
    kpis,
    // total,
    searchInput,
    setSearchInput,
    statusFilter,
    setStatusFilter,
    experienceFilter,
    setExperienceFilter,
    rows,
    lastCandidate,
    loading,
    error,
    page,
    totalPages,
    setPage,
    openScheduleModal,
    openCommModal,
    router,
    modalOpen,
    setModalOpen,
    targetLead,
    tacList,
    selectedTac,
    setSelectedTac,
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
    commModalOpen,
    setCommModalOpen,
    commCandidate,
    commMode,
    previewImage,
    setPreviewImage,
  };
};
