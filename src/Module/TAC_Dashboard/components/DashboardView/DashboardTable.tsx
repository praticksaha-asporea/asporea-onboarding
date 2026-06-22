import React from "react";
import {
  Box, Chip, CircularProgress, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography, Pagination
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CamelCase } from "@/Utils/common";
import { CandidateRow } from "@/Services/APIs/tac/tac.actions";

dayjs.extend(relativeTime);
const getStatusBadge = (status: string) => {
  switch (status) {
   
    case "inquiry_submitted":
    case "doc_submitted":
    case "exp_submitted":
    case "assessment_submitted":
      return "bg-blue-500 text-white dark:bg-blue-500 dark:text-white";

   
    case "doc_verified":
    case "exp_verified":
    case "pre_completed":
    case "assess_completed":
      return "bg-green-500 text-white dark:bg-green-90 dark:text-white";

   
    case "pre_contacted":
    case "assess_contacted":
      return "bg-teal-500 text-white dark:bg-teal-95 dark:text-white";

    
    case "pre_queued":
    case "assess_queued":
      return "bg-orange-500 text-white dark:bg-orange-95 dark:text-white";

    
    case "pre_scheduled":
    case "assess_scheduled":
    case "assessment_scheduled":
      return "bg-amber-600 text-white dark:bg-amber-700 dark:text-white";

     
    case "pre_not_responded":
    case "assess_not_responded":
      return "bg-pink-500 text-white dark:bg-pink-96 dark:text-white";

    
    case "pre_rejected":
    case "assess_rejected":
      return "bg-red-600 text-white dark:bg-red-98 dark:text-white";

  
    case "exp_request_technical":
      return "bg-slate-400 text-white dark:bg-gray-400 dark:text-white  ";

    
    default:
      return "bg-slate-400 text-white dark:bg-gray-400 dark:text-white ";
  }
};

const getVisitChipColor = (v: string | null): "primary" | "secondary" | "default" =>
  v === "online" ? "primary" : v === "offline" ? "secondary" : "default";

const getVisitLabel = (v: string | null) =>
  v === "online" ? "🌐 Online" : v === "offline" ? "🏢 In-Person" : "—";

const responsiveTableSx = {
  "& .resp-thead": { "@media (max-width: 767px)": { display: "none" } },
  "& .resp-row": {
    "@media (max-width: 767px)": {
      display: "block", borderBottom: "2px solid", borderColor: "divider",
      mb: 1, borderRadius: 2, overflow: "hidden",
    },
  },
  "& .resp-cell": {
    "@media (max-width: 767px)": {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      px: 2, py: 1, borderBottom: "1px solid", borderColor: "divider",
      "&:last-child": { borderBottom: "none" },
      "&::before": {
        content: "attr(data-label)", fontWeight: 600, fontSize: "0.72rem",
        color: "text.secondary", flexShrink: 0, mr: 2, minWidth: 110,
      },
    },
  },
};

const COLS = ["Candidate Name", "Stage", "Visit Type", "Token", "Status", "Last Activity", "Actions"];

interface DashboardTableProps {
  rows: CandidateRow[];
  loading: boolean;
  error: string | null;
  isFoe: boolean;
  page: number;
  totalPages: number;
  setPage: (val: number) => void;
  openScheduleModal: (candidate: any, isReschedule: boolean) => void;
  onViewCandidate: (id: string) => void;
}

const DashboardTable: React.FC<DashboardTableProps> = ({
  rows, loading, error, isFoe, page, totalPages, setPage, openScheduleModal, onViewCandidate
}) => {
  return (
    <>
      <TableContainer component={Paper} className="shadow-xl  " sx={responsiveTableSx}>
        <Table size="small">
          <TableHead>
            <TableRow className="resp-thead">
              {COLS.map((head, i) => (
                <TableCell
                  key={i}
                  className={`py-4 px-4 font-semibold  bg-[var(--mui-palette-primary)]   text-[var(--mui-palette-secondary-main)] whitespace-nowrap ${head === "Status" ? "text-center" : ""} ${head === "Actions" ? "text-right" : ""}`}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={COLS.length} className="text-center py-10"><CircularProgress size={28} /></TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={COLS.length} className="text-center py-8 text-red-500">{error}</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={COLS.length} className="text-center py-8 text-gray-400">No candidates found</TableCell></TableRow>
            ) : (
              rows.map((candidate: any) => (
                <TableRow key={candidate._id} hover className="resp-row transition-colors">
                  <TableCell className="resp-cell !py-3 !px-4" data-label="Candidate">
                    <Box>
                      <Typography className="font-semibold text-[13px]">{candidate.name}</Typography>
                      <Typography className="text-[12px] text-[var(--mui-palette-text-secondary)]">{candidate.inqNo}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell className="resp-cell !py-3 !px-4 text-[13px]" data-label="Stage">{candidate.stage}</TableCell>
                  <TableCell className="resp-cell !py-3 !px-4" data-label="Visit Type">
                    <Chip label={getVisitLabel(candidate.visitType)} color={getVisitChipColor(candidate.visitType)} size="small" variant="outlined" className="text-[11px]" />
                  </TableCell>
                  <TableCell className="resp-cell !py-3 !px-4 text-[13px]" data-label="Token">
                    {candidate.token ?? <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="resp-cell !py-3 !px-4" data-label="Status">
                    <Box className={`inline-block px-3 py-1 rounded-full text-[11px] tracking-wide font-normal whitespace-nowrap ${getStatusBadge(candidate.status)}`}>
                      {CamelCase(candidate.status)}
                    </Box>
                  </TableCell>
                  <TableCell className="resp-cell !py-3 !px-4 text-[12px] text-gray-500" data-label="Last Activity">
                    {dayjs(candidate.lastActivity).fromNow()}
                  </TableCell>
                  <TableCell className="resp-cell !py-3 !px-4" data-label="Actions">
                    <Box className="flex gap-1 md:justify-end">
                      {!isFoe && (
                        <>
                          <IconButton size="small" title="Chat"><i className="material-symbols-light--chat-bubble-outline" /></IconButton>
                          <IconButton size="small" title="Email"><i className="material-symbols-light--mail-outline" /></IconButton>
                        </>
                      )}
                      {isFoe && candidate.status === "inquiry_submitted" && (
                        <IconButton size="small" title="Schedule Pre-Counselling" onClick={() => openScheduleModal(candidate, false)}>
                          <i className="ri-calendar-event-line text-blue-500" />
                        </IconButton>
                      )}
                      {isFoe && candidate.status === "pre_not_responded" && (
                        <IconButton size="small" title="Reschedule Pre-Counselling" onClick={() => openScheduleModal(candidate, true)}>
                          <i className="ri-calendar-schedule-line text-orange-500 text-lg" />
                        </IconButton>
                      )}
                      <IconButton size="small" title="View details" onClick={() => onViewCandidate(candidate._id)}>
                        <i className="mdi--user" />
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
          <Pagination count={totalPages} page={page} onChange={(_e, val) => setPage(val)} color="primary" size="small" />
        </Box>
      )}
    </>
  );
};

export default DashboardTable;