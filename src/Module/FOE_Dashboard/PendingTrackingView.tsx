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
  Chip,
  CircularProgress,
  IconButton,
  Pagination,
  Avatar,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { usePendingTrackingView } from "./usePendingTrackingView";
import DashboardCommunicationModal from "../TAC_Dashboard/components/DashboardView/DashboardCommunicationModal";

dayjs.extend(relativeTime);

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

const PendingTrackingView: React.FC = () => {
  const {
    data,
    loading,
    error,
    page,
    setPage,
    totalPages,
    getPendingStageLabel,
    onViewCandidate,
    openCommModal,
    commModalOpen,
    setCommModalOpen,
    commMode,
    commCandidate,
    cols,
  } = usePendingTrackingView();

  return (
    <Box className="w-full rounded-[20px] shadow-2xl p-4 md:p-8 font-sans  bg-[var(--mui-palette-primary)]">
      <Typography className="text-[20px] md:text-[26px] tracking-wide font-medium  mb-6 text-[var(--mui-palette-primary)] flex items-center gap-2">
        <i className="ri-time-line text-2xl text-amber-500" /> Overdue Inquiry Tracking
      </Typography>

      <TableContainer
        component={Paper}
        className="shadow-xl w-full rounded-xl overflow-hidden"
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              {cols.map((head, i) => (
                <TableCell
                  key={i}
                  align={head === "Actions" ? "right" : "left"}
                  className="py-3 px-3 font-medium bg-[var(--mui-palette-primary)] text-[var(--mui-palette-primary)] text-[12px] leading-tight"
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={cols.length} className="text-center py-10">
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={cols.length}
                  className="text-center py-8 text-red-500 font-medium text-sm"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={cols.length}
                  className="text-center py-8 text-gray-400 font-medium text-sm"
                >
                  No delayed inquiries right now! 🎉
                </TableCell>
              </TableRow>
            ) : (
              data.map((lead: any) => {
                const stageLabel = getPendingStageLabel(lead.inquiryStages);

                return (
                  <TableRow
                    key={lead._id}
                    hover
                    className="transition-colors border-b last:border-none"
                  >
                    {/* Candidate Avatar & Name */}
                    <TableCell className="!py-2.5 !px-3">
                      <Box className="flex items-center gap-3 min-w-[160px]">
                        <Avatar
                          src={resolveFileSrc(lead.profilePic)}
                          sx={{
                            width: 38,
                            height: 38,
                            border: "2px solid #e2e8f0",
                          }}
                          className="hover:scale-105 transition-transform shadow-sm cursor-pointer"
                        />
                        <Box>
                          <Typography className="font-medium tracking-wide text-[13px] leading-tight text-[var(--mui-palette-primary)]">
                            {lead.fullName || lead.name || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Inquiry No */}
                    <TableCell className="!py-2.5 !px-3 text-[11px] text-[var(--mui-palette-text-secondary)] font-medium">
                      {lead.inqNo || "—"}
                    </TableCell>

                    {/* Pending Stage */}
                    <TableCell className="!py-2.5 !px-3">
                      <Chip
                        label={stageLabel}
                        size="small"
                        color="warning"
                        className="text-[10px] h-[22px] font-semibold"
                      />
                    </TableCell>

                    {/* Pending Since */}
                    <TableCell className="!py-2.5 !px-3 text-[11px] text-red-500 font-semibold">
                      ⏱ {dayjs(lead.createdAt).fromNow()}
                    </TableCell>

                    {/* Actions: Chat, Email & View Details */}
                    <TableCell align="right" className="!py-2.5 !px-3">
                      <Box className="flex gap-0 md:justify-end">
                        <IconButton
                          size="small"
                          title="Chat"
                          onClick={() => openCommModal(lead, "chat")}
                        >
                          <i className="material-symbols-light--chat-bubble-outline text-[18px]" />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Email"
                          onClick={() => openCommModal(lead, "email")}
                        >
                          <i className="material-symbols-light--mail-outline text-[18px]" />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="View details"
                          onClick={() => onViewCandidate(lead._id)}
                        >
                          <i className="mdi--user text-[18px]" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box className="flex justify-center md:justify-end mt-4">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, val) => setPage(val)}
            color="primary"
            size="small"
          />
        </Box>
      )}

      {/* Communication Modal for Chat & Email */}
      <DashboardCommunicationModal
        open={commModalOpen}
        onClose={() => setCommModalOpen(false)}
        candidate={commCandidate as any}
        mode={commMode}
      />
    </Box>
  );
};

export default PendingTrackingView;