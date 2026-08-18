import React from "react";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Typography,
  Pagination,
  Avatar,
  Card,
  CardContent,
  Grid,
  Divider,
  Tooltip,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CamelCase } from "@/Utils/common";
import { CandidateRow } from "@/Types/object.types";
import { useDashboardTable } from "./useDashboardTable";

dayjs.extend(relativeTime);

interface DashboardTableProps {
  rows: CandidateRow[];
  loading: boolean;
  error: string | null;
  isFoe: boolean;
  page: number;
  totalPages: number;
  setPage: (val: number) => void;
  openScheduleModal: (
    candidate: CandidateRow,
    isReschedule: boolean,
    phase: "pre" | "assess"
  ) => void;
  openCommModal: (candidate: CandidateRow, mode: "chat" | "email") => void;
  onViewCandidate: (id: string) => void;
  onPreviewImage: (url: string) => void;
}

const getInitials = (name?: string) => {
  if (!name) return "NA";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const resolveFileSrc = (path?: string) => {
  if (!path || path.trim() === "") return "/images/avatars/avatar.png";
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

const DashboardTable: React.FC<DashboardTableProps> = ({
  rows,
  loading,
  error,
  isFoe,
  page,
  totalPages,
  setPage,
  openScheduleModal,
  openCommModal,
  onViewCandidate,
  onPreviewImage,
}) => {
  const {
    getStatusBadge,
    getVisitChipColor,
    getVisitLabel,
    preRescheduleStatuses,
    assessScheduleStatuses,
  } = useDashboardTable(isFoe);

  return (
    <Box className="w-full">
      {/* ---------------- LOADING & ERROR STATES ---------------- */}
      {loading ? (
        <Box className="flex justify-center items-center py-20 bg-[var(--mui-palette-background-paper)] rounded-2xl shadow-sm border border-[var(--mui-palette-divider)]">
          <CircularProgress size={36} thickness={4} />
        </Box>
      ) : error ? (
        <Box className="text-center py-16 bg-[var(--mui-palette-background-paper)] rounded-2xl shadow-sm border border-[var(--mui-palette-divider)] text-red-500 font-medium">
          <i className="ri-error-warning-line text-4xl block mb-2" />
          {error}
        </Box>
      ) : rows.length === 0 ? (
        <Box className="text-center py-20 bg-[var(--mui-palette-background-paper)] rounded-2xl shadow-sm border border-[var(--mui-palette-divider)] text-[var(--mui-palette-text-secondary)] font-medium">
          <i className="ri-inbox-line text-5xl block mb-3 opacity-50" />
          No candidates found
        </Box>
      ) : (
        /* ---------------- GRID / CARDS LAYOUT ---------------- */
        <Grid container spacing={3}>
          {rows.map((candidate: any) => {
            const avatarSrc = resolveFileSrc(candidate.profilePic);
            const displayName = candidate?.name || "Unknown";

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={candidate._id}>
                <Card className="h-full flex flex-col rounded-2xl shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] hover:-translate-y-2.5 hover:scale-[1.015] hover:border-[var(--mui-palette-primary-main)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-[var(--mui-palette-primary)]">
                  <CardContent className="p-4 md:p-5 flex flex-col flex-grow">
                    
                    {/* --- TOP CENTERED HEADER: Image -> Visit Chip -> Name -> Inquiry ID --- */}
                    <Box className="flex flex-col items-center text-center mb-4 w-full">
                      
                      {/* 1. Avatar */}
                      <Avatar
                        src={avatarSrc || undefined}
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "var(--mui-palette-primary-main)",
                          fontSize: "15px",
                          fontWeight: "bold",
                          border: "2px solid var(--mui-palette-background-default)",
                          cursor: "pointer",
                        }}
                        className="shadow-sm hover:scale-105 transition-transform mb-1"
                        onClick={() => {
                          if (avatarSrc) onPreviewImage(avatarSrc);
                        }}
                      >
                        {!avatarSrc && getInitials(displayName)}
                      </Avatar>

                     
                      <Chip
                        label={getVisitLabel(candidate.visitType)}
                        color={getVisitChipColor(candidate.visitType) as any}
                        size="small"
                        variant="filled"
                        className="text-[11px] h-[22px] font-bold bg-transparent text-[var(--mui-palette-primary)] border-none mb-0"
                        sx={{ border: "none" }}
                      />

                       
                      <Box className="w-full space-y-1 text-center">
                         <Typography className="text-[11.5px] mt-0.5 text-[var(--mui-palette-text-secondary)] font-semibold break-all">
                          {candidate.inqNo || "—"}
                        </Typography>
                        <Typography className="font-bold tracking-wider text-[14px] leading-tight text-[var(--mui-palette-text-primary)] ">
                          {displayName}
                        </Typography>
                       
                      </Box>
                    </Box>

                   
                    <Box className="grid grid-cols-2 gap-y-3 gap-x-2 mb-4 mt-1 flex-grow">
                      <Box>
                        <Typography className="text-[11px] text-[var(--mui-palette-text-primary)] font-semibold uppercase tracking-wider">
                          Stage
                        </Typography>
                        <Typography
                          className="text-[12px] font-medium mt-1 text-[var(--mui-palette-text-secondary)] line-clamp-1"
                          title={candidate.stage}
                        >
                          {candidate.stage || "—"}
                        </Typography>
                      </Box>

                      {isFoe && (
                        <Box>
                          <Typography className="text-[11px] text-[var(--mui-palette-text-primary)] font-semibold uppercase tracking-wider">
                            Assigned TAC
                          </Typography>
                          <Typography className="text-[12px] font-medium text-[var(--mui-palette-primary-main)] line-clamp-1">
                            {candidate.assignedTacName || "Unassigned"}
                          </Typography>
                        </Box>
                      )}

                      <Box>
                        <Typography className="text-[11px] mt-0.5 text-[var(--mui-palette-text-primary)] font-semibold uppercase tracking-wider">
                          Token
                        </Typography>
                        <Typography className="text-[12px] font-medium text-[var(--mui-palette-text-secondary)]">
                          {candidate.token ?? "—"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography className="text-[11px] text-[var(--mui-palette-text-primary)] font-semibold uppercase tracking-wider">
                          Last Activity
                        </Typography>
                        <Typography className="text-[12px] mt-0.5 font-medium text-[var(--mui-palette-text-secondary)]">
                          {dayjs(candidate.lastActivity).fromNow()}
                        </Typography>
                      </Box>
                    </Box>

                    {/* --- Card Bottom: Status & Actions --- */}
                    <Box className="flex items-center justify-between mt-auto w-full">
                      <Box
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] tracking-wide font-semibold whitespace-nowrap ${getStatusBadge(
                          candidate.status
                        )}`}
                      >
                        {CamelCase(candidate.status)}
                      </Box>

                      {/* Right: Actions Menu */}
                      <Box className="flex items-center gap-0.5">
                        {!isFoe && (
                          <>
                            <Tooltip
                              title="WhatsApp Chat"
                              placement="top"
                              arrow
                            >
                              <IconButton
                                size="small"
                                onClick={() => openCommModal(candidate, "chat")}
                                className="hover:bg-[rgba(37,211,102,0.08)] transition-all"
                                sx={{
                                  color: "#25D366 !important",
                                  padding: "6px",
                                }}
                              >
                                <i className="ri-whatsapp-line text-[18px]" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Send Email" placement="top" arrow>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  openCommModal(candidate, "email")
                                }
                                className="hover:bg-[rgba(234,67,53,0.08)] transition-all"
                                sx={{
                                  color: "#ea4335 !important",
                                  padding: "6px",
                                }}
                              >
                                <i className="ri-mail-line text-[18px]" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                       
                        {isFoe && candidate.status === "inquiry_submitted" && (
                          <Tooltip
                            title="Schedule Pre-Counselling"
                            placement="top"
                            arrow
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                openScheduleModal(candidate, false, "pre")
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

                         
                        {isFoe &&
                          (candidate.status === "pre_not_responded" ||
                            preRescheduleStatuses.includes(
                              candidate.status
                            )) && (
                            <Tooltip
                              title="Reschedule Pre-Counselling"
                              placement="top"
                              arrow
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  openScheduleModal(candidate, true, "pre")
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

                       
                        {isFoe &&
                          assessScheduleStatuses.includes(
                            candidate.status
                          ) && (
                            <Tooltip
                              title="Schedule / Reschedule Assessment"
                              placement="top"
                              arrow
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  openScheduleModal(candidate, true, "assess")
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

                        <Tooltip title="View Profile" placement="top" arrow>
                          <IconButton
                            size="large"
                            onClick={() => onViewCandidate(candidate._id)}
                            className="hover:bg-[rgba(147,51,234,0.08)] transition-all"
                            sx={{
                              color: "var(--mui-palette-primary) !important",
                              padding: "6px",
                            }}
                          >
                            <i className="mdi--user text-[20px]" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ---------------- PAGINATION ---------------- */}
      {totalPages > 1 && (
        <Box className="flex justify-center mt-8">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, val) => setPage(val)}
            color="primary"
            shape="rounded"
            className="bg-transparent p-1 rounded-lg"
          />
        </Box>
      )}
    </Box>
  );
};

export default DashboardTable;