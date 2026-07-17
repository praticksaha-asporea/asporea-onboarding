"use client";

import React from "react";

import { Box, Typography } from "@mui/material";

// Sub-components
import DashboardKpiCards from "./DashboardKpiCards";
import DashboardFilters from "./DashboardFilters";
import DashboardTable from "./DashboardTable";
import DashboardScheduleModal from "./DashboardScheduleModal";
import DashboardCommunicationModal from "./DashboardCommunicationModal";
import { useDashboardView } from "./useDashboardView";

export interface DashboardProps {
  setCurrentView: (view: "dashboard" | "detail") => void;
  setSelectedCandidate: (candidate: any) => void;
}

const DashboardView: React.FC<DashboardProps> = () => {

  const { isFoe, kpis, total, searchInput, setSearchInput, statusFilter, setStatusFilter, experienceFilter, setExperienceFilter, rows, loading, error, page, totalPages, setPage, openScheduleModal, openCommModal, router, modalOpen, setModalOpen, targetLead, tacList, selectedTac, setSelectedTac, date, setDate, todayStr, slotsLoading, slots, selectedSlot, setSelectedSlot, handleBookSlot, bookingLoading, schedulePhase, commModalOpen, setCommModalOpen, commCandidate, commMode } = useDashboardView();

  return (
    <Box className="w-full rounded-[20px] shadow-2xl  p-4 md:p-8 font-sans">
      <Typography className="text-[22px] md:text-[28px] font-medium tracking-tight mb-6">
        {isFoe ? "FOE  Dashboard" : "TAC Dashboard"}
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
