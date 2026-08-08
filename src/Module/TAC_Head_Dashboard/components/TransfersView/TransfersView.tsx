"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Pagination,
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Avatar,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import EscalationActionModal from "./EscalationActionModal";
import { useEscalationsView } from "./useEscalationsView";

dayjs.extend(relativeTime);

interface EscalationsViewProps {
  // setCurrentView: (view: "dashboard" | "detail") => void;
}
const resolveFileSrc = (path?: string | null) => {
  if (!path) return "/images/avatars/avatar.png";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:3000";
  return `${BACKEND_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};
const TransfersView: React.FC<EscalationsViewProps> = () => {//{ setCurrentView }
  const {
    escalations,
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
  } = useEscalationsView();

  const getStatusColor = (status: string) => {
    if (status === "approved") return "success";
    if (status === "rejected") return "error";
    return "warning";
  };
  return (
    <Box className="w-full rounded-[20px] shadow-2xl p-4 md:p-8 font-sans bg-[var(--mui-palette-primary)]">
      <Typography className="text-[22px] text-[var(--mui-palette-secondary)] md:text-[28px] font-medium tracking-tight mb-6">
        Escalation Requests
      </Typography>


      <Box className="flex flex-col md:flex-row gap-4 mb-6 p-4 rounded-xl shadow-2xl">
        <TextField
          size="small"
          label="Search by Candidate or Inq No."
          variant="outlined"
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 md:max-w-md"
        />

        <FormControl size="small" className="flex-1 md:max-w-xs">
          <InputLabel>Filter by TAC</InputLabel>
          <Select
            value={filters.tacId}
            label="Filter by Target TAC"
            onChange={(e) => handleTacChange(e.target.value as string)}
          >
            <MenuItem value=""><em>All TACs</em></MenuItem>
            {uniqueTacs.map((tac) => (
              <MenuItem key={tac._id} value={tac._id}>
                {tac.firstName} {tac.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {(filters.search || filters.tacId) && (
          <Button variant="text" color="error" onClick={handleResetFilters} className="normal-case">
            Clear Filters
          </Button>
        )}
      </Box>


      <TableContainer component={Paper} className="shadow-xl">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Inq No.</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Candidate</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Escalated By</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Target TAC</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Status</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Date</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white text-right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : escalations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  No escalation requests found.
                </TableCell>
              </TableRow>
            ) : (
              escalations.map((row) => (
                <TableRow key={row._id} hover>

                  <TableCell className="py-3 px-4 text-[13px] font-bold text-[var(--mui-palette-secondary)]">
                    {row.inqNo}
                  </TableCell>

                  <TableCell className="py-3 px-4">
                    <Box className="flex items-center gap-3">
                      <Avatar
                        src={resolveFileSrc(row.candidateAvatar)}
                        sx={{ width: 36, height: 36, border: '2px solid #e2e8f0' }}
                        className="shadow-sm"
                      />
                      <Box>
                        <Typography className="font-semibold text-[13px] leading-tight">{row.fullName}</Typography>
                        <Typography className="text-[12px] text-gray-500">{row.leadStatus}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Box className="flex items-center gap-2">
                      <Avatar
                        src={resolveFileSrc(row.fromAvatar)}
                        sx={{ width: 28, height: 28 }}
                        className="shadow-sm"
                      />
                      <Typography className="text-[13px]">{row.fromName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Box className="flex items-center gap-2">
                      <Avatar
                        src={resolveFileSrc(row.toAvatar)}
                        sx={{ width: 28, height: 28 }}
                        className="shadow-sm"
                      />
                      <Typography className="text-[13px] font-medium text-blue-700">{row.toName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Chip
                      label={row.statusLabel}
                      color={row.statusColor}
                      size="small"
                      variant="outlined"
                      className="text-[13px] border-none shadow-2xl font-bold"
                    />
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[12px] text-[var(--mui-palette-primary)]">
                    {row.timeAgo}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right">
                    <IconButton
                      size="small"
                      onClick={() => openActionModal(row.rawRecord)}
                      color="primary"
                      className="bg-var(--mui-palette-primary-main)"
                    >
                      <i className="ri-shield-check-line text-[20px]" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── PAGINATION CONTROLS ── */}
      {totalPages > 1 && (
        <Box className="flex justify-center mt-4">
          <Pagination
            count={totalPages}
            page={filters.page}
            onChange={(_e, val) => handlePageChange(val)}
            color="primary"
          />
        </Box>
      )}

      {/* ── ACTION INTERACTION MODAL ── */}
      <EscalationActionModal
        open={modalOpen}
        setOpen={setModalOpen}
        transfer={selectedEscalation}
        refreshData={fetchEscalations}
      />
    </Box>
  );
};

export default TransfersView;
