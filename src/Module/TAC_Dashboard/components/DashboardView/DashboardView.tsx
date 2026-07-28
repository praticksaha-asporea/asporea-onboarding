"use client";

import React from "react";

import {
  Box,
  Typography,
  Dialog,
  IconButton,
  Button,
  Chip,
  Avatar,
} from "@mui/material";
// Sub-components
import DashboardKpiCards from "./DashboardKpiCards";
import DashboardFilters from "./DashboardFilters";
import DashboardTable from "./DashboardTable";
import DashboardScheduleModal from "./DashboardScheduleModal";
import DashboardCommunicationModal from "./DashboardCommunicationModal";
import { kpiTypes, useDashboardView } from "./useDashboardView";
import { CandidateRow, tacData } from "@/Types/object.types";
import { Slot } from "@/Types/Frontend_Payload/assessment.types";
import { CamelCase } from "@/Utils/common";
const resolveFileSrc = (path?: string) => {
  if (!path) return "/images/avatars/avatar.png";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  )
    return path;
  const BACKEND_BASE =
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:3000";
  return `${BACKEND_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};
export interface DashboardProps {
  // setCurrentView: (view: "dashboard" | "detail") => void;
  // setSelectedCandidate: (candidate: CandidateLead) => void;
}

const DashboardView: React.FC<DashboardProps> = () => {
  const {
    isFoe,
    kpis,
    total,
    searchInput,
    previewImage,
    setPreviewImage,
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
  } = useDashboardView();

  return (
    <Box className="w-full rounded-[20px] shadow-2xl  p-4 md:p-8 font-sans">
      <Typography className="text-[22px] md:text-[28px] font-medium tracking-tight mb-6">
        {isFoe ? "FOE Dashboard" : "TAC Dashboard"}
      </Typography>

      <DashboardKpiCards kpis={kpis as kpiTypes} variant={isFoe ? "foe" : "tac"} />

      {lastCandidate && page === 1 && !loading && (
        <Box className="mb-6 p-4 md:p-5 bg-white dark:bg-[var(--mui-palette-background-paper)] rounded-2xl  dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <Box className="flex items-center gap-4">
            <Avatar
              src={resolveFileSrc(lastCandidate.profilePic as any)}
              sx={{
                width: 48,
                height: 48,
                border: "2px solid #e2e8f0",
                cursor: "pointer",
              }}
              className="hover:scale-105 transition-transform shadow-sm"
              onClick={() =>
                setPreviewImage(resolveFileSrc(lastCandidate.profilePic as any))
              }
            />
            <Box>
              <Typography
                className="text-[14px] text-[var(--mui-palette-secondary)]
font-medium tracking-wider "
              >
                Last Candidate Detail
              </Typography>
              <Typography
                variant="h6"
                className="font-bold mt-1 text-[var(--mui-palette-text-secondary)] text-base"
              >
                {lastCandidate.name}{" "}
                <span className="text-xs ml-1 font-normal text-gray-500">
                  ({lastCandidate.inqNo})
                </span>
              </Typography>
              {isFoe && lastCandidate.assignedTacName && (
                <Typography className="text-xs text-gray-500 font-medium mt-0.5">
                  Assigned TAC:{" "}
                  <span className="text-blue-600 font-semibold">
                    {lastCandidate.assignedTacName}
                  </span>
                </Typography>
              )}
            </Box>
          </Box>

          <Box className="flex items-center gap-3 flex-wrap">
            <Box className="flex flex-col">
              <Typography className="text-[10px]  text-gray-400 font-semibold">
                Latest Visit Type
              </Typography>
              <Chip
                label={
                  lastCandidate.visitType === "online" ||
                  lastCandidate.visitType === "on"
                    ? "🌐 Online"
                    : "🏢 In-Person"
                }
                size="small"
                className={`font-bold mt-2 text-xs ${
                  lastCandidate.visitType === "online" ||
                  lastCandidate.visitType === "on"
                    ? " !text-[var(--mui-palette-primary-main)]"
                    : "!bg-purple-100 !text-purple-700"
                }`}
              />
            </Box>

            <Box className="flex flex-col">
              <Typography className="text-[10px] text-gray-400 font-semibold">
                Current Status
              </Typography>
              <Chip
                label={CamelCase(lastCandidate.status)}
                size="small"
                variant="outlined"
                color="primary"
                className="font-medium mt-2  text-xs"
              />
            </Box>

            <Button
              variant="contained"
              size="small"
              onClick={() =>
                router.push(`/dashboard/candidate/${lastCandidate._id}`)
              }
              className="rounded-xl text-xs mt-5 normal-case font-semibold px-4 py-1.5 shadow-none"
            >
              View Profile
            </Button>
          </Box>
        </Box>
      )}
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
        PaperProps={{
          style: { backgroundColor: "transparent", boxShadow: "none" },
        }}
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
