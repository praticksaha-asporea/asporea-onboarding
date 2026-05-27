"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { getTacCandidatesAction, CandidateRow } from "@/Services/APIs/tac/tac.actions";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CamelCase } from "@/Utils/common";

dayjs.extend(relativeTime);

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardProps {
  setCurrentView: (view: "dashboard" | "detail" | "assessment") => void;
  setSelectedCandidate: (candidate: any) => void;
}

interface Kpis {
  openCases: number;
  pendingCounselling: number;
  pendingAssessment: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusBadge = (status: string) => {
  switch (status) {
    case "inquiry_submitted":    return "bg-blue-100 text-blue-600";
    case "pre_scheduled":        return "bg-indigo-100 text-indigo-700";
    case "doc_submitted":        return "bg-yellow-100 text-yellow-700";
    case "exp_submitted":        return "bg-orange-100 text-orange-700";
    case "assessment_submitted": return "bg-green-100 text-green-700";
    default:                     return "bg-gray-100 text-gray-600";
  }
};

const getVisitChipColor = (v: string | null): "primary" | "secondary" | "default" =>
  v === "online" ? "primary" : v === "offline" ? "secondary" : "default";

const getVisitLabel = (v: string | null) =>
  v === "online" ? "🌐 Online" : v === "offline" ? "🏢 In-Person" : "—";

// ─── Responsive table CSS ─────────────────────────────────────────────────────
// On screens < 768 px each row becomes a block and each cell renders its
// column label via a CSS attr() trick so we need zero duplicate markup.

const responsiveTableSx = {
  "& .resp-thead": {
    // Hide the header row on mobile — labels come from data-label instead
    "@media (max-width: 767px)": { display: "none" },
  },
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

// ─── Component ────────────────────────────────────────────────────────────────

const DashboardView: React.FC<DashboardProps> = ({
  setCurrentView,
  setSelectedCandidate,
}) => {
  const router = useRouter();

  const [search, setSearch]                     = useState("");
  const [searchInput, setSearchInput]           = useState("");
  const [statusFilter, setStatusFilter]         = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [page, setPage]                         = useState(1);
  const LIMIT = 10;

  const [rows, setRows]             = useState<CandidateRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [kpis, setKpis]             = useState<Kpis | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [search, statusFilter, experienceFilter]);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTacCandidatesAction({
        page, limit: LIMIT,
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

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const kpiCards = [
    { title: "Open Cases",              value: kpis?.openCases ?? "—",          desc: "Candidates actively managed" },
    { title: "Pending Pre-Counselling", value: kpis?.pendingCounselling ?? "—", desc: "Currently undergoing pre-counselling" },
    { title: "Pending Assessments",     value: kpis?.pendingAssessment ?? "—",  desc: "Documents or experience checks" },
    { title: "Total Assigned",          value: total,                            desc: "All assigned candidates" },
  ];

  const COLS = ["Candidate Name", "Stage", "Visit Type", "Token", "Status", "Last Activity", "Actions"];

  return (
    <Box className="w-full rounded-[20px] shadow-[0px_4px_18px_rgba(0,0,0,0.04)] border border-gray-200 p-4 md:p-8 font-sans">

      {/* HEADER */}
      <Typography className="text-[22px] md:text-[28px] font-medium tracking-tight mb-6">
        TAC Assignment Dashboard
      </Typography>

      {/* KPI */}
      <Typography className="text-[16px] md:text-[19px] font-semibold mb-4">
        Key Performance Indicators
      </Typography>
      <Box className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
        {kpiCards.map((item, i) => (
          <Card key={i} className="rounded-xl border border-gray-200 shadow-sm">
            <CardContent className="p-3 md:p-5">
              <Typography className="text-[11px] md:text-[13px] font-semibold mb-1 md:mb-3 leading-tight">
                {item.title}
              </Typography>
              <Typography className="text-[26px] md:text-[36px] font-bold leading-none mb-1">
                {item.value}
              </Typography>
              <Typography className="text-[10px] md:text-[12px] text-gray-500 hidden sm:block">
                {item.desc}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* TITLE */}
      <Typography className="text-[16px] md:text-[19px] font-bold mb-4">
        Assigned Candidates
      </Typography>

      {/* SEARCH + FILTERS */}
      <Box className="flex flex-col gap-3 mb-5">
        <TextField
          fullWidth size="small"
          placeholder="Search by name, inquiry ID, email or phone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          slotProps={{ input: { className: "rounded-lg text-[14px]" } }}
        />
        <Box className="flex gap-2 flex-wrap">
          <Select displayEmpty size="small" value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 min-w-[140px] text-[12px]"
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="inquiry_submitted">Inquiry Submitted</MenuItem>
            <MenuItem value="pre_scheduled">Pre-Counselling Scheduled</MenuItem>
            <MenuItem value="doc_submitted">Documents Submitted</MenuItem>
            <MenuItem value="exp_submitted">Experience Submitted</MenuItem>
            <MenuItem value="assessment_submitted">Assessment Submitted</MenuItem>
          </Select>
          <Select displayEmpty size="small" value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            className="flex-1 min-w-[130px] text-[12px]"
          >
            <MenuItem value="">All Experience</MenuItem>
            <MenuItem value="fresher">Fresher</MenuItem>
            <MenuItem value="domestic">Domestic</MenuItem>
            <MenuItem value="abroad">Abroad</MenuItem>
            <MenuItem value="free">Freelance</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* RESPONSIVE TABLE — single render, CSS-driven stacking on mobile */}
      <TableContainer component={Paper} className="shadow-none border border-gray-200" sx={responsiveTableSx}>
        <Table size="small">
          <TableHead>
            <TableRow className="resp-thead">
              {COLS.map((head, i) => (
                <TableCell
                  key={i}
                  className={`py-4 px-4 font-semibold border-b border-gray-200 text-[var(--mui-palette-secondary-main)] whitespace-nowrap ${
                    head === "Status" ? "text-center" : ""
                  } ${head === "Actions" ? "text-right" : ""}`}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={COLS.length} className="text-center py-10">
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={COLS.length} className="text-center py-8 text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLS.length} className="text-center py-8 text-gray-400">
                  No candidates found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((candidate) => (
                <TableRow key={candidate._id} hover className="resp-row transition-colors">

                  {/* Candidate Name */}
                  <TableCell className="resp-cell !py-3 !px-4" data-label="Candidate">
                    <Box>
                      <Typography className="font-semibold text-[13px]">{candidate.name}</Typography>
                      <Typography className="text-[12px] text-gray-500">{candidate.inqNo}</Typography>
                    </Box>
                  </TableCell>

                  {/* Stage */}
                  <TableCell className="resp-cell !py-3 !px-4 text-[13px]" data-label="Stage">
                    {candidate.stage}
                  </TableCell>

                  {/* Visit Type */}
                  <TableCell className="resp-cell !py-3 !px-4" data-label="Visit Type">
                    <Chip
                      label={getVisitLabel(candidate.visitType)}
                      color={getVisitChipColor(candidate.visitType)}
                      size="small"
                      variant="outlined"
                      className="text-[11px]"
                    />
                  </TableCell>

                  {/* Token */}
                  <TableCell className="resp-cell !py-3 !px-4 text-[13px]" data-label="Token">
                    {candidate.token ?? <span className="text-gray-400">—</span>}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="resp-cell !py-3 !px-4" data-label="Status">
                    <Box className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${getStatusBadge(candidate.status)}`}>
                      {CamelCase(candidate.status)}
                    </Box>
                  </TableCell>

                  {/* Last Activity */}
                  <TableCell className="resp-cell !py-3 !px-4 text-[12px] text-gray-500" data-label="Last Activity">
                    {dayjs(candidate.lastActivity).fromNow()}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="resp-cell !py-3 !px-4" data-label="Actions">
                    <Box className="flex gap-1 md:justify-end">
                      <IconButton size="small" title="Chat">
                        <i className="material-symbols-light--chat-bubble-outline" />
                      </IconButton>
                      <IconButton size="small" title="Email">
                        <i className="material-symbols-light--mail-outline" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="View details"
                        onClick={() => router.push(`/dashboard/candidate/${candidate._id}`)}
                      >
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

      {/* PAGINATION */}
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
    </Box>
  );
};

export default DashboardView;
