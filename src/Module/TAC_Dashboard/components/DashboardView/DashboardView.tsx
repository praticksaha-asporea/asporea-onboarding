"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Box, Typography } from "@mui/material";

import {
  getTacCandidatesAction,
  CandidateRow,
} from "@/Services/APIs/tac/tac.actions";
import { getTacListAction } from "@/Services/APIs/Inquiry/inquiry.action";
import {
  getSlotsAction,
  bookSlotAction,
} from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
import { scheduleAssessmentAction } from "@/Services/APIs/Assessment/assessment.actions";
// Sub-components
import DashboardKpiCards from "./DashboardKpiCards";
import DashboardFilters from "./DashboardFilters";
import DashboardTable from "./DashboardTable";
import DashboardScheduleModal from "./DashboardScheduleModal";
import DashboardCommunicationModal from "./DashboardCommunicationModal";  

interface DashboardProps {
  setCurrentView: (view: "dashboard" | "detail") => void;
  setSelectedCandidate: (candidate: any) => void;
}

interface Kpis {
  openCases: number;
  pendingCounselling: number;
  pendingAssessment: number;
}

const DashboardView: React.FC<DashboardProps> = () => {
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
  const [total, setTotal] = useState(0);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [targetLead, setTargetLead] = useState<any | null>(null);
  const [commModalOpen, setCommModalOpen] = useState(false);
  const [commMode, setCommMode] = useState<"chat" | "email" | null>(null);
  const [commCandidate, setCommCandidate] = useState<any | null>(null);
   
  const [tacList, setTacList] = useState<any[]>([]);
  const [selectedTac, setSelectedTac] = useState("");

  const serverNow = new Date();
  const utcTime = serverNow.getTime() + serverNow.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + 330 * 60000);
  const todayStr = istTime.toISOString().split("T")[0];

  const [date, setDate] = useState(todayStr);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [schedulePhase, setSchedulePhase] = useState<"pre" | "assess">("pre");

  const openCommModal = (candidate: any, mode: "chat" | "email") => {
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
      setRows(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
      if (res.kpis) setKpis(res.kpis);
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
      const res = await getTacListAction(candidate.branchId as string);
      if (res?.success) setTacList(res.data);
    }
  };

  useEffect(() => {
    const loadSlots = async () => {
     if (!selectedTac || !date || !modalOpen) return;
      setSlotsLoading(true);
      setSelectedSlot(null);
      const res = await getSlotsAction(selectedTac, date);
      if (res?.success) {
        setSlots(res.data);
      } else {
        toast.error(res?.message || "Failed to fetch slots");
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
      consultantId: selectedTac,
      date,
      from: selectedSlot.from,
      to: selectedSlot.to,
      method: method as "on" | "off",  
    };

    let res;

    if (schedulePhase === "pre") {
      res = await bookSlotAction(payload);
    } else {
      res = await scheduleAssessmentAction(payload);
    }

    if (res?.success) {
      toast.success(
        `${schedulePhase === "pre" ? "Pre-Counselling" : "Assessment"} session scheduled successfully!`,
      );
      setModalOpen(false);
      fetchCandidates();
    } else {
      toast.error(res?.message || "Failed to book slot");
    }
    setBookingLoading(false);
  };

  return (
    <Box className="w-full rounded-[20px] shadow-2xl  p-4 md:p-8 font-sans">
      <Typography className="text-[22px] md:text-[28px] font-medium tracking-tight mb-6">
        {isFoe ? "FOE  Dashboard" : "TAC Assignment Dashboard"}
      </Typography>

      <DashboardKpiCards kpis={kpis} total={total} />

      <DashboardFilters
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        experienceFilter={experienceFilter}
        setExperienceFilter={setExperienceFilter}
      />

     <DashboardTable
        rows={rows}
        loading={loading}
        error={error}
        isFoe={isFoe}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        openScheduleModal={openScheduleModal}
        openCommModal={openCommModal}  
        onViewCandidate={(id) => router.push(`/dashboard/candidate/${id}`)}
      />

      <DashboardScheduleModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        targetLead={targetLead}
        tacList={tacList}
        selectedTac={selectedTac}
        setSelectedTac={setSelectedTac}
        date={date}
        setDate={setDate}
        todayStr={todayStr}
        slotsLoading={slotsLoading}
        slots={slots}
        selectedSlot={selectedSlot}
        setSelectedSlot={setSelectedSlot}
        handleBookSlot={handleBookSlot}
        bookingLoading={bookingLoading}
        schedulePhase={schedulePhase}
      />

      <DashboardCommunicationModal
        open={commModalOpen}
        onClose={() => setCommModalOpen(false)}
        candidate={commCandidate}
        mode={commMode}
      />
    </Box>
  );
};

export default DashboardView;
