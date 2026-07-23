"use client";

import React from "react";

import { Box, Typography,Dialog, IconButton } from "@mui/material";

// Sub-components
import DashboardKpiCards from "./DashboardKpiCards";
import DashboardFilters from "./DashboardFilters";
import DashboardTable from "./DashboardTable";
import DashboardScheduleModal from "./DashboardScheduleModal";
import DashboardCommunicationModal from "./DashboardCommunicationModal";
import { kpiTypes, useDashboardView } from "./useDashboardView";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";
import { CandidateRow, tacData } from "@/Types/object.types";
import { Slot } from "@/Types/Frontend_Payload/assessment.types";

export interface DashboardProps {
  // setCurrentView: (view: "dashboard" | "detail") => void;
  // setSelectedCandidate: (candidate: CandidateLead) => void;
}

const DashboardView: React.FC<DashboardProps> = () => {

  const { isFoe, kpis, total, searchInput,previewImage, setPreviewImage, setSearchInput, statusFilter, setStatusFilter, experienceFilter, setExperienceFilter, rows, loading, error, page, totalPages, setPage, openScheduleModal, openCommModal, router, modalOpen, setModalOpen, targetLead, tacList, selectedTac, setSelectedTac, date, setDate, todayStr, slotsLoading, slots, selectedSlot, setSelectedSlot, handleBookSlot, bookingLoading, schedulePhase, commModalOpen, setCommModalOpen, commCandidate, commMode } = useDashboardView();

  return (
    <Box className="w-full rounded-[20px] shadow-2xl  p-4 md:p-8 font-sans">
      <Typography className="text-[22px] md:text-[28px] font-medium tracking-tight mb-6">
        {isFoe ? "FOE  Dashboard" : "TAC Dashboard"}
      </Typography>

      <DashboardKpiCards kpis={kpis as kpiTypes} total={total} />

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
        onPreviewImage={setPreviewImage}
      />

      <Dialog 
        open={!!previewImage} 
        onClose={() => setPreviewImage(null)} 
        maxWidth="md"
        PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none' } }}
      >
        <Box className="relative">
          <IconButton 
            onClick={() => setPreviewImage(null)} 
            className="absolute -top-4 -right-4 bg-white text-gray-800 shadow-md hover:bg-gray-200 z-50"
          >
            <i className="mdi--close text-xl" />
          </IconButton>
          <img 
            src={previewImage || ""} 
            alt="Candidate Preview" 
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain bg-white"
          />
        </Box>
      </Dialog>

      <DashboardScheduleModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        targetLead={targetLead as CandidateRow}
        tacList={tacList}
        selectedTac={selectedTac as tacData}
        setSelectedTac={setSelectedTac}
        date={date}
        setDate={setDate}
        todayStr={todayStr}
        slotsLoading={slotsLoading}
        slots={slots}
        selectedSlot={selectedSlot as Slot}
        setSelectedSlot={setSelectedSlot}
        handleBookSlot={handleBookSlot}
        bookingLoading={bookingLoading}
        schedulePhase={schedulePhase}
      />

      <DashboardCommunicationModal
        open={commModalOpen}
        onClose={() => setCommModalOpen(false)}
        candidate={commCandidate as CandidateRow}
        mode={commMode}
      />
    </Box>
  );
};

export default DashboardView;
