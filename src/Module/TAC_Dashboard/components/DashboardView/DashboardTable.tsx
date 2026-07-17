import React from "react";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Pagination,
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
    candidate: any,
    isReschedule: boolean,
    phase: "pre" | "assess",
  ) => void;
  openCommModal: (candidate: any, mode: "chat" | "email") => void;
  onViewCandidate: (id: string) => void;
}

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
}) => {
  const { getStatusBadge, getVisitChipColor, getVisitLabel, responsiveTableSx, preRescheduleStatuses, assessScheduleStatuses, cols } = useDashboardTable(isFoe);
  return (
    <>
      <TableContainer
        component={Paper}
        className="shadow-xl w-full"
        sx={responsiveTableSx}
      >
        <Table size="small">
          <TableHead>
            <TableRow className="resp-thead">
              {cols.map((head, i) => (
                <TableCell
                  key={i}
                  align={head === "Status" || head === "Token" ? "center" : head === "Actions" ? "right" : "left"}

                  className="py-3 px-2 font-semibold bg-[var(--mui-palette-primary)] text-[var(--mui-palette-secondary-main)] text-[12px] leading-tight"
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
                  className="text-center py-8 text-red-500"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={cols.length}
                  className="text-center py-8 text-gray-400"
                >
                  No candidates found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((candidate: any) => (
                <TableRow
                  key={candidate._id}
                  hover
                  className="resp-row transition-colors"
                >
                  <TableCell

                    className="resp-cell !py-2 !px-2"
                    data-label="Candidate"
                  >
                    <Box className="min-w-[100px]">
                      <Typography className="font-semibold text-[12px] leading-tight">
                        {candidate.name}
                      </Typography>
                      <Typography className="text-[11px] text-[var(--mui-palette-text-secondary)]">
                        {candidate.inqNo}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell
                    className="resp-cell !py-2 !px-2 text-[12px]"
                    data-label="Stage"
                  >
                    <span className="break-words line-clamp-2">{candidate.stage}</span>
                  </TableCell>
                  <TableCell
                    className="resp-cell !py-2 !px-2"
                    data-label="Visit Type"
                  >
                    <Chip
                      label={getVisitLabel(candidate.visitType)}
                      color={getVisitChipColor(candidate.visitType)}
                      size="small"
                      variant="outlined"
                      className="text-[10px] h-[22px]"
                    />
                  </TableCell>
                  {isFoe && (
                    <TableCell
                      className="resp-cell !py-2 !px-2 text-[12px] font-medium text-[var(--mui-palette-primary)]"
                      data-label="Assigned TAC"
                    >
                      {candidate.assignedTacName || "Unassigned"}
                    </TableCell>
                  )}
                  <TableCell
                    align="center"
                    className="resp-cell !py-2 !px-2 text-[12px]"
                    data-label="Token"
                  >
                    {candidate.token ?? (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    className="resp-cell !py-2 !px-2"
                    data-label="Status"
                  >
                    <Box
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] tracking-wide font-normal whitespace-nowrap ${getStatusBadge(candidate.status)}`}
                    >
                      {CamelCase(candidate.status)}
                    </Box>
                  </TableCell>
                  <TableCell
                    className="resp-cell !py-2 !px-2 text-[11px] text-gray-500"
                    data-label="Last Activity"
                  >
                    {dayjs(candidate.lastActivity).fromNow()}
                  </TableCell>
                  <TableCell
                    align="right"
                    className="resp-cell !py-2 !px-2"
                    data-label="Actions"
                  >

                    <Box className="flex gap-0 md:justify-end">
                      {!isFoe && (
                        <>
                          <IconButton size="small" title="Chat" onClick={() => openCommModal(candidate, "chat")}>
                            <i className="material-symbols-light--chat-bubble-outline text-[18px]" />
                          </IconButton>
                          <IconButton size="small" title="Email" onClick={() => openCommModal(candidate, "email")}>
                            <i className="material-symbols-light--mail-outline text-[18px]" />
                          </IconButton>
                        </>
                      )}
                      {isFoe && candidate.status === "inquiry_submitted" && (
                        <IconButton
                          size="small"
                          title="Schedule Pre-Counselling"
                          onClick={() =>
                            openScheduleModal(candidate, false, "pre")
                          }
                        >
                          <i className="ri-calendar-event-line text-blue-500 text-[18px]" />
                        </IconButton>
                      )}
                      {isFoe &&
                        (candidate.status === "pre_not_responded" ||
                          preRescheduleStatuses.includes(candidate.status)) && (
                          <IconButton
                            size="small"
                            title="Reschedule Pre-Counselling"
                            onClick={() =>
                              openScheduleModal(candidate, true, "pre")
                            }
                          >
                            <i className="ri-calendar-schedule-line text-orange-500 text-[18px]" />
                          </IconButton>
                        )}
                      {isFoe &&
                        assessScheduleStatuses.includes(candidate.status) && (
                          <IconButton
                            size="small"
                            title="Schedule / Reschedule Assessment"
                            onClick={() =>
                              openScheduleModal(candidate, true, "assess")
                            }
                          >
                            <i className="ri-calendar-todo-line text-pink-400 text-[18px]" />
                          </IconButton>
                        )}
                      <IconButton
                        size="small"
                        title="View details"
                        onClick={() => onViewCandidate(candidate._id)}
                      >
                        <i className="mdi--user text-[18px]" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
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
    </>
  );
};

export default DashboardTable;