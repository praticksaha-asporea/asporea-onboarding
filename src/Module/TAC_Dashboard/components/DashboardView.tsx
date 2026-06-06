"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import {
  getTacCandidatesAction,
  CandidateRow,
} from "@/Services/APIs/tac/tac.actions";
import { getTacListAction } from "@/Services/APIs/Inquiry/inquiry.action";
import {
  getSlotsAction,
  bookSlotAction,
} from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";
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
    case "inquiry_submitted":
      return "bg-blue-100 text-blue-600";
    case "pre_scheduled":
      return "bg-indigo-100 text-indigo-700";
    case "doc_submitted":
      return "bg-yellow-100 text-yellow-700";
    case "exp_submitted":
      return "bg-orange-100 text-orange-700";
    case "assessment_submitted":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getVisitChipColor = (
  v: string | null,
): "primary" | "secondary" | "default" =>
  v === "online" ? "primary" : v === "offline" ? "secondary" : "default";

const getVisitLabel = (v: string | null) =>
  v === "online" ? "🌐 Online" : v === "offline" ? "🏢 In-Person" : "—";

// ─── Responsive table CSS ─────────────────────────────────────────────────────
const responsiveTableSx = {
  "& .resp-thead": {
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

const DashboardView: React.FC<DashboardProps> = () => {
  const router = useRouter();

  // Extract user to check role
  const currentUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );
  const isFoe =
    currentUser?.role === "foe" || currentUser?.user?.role === "foe";

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const [rows, setRows] = useState<CandidateRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Modal States for FOE ──────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [targetLead, setTargetLead] = useState<CandidateRow | null>(null);
  const [tacList, setTacList] = useState<any[]>([]);
  const [selectedTac, setSelectedTac] = useState("");

  const serverNow = new Date();
  const utcTime = serverNow.getTime() + serverNow.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + 330 * 60000);
  const todayStr = istTime.toISOString().split("T")[0];

  const [date, setDate] = useState(todayStr);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, experienceFilter]);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTacCandidatesAction({
        page,
        limit: LIMIT,
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

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // ─── Modal Logic ────────────────────────────────────────────────────────
  const openScheduleModal = async (candidate: CandidateRow) => {
    setTargetLead(candidate);
    setModalOpen(true);
    setSelectedTac("");
    setDate(todayStr);
    setSlots([]);
    setSelectedSlot(null);

    // Fetch TAC list for the candidate's branch
    if (candidate.branchId) {
      const res = await getTacListAction(candidate.branchId as string);
      if (res?.success) setTacList(res.data);
    }
  };

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedTac || !date) return;
      setSlotsLoading(true);
      setSelectedSlot(null);
      const res = await getSlotsAction(selectedTac, date);
      if (res?.success) {
        setSlots(res.data);
      } else {
        toast.error(res?.message || "Failed to fetch slots");
        setSlots([]);
      }
      setSlotsLoading(false);
    };
    loadSlots();
  }, [selectedTac, date]);

  const handleBookSlot = async () => {
    if (!targetLead || !selectedTac || !selectedSlot) return;
    setBookingLoading(true);
    const method = targetLead.visitType === "online" ? "on" : "off";

    const payload = {
      leadId: targetLead._id,
      consultantId: selectedTac,
      date,
      from: selectedSlot.from,
      to: selectedSlot.to,
      method,
    };

    const res = await bookSlotAction(payload);
    if (res?.success) {
      toast.success("Session scheduled successfully!");
      setModalOpen(false);
      fetchCandidates(); // Refresh list to reflect status update
    } else {
      toast.error(res?.message || "Failed to book slot");
    }
    setBookingLoading(false);
  };

  const kpiCards = [
    {
      title: "Open Cases",
      value: kpis?.openCases ?? "—",
      desc: "Candidates actively managed",
    },
    {
      title: "Pending Pre-Counselling",
      value: kpis?.pendingCounselling ?? "—",
      desc: "Currently undergoing pre-counselling",
    },
    {
      title: "Pending Assessments",
      value: kpis?.pendingAssessment ?? "—",
      desc: "Documents or experience checks",
    },
    { title: "Total Assigned", value: total, desc: "All assigned candidates" },
  ];

  const COLS = [
    "Candidate Name",
    "Stage",
    "Visit Type",
    "Token",
    "Status",
    "Last Activity",
    "Actions",
  ];

  return (
    <Box className="w-full rounded-[20px] shadow-[0px_4px_18px_rgba(0,0,0,0.04)] border border-gray-200 p-4 md:p-8 font-sans">
      {/* HEADER */}
      <Typography className="text-[22px] md:text-[28px] font-medium tracking-tight mb-6">
        {isFoe ? "FOE  Dashboard" : "TAC Assignment Dashboard"}
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
          fullWidth
          size="small"
          placeholder="Search by name, inquiry ID, email or phone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          slotProps={{ input: { className: "rounded-lg text-[14px]" } }}
        />
        <Box className="flex gap-2 flex-wrap">
          <Select
            displayEmpty
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 min-w-[140px] text-[12px]"
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="inquiry_submitted">Inquiry Submitted</MenuItem>
            <MenuItem value="pre_scheduled">Pre-Counselling Scheduled</MenuItem>
            <MenuItem value="doc_submitted">Documents Submitted</MenuItem>
            <MenuItem value="exp_submitted">Experience Submitted</MenuItem>
            <MenuItem value="assessment_submitted">
              Assessment Submitted
            </MenuItem>
          </Select>
          <Select
            displayEmpty
            size="small"
            value={experienceFilter}
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

      {/* RESPONSIVE TABLE */}
      <TableContainer
        component={Paper}
        className="shadow-none border border-gray-200"
        sx={responsiveTableSx}
      >
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
                <TableCell
                  colSpan={COLS.length}
                  className="text-center py-8 text-red-500"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLS.length}
                  className="text-center py-8 text-gray-400"
                >
                  No candidates found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((candidate) => (
                <TableRow
                  key={candidate._id}
                  hover
                  className="resp-row transition-colors"
                >
                  {/* Candidate Name */}
                  <TableCell
                    className="resp-cell !py-3 !px-4"
                    data-label="Candidate"
                  >
                    <Box>
                      <Typography className="font-semibold text-[13px]">
                        {candidate.name}
                      </Typography>
                      <Typography className="text-[12px] text-gray-500">
                        {candidate.inqNo}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Stage */}
                  <TableCell
                    className="resp-cell !py-3 !px-4 text-[13px]"
                    data-label="Stage"
                  >
                    {candidate.stage}
                  </TableCell>

                  {/* Visit Type */}
                  <TableCell
                    className="resp-cell !py-3 !px-4"
                    data-label="Visit Type"
                  >
                    <Chip
                      label={getVisitLabel(candidate.visitType)}
                      color={getVisitChipColor(candidate.visitType)}
                      size="small"
                      variant="outlined"
                      className="text-[11px]"
                    />
                  </TableCell>

                  {/* Token */}
                  <TableCell
                    className="resp-cell !py-3 !px-4 text-[13px]"
                    data-label="Token"
                  >
                    {candidate.token ?? (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell
                    className="resp-cell !py-3 !px-4"
                    data-label="Status"
                  >
                    <Box
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${getStatusBadge(candidate.status)}`}
                    >
                      {CamelCase(candidate.status)}
                    </Box>
                  </TableCell>

                  {/* Last Activity */}
                  <TableCell
                    className="resp-cell !py-3 !px-4 text-[12px] text-gray-500"
                    data-label="Last Activity"
                  >
                    {dayjs(candidate.lastActivity).fromNow()}
                  </TableCell>

                  {/* Actions */}
                  <TableCell
                    className="resp-cell !py-3 !px-4"
                    data-label="Actions"
                  >
                    <Box className="flex gap-1 md:justify-end">
                      {/* 🔹 CHAT & EMAIL BUTTONS WILL ONLY SHOW IF USER IS NOT FOE */}
                      {!isFoe && (
                        <>
                          <IconButton size="small" title="Chat">
                            <i className="material-symbols-light--chat-bubble-outline" />
                          </IconButton>
                          <IconButton size="small" title="Email">
                            <i className="material-symbols-light--mail-outline" />
                          </IconButton>
                        </>
                      )}

                      {/* 🔹 FOE SPECIFIC ACTION BUTTON */}
                      {isFoe && candidate.status === "inquiry_submitted" && (
                        <IconButton
                          size="small"
                          title="Schedule Pre-Counselling"
                          onClick={() => openScheduleModal(candidate)}
                        >
                          <i className="ri-calendar-event-line text-blue-500" />
                        </IconButton>
                      )}

                      <IconButton
                        size="small"
                        title="View details"
                        onClick={() =>
                          router.push(`/dashboard/candidate/${candidate._id}`)
                        }
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

      {/* 🔹 FOE PRE-COUNSELLING MODAL */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: "rounded-xl p-2" }}
      >
        <DialogTitle className="font-bold text-[20px]">
          Schedule Pre-Counselling
        </DialogTitle>
        <DialogContent className="flex flex-col gap-5 pt-4">
          <Box className="mb-2">
            <Typography variant="body2" className="text-gray-500">
              Candidate
            </Typography>
            <Typography className="font-bold">
              {targetLead?.name} ({targetLead?.inqNo})
            </Typography>
          </Box>

          <FormControl fullWidth size="small">
            <InputLabel>Select Assigning TAC</InputLabel>
            <Select
              value={selectedTac}
              onChange={(e) => setSelectedTac(e.target.value as string)}
              label="Select Assigning TAC"
            >
              {tacList.length === 0 && (
                <MenuItem disabled>No TAC available in this branch</MenuItem>
              )}
              {tacList.map((tac) => (
                <MenuItem key={tac._id} value={tac._id}>
                  {tac.firstName} {tac.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="date"
            size="small"
            label="Select Date"
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: todayStr }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {selectedTac && (
            <Box>
              <Typography variant="subtitle2" className="mb-3 font-bold">
                Available Time Slots
              </Typography>
              <Box className="flex flex-wrap gap-4">
                {slotsLoading ? (
                  <Typography className="mb-4 text-[var(--mui-palette-text-primary)] text-sm">
                    Loading slots...
                  </Typography>
                ) : slots.length === 0 ? (
                  <Typography className="text-[var(--mui-palette-text-primary)] text-sm">
                    No slots available for this date.
                  </Typography>
                ) : (
                  slots.map((slot, index) => (
                    <Button
                      key={index}
                      disabled={!slot.available}
                      variant={
                        selectedSlot?.time === slot.time
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => slot.available && setSelectedSlot(slot)}
                      className={`normal-case rounded-[20px] px-6 ${
                        selectedSlot?.time === slot.time
                          ? "bg-primary border-primary text-white"
                          : slot.available
                            ? "bg-transparent border-[#e0e0e0] hover:border-primary text-inherit"
                            : "bg-[#f5f5f5] border-[#e0e0e0]"
                      } disabled:text-[#bdbdbd] disabled:border-[#e0e0e0]`}
                    >
                      {slot.time}
                    </Button>
                  ))
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button
            onClick={() => setModalOpen(false)}
            className="text-white bg-[var(--mui-palette-primary-main)] normal-case"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!selectedSlot || !selectedTac || bookingLoading}
            onClick={handleBookSlot}
            className="bg-[var(--mui-palette-primary-main)] rounded-lg px-6 normal-case shadow-md"
          >
            {bookingLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Confirm & Book"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardView;
 