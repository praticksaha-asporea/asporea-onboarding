"use client";

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  CircularProgress,
  Paper,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useAllCandidates } from "./useAllCandidates";
import { CandidateRow, tacData } from "@/Types/object.types";
import DashboardScheduleModal from "@/Module/TAC_Dashboard/components/DashboardView/DashboardScheduleModal";
import { Slot } from "@/Types/Frontend_Payload/assessment.types";
import DashboardCommunicationModal from "@/Module/TAC_Dashboard/components/DashboardView/DashboardCommunicationModal";
import CancelBookingModal from "@/Module/FOE_Dashboard/CancelBookingModal";

const responsiveTableSx = {
  "& .resp-thead": { "@media (max-width: 767px)": { display: "none" } },
  "& .resp-row": {
    "@media (max-width: 767px)": {
      display: "block",
      borderBottom: "2px solid",
      borderColor: "divider",
      mb: 1,
      borderRadius: 2,
      overflow: "hidden",
    },
  },
  "& .resp-cell": {
    "@media (max-width: 767px)": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      px: 2,
      py: 1,
      borderBottom: "1px solid",
      borderColor: "divider",
      "&:last-child": { borderBottom: "none" },
      "&::before": {
        content: "attr(data-label)",
        fontWeight: 600,
        fontSize: "0.72rem",
        color: "text.secondary",
        flexShrink: 0,
        mr: 2,
        minWidth: 110,
      },
    },
  },
};

const COLS = ["Candidate", "Branch", "Assigned TAC", "Contact", "Status", "Actions"];

const AllCandidatesView = () => {
  const {
    candidates,
    branches,
    tacs,
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
    cancelLoading,
    setCancelLoading,
    cancelTargetLead

  } = useAllCandidates();

  return (
    <Box className="w-full rounded-[20px] shadow-2xl p-4 md:p-8 font-sans bg-[var(--mui-palette-primary)]">
      <Typography className="text-[22px] md:text-[28px] text-[var(--mui-palette-secondary)] font-medium tracking-tight mb-6">
        Candidates Under Your Supervision
      </Typography>

      {/* ── Filters Section ── */}
      <Box className="flex flex-col gap-3 mb-5">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, email or phone..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{ input: { className: "rounded-lg text-[14px]" } }}
        />

        <Box className="flex gap-2 flex-wrap">
          <Select
            displayEmpty
            size="small"
            value={filters.branchId}
            onChange={(e) => handleFilterChange("branchId", e.target.value)}
            className="flex-1 min-w-[160px] text-[12px]"
          >
            <MenuItem value="">All Assigned Branches</MenuItem>
            {branches.map((b: any) => (
              <MenuItem key={b._id} value={b._id}>
                {b.title}
              </MenuItem>
            ))}
          </Select>

          <Select
            displayEmpty
            size="small"
            value={filters.tacId}
            onChange={(e) => handleFilterChange("tacId", e.target.value)}
            className="flex-1 min-w-[160px] text-[12px]"
          >
            <MenuItem value="">All TAC Users</MenuItem>
            {tacs.map((t: any) => (
              <MenuItem key={t._id} value={t._id}>
                {t.firstName} {t.lastName}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* ── Main Data Table ── */}
      <TableContainer
        component={Paper}
        className="shadow-xl"
        sx={responsiveTableSx}
      >
        <Table size="small">
          <TableHead>
            <TableRow className="resp-thead">
              {COLS.map((head, i) => (
                <TableCell
                  key={i}
                  className={`py-4 px-4 font-semibold bg-[var(--mui-palette-primary)] text-[var(--mui-palette-secondary-main)] whitespace-nowrap ${head === "Status" ? "text-center" : ""
                    }`}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={COLS.length} className="text-center py-10">
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : candidates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLS.length}
                  className="text-center py-8 text-gray-400"
                >
                  No candidates found.
                </TableCell>
              </TableRow>
            ) : (
              candidates.map((row) => (
                <TableRow
                  key={row._id}
                  hover
                  className="resp-row transition-colors"
                >
                  {/* Candidate Name & Inquiry Code */}
                  <TableCell
                    className="resp-cell !py-3 !px-4"
                    data-label="Candidate"
                  >
                    <Box>
                      <Typography className="font-semibold text-[13px]">
                        {row.fullName}
                      </Typography>
                      <Typography className="text-[12px] text-[var(--mui-palette-text-secondary)]">
                        {row.inqNo}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Branch Assignment */}
                  <TableCell
                    className="resp-cell !py-3 !px-4 text-[13px]"
                    data-label="Branch"
                  >
                    {row.branchTitle}
                  </TableCell>

                  {/* Assigned TAC Module User */}
                  <TableCell
                    className="resp-cell !py-3 !px-4 text-[13px]"
                    data-label="Assigned TAC"
                  >
                    {row.tacName}
                  </TableCell>

                  {/* Contact Info (Phone & Email) */}
                  <TableCell
                    className="resp-cell !py-3 !px-4 text-[12px] text-[var(--mui-palette-text-secondary)]"
                    data-label="Contact"
                  >
                    <Box>
                      <Typography className="text-[12px]">
                        {row.phone}
                      </Typography>
                      <Typography
                        className="text-[12px] truncate max-w-[150px]"
                        title={row.email}
                      >
                        {row.email}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Operational Timeline Status Badge */}
                  <TableCell
                    className="resp-cell !py-3 !px-4 md:text-center"
                    data-label="Status"
                  >
                    <Box
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${row.statusClass}`}
                    >
                      {row.statusLabel}
                    </Box>
                  </TableCell>
                  <TableCell
                    className="resp-cell !py-3 !px-4 md:text-center"
                    data-label="Actions"
                  >



                    {row.status === "inquiry_submitted" && (
                      <Tooltip
                        title="Schedule Pre-Counselling"
                        placement="top"
                        arrow
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            openScheduleModal(row, false, "pre")
                          }
                          className="hover:bg-[rgba(59,130,246,0.08)] transition-all"
                          sx={{
                            color: "#3b82f6 !important",
                            padding: "6px",
                          }}
                        >
                          <i className="ri-calendar-event-line text-[18px]" />
                        </IconButton>
                      </Tooltip>
                    )}


                    {(row.status === "pre_not_responded" ||
                      preRescheduleStatuses.includes(
                        row.status
                      )) && (
                        <Tooltip
                          title="Reschedule Pre-Counselling"
                          placement="top"
                          arrow
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              openScheduleModal(row, true, "pre")
                            }
                            className="hover:bg-[rgba(249,115,22,0.08)] transition-all"
                            sx={{
                              color: "#f97316 !important",
                              padding: "6px",
                            }}
                          >
                            <i className="ri-calendar-schedule-line text-[18px]" />
                          </IconButton>
                        </Tooltip>
                      )}


                    {
                      assessScheduleStatuses.includes(
                        row.status
                      ) && (
                        <Tooltip
                          title="Schedule / Reschedule Assessment"
                          placement="top"
                          arrow
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              openScheduleModal(row, true, "assess")
                            }
                            className="hover:bg-[rgba(236,72,153,0.08)] transition-all"
                            sx={{
                              color: "#ec4899 !important",
                              padding: "6px",
                            }}
                          >
                            <i className="ri-calendar-todo-line text-[18px]" />
                          </IconButton>
                        </Tooltip>
                      )}


                    {cancellableStatuses.includes(row.status) && (
                      <Tooltip title="Cancel Session" placement="top" arrow>
                        <IconButton
                          size="small"
                          onClick={() => openCancelModal(row as unknown as CandidateRow)}
                          className="hover:bg-[rgba(239,68,68,0.08)] transition-all"
                          sx={{
                            color: "#ef4444 !important",
                            padding: "6px",
                          }}
                        >
                          <i className="ri-calendar-close-line text-[18px]" />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="View Profile" placement="top" arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleViewCandidate(row._id)}
                        className="hover:bg-[rgba(147,51,234,0.08)] transition-all"
                        sx={{
                          color: "var(--mui-palette-primary-main) !important",
                          padding: "6px",
                        }}
                      >
                        <i className="mdi--user text-[20px]" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Table Pagination Controls ── */}
      {totalPages > 1 && (
        <Box className="flex justify-center md:justify-end mt-4">
          <Pagination
            count={totalPages}
            page={filters.page}
            onChange={(_e, val) => handlePageChange(val)}
            color="primary"
            size="small"
          />
        </Box>
      )}


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
        branches={branches as any}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        method={method}
        setMethod={setMethod}

      />

      <DashboardCommunicationModal
        open={commModalOpen}
        onClose={() => setCommModalOpen(false)}
        candidate={commCandidate as CandidateRow}
        mode={commMode}
      />
      <CancelBookingModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        candidateName={cancelTargetLead?.name || "Candidate"}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        onConfirmCancel={handleConfirmCancel}
        loading={cancelLoading}
      />
    </Box>
  );
};

export default AllCandidatesView;
