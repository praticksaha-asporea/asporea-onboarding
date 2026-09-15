"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Pagination,
  Typography,
  Avatar,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  deleteReminderAction,
  getRemindersListAction,
} from "@/Services/APIs/tacHead/reminder.action";
import { IReminderListItem } from "@/Types/reminder.types";

const ReminderHistoryTable = () => {
  const [reminders, setReminders] = useState<IReminderListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // View Mode State (Grid vs List)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters State
  const [notifyType, setNotifyType] = useState<string>("all");
  const [readStatus, setReadStatus] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modal States
  const [selectedReminder, setSelectedReminder] = useState<IReminderListItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await getRemindersListAction({
        page,
        limit: 12,  
        notifyType,
        read: readStatus,
        search,
      });

      if (res.data.success) {
        setReminders(res.data.data.reminders);
        setTotalPages(res.data.data.pagination.totalPages);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch reminders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [page, notifyType, readStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReminders();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await deleteReminderAction(deleteId);
      if (res.data.success) {
        toast.success("Reminder deleted successfully");
        setDeleteId(null);
        fetchReminders();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete reminder");
    } finally {
      setDeleting(false);
    }
  };

  // Helper to parse message logic safely
  const parseMessage = (rawMsg: string) => {
    if (!rawMsg) return { cleanText: "—", inqRef: null };
    const splitRegex = /📌 Reference Inquiry(?:s)?:/;
    if (splitRegex.test(rawMsg)) {
      const parts = rawMsg.split(splitRegex);
      return {
        cleanText: parts[0]?.trim() || rawMsg,
        inqRef: parts[1]?.trim() || null,
      };
    }
    return { cleanText: rawMsg, inqRef: null };
  };

  return (
    <Box className="w-full">
      {/* ── TOP SECTION: SEARCH & FILTERS ── */}
      <Box className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-auto flex-1 max-w-md">
          <TextField
            fullWidth
            size="small"
            placeholder="Search by recipient, message, or heading..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ri-search-line text-lg text-[var(--mui-palette-text-secondary)]" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch("")}>
                    <i className="ri-close-line text-sm" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "50px",
                backgroundColor: "var(--mui-palette-background-paper)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
                },
                "& fieldset": {
                  border: "none",
                },
              },
            }}
          />
        </form>

        <Box className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          {/* Notify Type Filter */}
          <Select
            size="small"
            value={notifyType}
            onChange={(e) => {
              setNotifyType(e.target.value);
              setPage(1);
            }}
            className="w-44 bg-[var(--mui-palette-background-paper)]"
            sx={{
              borderRadius: "50px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}
          >
            <MenuItem value="all">All Recipients</MenuItem>
            <MenuItem value="candidate">Candidates</MenuItem>
            <MenuItem value="tac">TAC Users</MenuItem>
          </Select>

          {/* Read Status Filter */}
          <Select
            size="small"
            value={readStatus}
            onChange={(e) => {
              setReadStatus(e.target.value);
              setPage(1);
            }}
            className="w-44 bg-[var(--mui-palette-background-paper)]"
            sx={{
              borderRadius: "50px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}
          >
            <MenuItem value="all">All Read Status</MenuItem>
            <MenuItem value="true">Read</MenuItem>
            <MenuItem value="false">Unread</MenuItem>
          </Select>

          {/* Grid / List Toggle */}
          <Box className="flex items-center gap-1 bg-[var(--mui-palette-primary)] p-1 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <IconButton
              size="small"
              onClick={() => setViewMode("grid")}
              className={`rounded-full transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <i className="ri-layout-grid-line text-lg" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode("list")}
              className={`rounded-full transition-colors ${
                viewMode === "list"
                  ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <i className="ri-list-check-2 text-lg" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* ── CONTENT AREA ── */}
      {loading ? (
        <Box className="flex justify-center items-center py-20">
          <CircularProgress />
        </Box>
      ) : reminders.length === 0 ? (
        <Box className="flex flex-col items-center justify-center text-center py-24 bg-[var(--mui-palette-background-paper)] rounded-3xl shadow-sm   text-[var(--mui-palette-text-secondary)] font-medium">
          <i className="ri-inbox-line text-6xl mb-4 opacity-30" />
          <Typography variant="h6" className="font-semibold text-[var(--mui-palette-text-primary)]">
            No reminders found
          </Typography>
          <Typography variant="body2" className="mt-1 opacity-70">
            Try adjusting your filters or search term.
          </Typography>
        </Box>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW (NEW DESIGN) ── */
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reminders.map((row) => {
            const senderName = row.sentFrom
              ? `${row.sentFrom.firstName || ""} ${row.sentFrom.lastName || ""}`.trim()
              : "System";
            const { cleanText, inqRef } = parseMessage(row.message);

            return (
              <Card
                key={row._id}
                className="flex flex-col rounded-3xl shadow-2xl   bg-[var(--mui-palette-primary)] overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                {/* Card Top: Recipient Profile */}
                <Box className="p-5 flex items-start justify-between">
                  <Box className="flex items-center gap-3 w-full overflow-hidden">
                    <Avatar
                      src={row.notifyToDetails?.profilePic || "/images/avatars/avatar.png"}
                      className="w-11 h-11  "
                    >
                      {row.notifyToDetails?.name?.charAt(0) || "U"}
                    </Avatar>
                    <Box className="flex-1 min-w-0">
                      <Typography className="font-semibold tracking-wide text-[15px] leading-tight text-[var(--mui-palette-text-primary)] truncate">
                        {row.notifyToDetails?.name || "Unknown"}
                      </Typography>
                      <Typography className="text-[12px] font-semibold text-[var(--mui-palette-text-secondary)] mt-0.5 ">
                        {row.notifyType === "candidate"
                          ? `Inq: ${row.notifyToDetails?.inqNo || "—"}`
                          : `TAC (${row.notifyToDetails?.email || "—"})`}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    size="small"
                    label={row.read ? "Read" : "Unread"}
                    color={row.read ? "success" : "warning"}
                    className="font-bold  text-[11px] h-6 px-1 ml-2"
                  />
                </Box>

                <hr className="  opacity-60" />

                {/* Card Middle: Reminder Info */}
                <Box className="p-5 space-y-4 flex-1">
                  {/* Heading */}
                  <Box className="grid grid-cols-[90px_1fr] items-start gap-3">
                    <Box className="flex items-center gap-2 text-[var(--mui-palette-text-primary)]">
                      <i className="ri-file-text-line text-[15px]" />
                      <Typography className="text-xs font-medium tracking-wide">Heading</Typography>
                    </Box>
                    <Typography className="text-[13px] font-medium text-[var(--mui-palette-text-secondary)] line-clamp-2 leading-snug">
                      {row.heading}
                    </Typography>
                  </Box>

                  {/* Message */}
                <Box className="grid grid-cols-[90px_1fr] items-start gap-3">
  <Box className="flex items-center gap-2 text-[var(--mui-palette-text-secondary)] mt-0.5">
    <i className="ri-chat-3-line text-[15px]" />
    <Typography className="text-xs font-medium tracking-wide">Message</Typography>
  </Box>
  <Tooltip
  title={
    <Box className="p-1 space-y-1.5 border-none max-w-[240px]">
      <Typography className="text-[13px] font-medium tracking-wide text-[var(--mui-palette-text-secondary)] leading-relaxed break-words">
        {cleanText}
      </Typography>
      {inqRef && (
        <Box className="pt-1.5  "> 
          <Typography className="text-[12px] font-semibold tracking-wider text-[var(--mui-palette-primary-main)] break-words">
          Reference Inquiries: {inqRef}
          </Typography>
        </Box>
      )}
    </Box>
  }
  arrow
  placement="top"
  slotProps={{
    tooltip: {
      sx: {
        bgcolor: "var(--mui-palette-background-paper)",
        color: "var(--mui-palette-text-primary)",
        boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.2)",
        
        borderRadius: "12px",
        padding: "8px 12px",
        maxWidth: "250px",  
      },
    },
    arrow: {
      sx: {
        color: "var(--mui-palette-background-paper)",
      },
    },
    popper: {
      modifiers: [
        {
          name: "preventOverflow",
          options: {
            boundary: "window",  
          },
        },
      ],
    },
  }}
>
  <Box className="min-w-0 cursor-pointer group">
    <Typography className="text-[13px] text-[var(--mui-palette-text-primary)] line-clamp-2 leading-relaxed group-hover:text-blue-500 transition-colors">
      {cleanText}
    </Typography>
    {inqRef && (
      <Chip
        size="small"
        label={`Inq: ${inqRef}`}
        className="mt-1.5 h-5 text-[12px] font-medium bg-[var(--mui-palette-primary)] -ml-3 text-[var(--mui-palette-primary-main)]   max-w-[200px] truncate cursor-pointer    "
      />
    )}
  </Box>
</Tooltip>
</Box>
                  {/* Sent From */}
                  <Box className="grid grid-cols-[90px_1fr] items-start gap-3">
                    <Box className="flex items-center gap-2 text-[var(--mui-palette-text-secondary)]">
                      <i className="ri-user-3-line text-[15px]" />
                      <Typography className="text-xs font-medium tracking-wide">Sent From</Typography>
                    </Box>
                    <Box>
                      <Typography className="text-[13px] font-medium text-[var(--mui-palette-text-primary)] leading-tight">
                        {senderName}
                      </Typography>
                      <Typography className="text-[10px] text-[var(--mui-palette-text-secondary)] uppercase tracking-wider mt-0.5">
                        {row.sentFrom?.role || "TAC Head"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <hr className="  opacity-60" />

                {/* Card Footer: Date & Actions */}
                <Box className="px-5 py-3.5 flex items-center justify-between bg-[var(--mui-palette-action-hover)]/20">
                  <Box className="flex items-center gap-2 text-[var(--mui-palette-text-secondary)]">
                    <i className="ri-calendar-line text-[var(--mui-palette-primary-main)]
 text-[15px]" />
                    <Typography className="text-[12px] font-medium tracking-wide">
                      {format(new Date(row.createdAt), "dd MMM yyyy, hh:mm a")}
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-2.5">
                    <Tooltip title="View Details" placement="top">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedReminder(row)}
                        className="  text-blue-600 hover:bg-blue-100 hover:text-blue-700   dark:text-blue-400 w-8 h-8 rounded-xl transition-colors"
                      >
                        <i className="ri-eye-line text-[18px]" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Reminder" placement="top">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteId(row._id)}
                        className=" text-[var(--mui-palette-error-main)]
 hover:bg-red-100 hover:text-red-700     w-8 h-8 rounded-xl transition-colors"
                      >
                        <i className="ri-delete-bin-line text-[18px]" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      ) : (
        /* ── LIST VIEW (EXISTING TABLE) ── */
        <TableContainer
          component={Paper}
          className="shadow-2xl   rounded-3xl overflow-hidden bg-[var(--mui-palette-primary)]"
        >
          <Table>
            <TableHead className="bg-[var(--mui-palette-action-hover)]/30">
              <TableRow>
                <TableCell align="left" className="font-semibold tracking-wide text-[13px] py-4 border-b border-[var(--mui-palette-divider)]">
                  Recipient (Notify To)
                </TableCell>
                <TableCell align="left" className="font-semibold text-[13px] py-4 border-b border-[var(--mui-palette-divider)]">
                  Sent From
                </TableCell>
                <TableCell align="center" className="font-semibold tracking-wider text-[13px] py-4 border-b border-[var(--mui-palette-divider)]">
                  Heading
                </TableCell>
                <TableCell align="center" className="font-semibold tracking-wider text-[13px] py-4 border-b border-[var(--mui-palette-divider)]">
                  Message
                </TableCell>
                <TableCell align="center" className="font-semibold tracking-wider text-[13px] py-4 border-b border-[var(--mui-palette-divider)]">
                  Status
                </TableCell>
                <TableCell align="center" className="font-semibold tracking-wider text-[13px] py-4 border-b border-[var(--mui-palette-divider)]">
                  Sent At
                </TableCell>
                <TableCell align="center" className="font-semibold tracking-wider text-[13px] py-4 border-b border-[var(--mui-palette-divider)]">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reminders.map((row) => {
                const senderName = row.sentFrom
                  ? `${row.sentFrom.firstName || ""} ${row.sentFrom.lastName || ""}`.trim()
                  : "System";

                const { cleanText, inqRef } = parseMessage(row.message);

                return (
                  <TableRow key={row._id} hover className="transition-colors">
                    {/* Recipient */}
                    <TableCell align="left" className="border-b border-[var(--mui-palette-divider)]">
                      <Box className="flex items-center gap-3">
                        <Avatar
                          src={row.notifyToDetails?.profilePic || "/images/avatars/avatar.png"}
                          className="w-10 h-10 border border-[var(--mui-palette-divider)]"
                        >
                          {row.notifyToDetails?.name?.charAt(0) || "U"}
                        </Avatar>
                        <Box>
                          <Typography className="font-semibold text-[14px] leading-tight text-[var(--mui-palette-text-primary)]">
                            {row.notifyToDetails?.name || "Unknown"}
                          </Typography>
                          <Typography className="text-[12px] text-[var(--mui-palette-text-secondary)] mt-0.5">
                            {row.notifyType === "candidate"
                              ? `Inq: ${row.notifyToDetails?.inqNo || "—"}`
                              : `TAC (${row.notifyToDetails?.email || "—"})`}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Sent From */}
                    <TableCell align="left" className="border-b border-[var(--mui-palette-divider)]">
                      <Typography className="font-medium text-[13px] leading-tight">
                        {senderName}
                      </Typography>
                      <Typography className="text-[11px] text-[var(--mui-palette-text-secondary)] uppercase tracking-wider mt-0.5">
                        {row.sentFrom?.role || "TAC Head"}
                      </Typography>
                    </TableCell>

                    {/* Heading */}
                    <TableCell align="center" className="max-w-[150px] border-b border-[var(--mui-palette-divider)]">
                      <Typography className="font-semibold text-[13px] truncate text-[var(--mui-palette-text-primary)]">
                        {row.heading}
                      </Typography>
                    </TableCell>

                    {/* Message */}
                    <TableCell align="center" className="max-w-[240px]  ">
                      <Tooltip
                        title={
                          <Box className="p-1 space-y-1.5 border-none max-w-xs">
                            <Typography className="text-[13px] font-medium tracking-wide text-[var(--mui-palette-text-primary)] leading-relaxed">
                              {cleanText}
                            </Typography>
                            {inqRef && (
                              <Box className="pt-1.5  ">
                                <Typography className="text-[11px] font-semibold tracking-wider text-amber-500 dark:text-amber-400">
                                Reference Inquiries: {inqRef}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                        arrow
                        placement="top"
                        slotProps={{
                          tooltip: {
                            sx: {
                              bgcolor: "var(--mui-palette-background-paper)",
                              color: "var(--mui-palette-text-primary)",
                              boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.2)",
                              border: "1px solid var(--mui-palette-divider)",
                              borderRadius: "12px",
                              padding: "8px 12px",
                            },
                          },
                          arrow: {
                            sx: {
                              color: "var(--mui-palette-background-paper)",
                            },
                          },
                        }}
                      >
                        <Box className="flex flex-col items-center justify-center cursor-pointer group">
                          <Typography className="text-[13px] text-[var(--mui-palette-text-primary)] truncate w-full text-center group-hover:text-blue-500 transition-colors">
                            {cleanText}
                          </Typography>
                          {inqRef && (
                            <Chip
                              size="small"
                              label={`Inq: ${inqRef}`}
                              className="mt-1.5 h-5 bg-[var(--mui-palette-primary)]
 text-[12px] font-medium text-[var(--mui-palette-primary-main)]
 text-blue-600   dark:text-blue-400 max-w-[200px] truncate"
                            />
                          )}
                        </Box>
                      </Tooltip>
                    </TableCell>

                    {/* Status */}
                    <TableCell align="center" className="border-b border-[var(--mui-palette-divider)]">
                      <Chip
                        size="small"
                        label={row.read ? "Read" : "Unread"}
                        color={row.read ? "success" : "warning"}
                        className="font-bold text-[11px] px-1 h-6"
                      />
                    </TableCell>

                    {/* Sent At */}
                    <TableCell align="center" className="text-[12px] text-[var(--mui-palette-text-secondary)] whitespace-nowrap border-b border-[var(--mui-palette-divider)]">
                      {format(new Date(row.createdAt), "dd MMM yyyy, hh:mm a")}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center" className="border-b border-[var(--mui-palette-divider)]">
                      <Box className="flex items-center justify-center gap-1.5">
                        <Tooltip title="View Details" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedReminder(row)}
                            className="bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700   dark:text-blue-400 w-8 h-8 rounded-lg transition-colors"
                          >
                            <i className="ri-eye-line text-[18px]" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteId(row._id)}
                            className="  text-[var(--mui-palette-error-main)]
 hover:bg-red-100 hover:text-red-700   dark:text-red-400 w-8 h-8 rounded-lg transition-colors"
                          >
                            <i className="ri-delete-bin-line text-[18px]" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box className="flex justify-end mt-8">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* ── INDIVIDUAL DETAIL MODAL ── */}
      <Dialog
        open={Boolean(selectedReminder)}
        onClose={() => setSelectedReminder(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "rounded-3xl shadow-2xl",
        }}
      >
        <DialogTitle className="font-medium tracking-wide text-[var(--mui-palette-common-white)]
 bg-blue-400 text-[19px] py-4 px-6">
          Reminder Details
        </DialogTitle>
        <DialogContent className="p-6 space-y-5">
          <Box className="grid grid-cols-2 gap-4  shadow-2xl bg-[var(--mui-palette-action-hover)]/20 p-4 rounded-2xl mt-4">
            <Box>
              <Typography className="text-xs  font-medium text-[var(--mui-palette-primary)]
">
                Recipient Type
              </Typography>
              <Typography className="font-bold mt-1 uppercase text-[var(--mui-palette-primary-main)] text-[14px]">
                {selectedReminder?.notifyType}
              </Typography>
            </Box>
            <Box>
              <Typography className="text-xs font-medium text-[var(--mui-palette-primary)]
">
            Recipient Name
              </Typography>
              <Typography className="font-bold mt-1 text-[var(--mui-palette-primary-main)] text-[14px]">
                {selectedReminder?.notifyToDetails?.name}
              </Typography>
            </Box>
          </Box>

          <Box className="px-1">
            <Typography className="text-xs font-medium text-[var(--mui-palette-text-secondary)] mb-1">
              Heading
            </Typography>
            <Typography className="font-bold text-[16px] text-[var(--mui-palette-text-primary)] leading-tight">
              {selectedReminder?.heading}
            </Typography>
          </Box>

          <Box className="px-1 pb-2">
            <Typography className="text-xs font-medium text-[var(--mui-palette-text-secondary)] mb-2">
              Message
            </Typography>
            <Box className="p-4 bg-[var(--mui-palette-secondary)] rounded-2xl   whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--mui-palette-text-primary)] shadow-2xl">
              {selectedReminder?.message}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions className="p-5  ">
          <Button
            variant="contained"
            className="rounded-xl px-6 py-2 shadow-none font-semibold text-sm"
            onClick={() => setSelectedReminder(null)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DELETE CONFIRMATION DIALOG ── */}
      <Dialog 
        open={Boolean(deleteId)} 
        onClose={() => setDeleteId(null)}
        PaperProps={{
          className: "rounded-3xl shadow-2xl",
        }}
      >
        <DialogTitle className="font-bold text-[18px] text-red-600 px-6 pt-6 pb-2">
          Delete Reminder?
        </DialogTitle>
        <DialogContent className="px-6 pb-2">
          <Typography className="text-[14px] text-[var(--mui-palette-text-secondary)] leading-relaxed">
            Are you sure you want to delete this reminder log? This action is permanent and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions className="p-6">
          <Button 
            className="rounded-xl font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" 
            onClick={() => setDeleteId(null)}
          >
            Cancel
          </Button>
          <Button 
            color="error" 
            variant="contained" 
            disabled={deleting} 
            onClick={handleDelete}
            className="rounded-xl font-semibold px-5 shadow-none"
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReminderHistoryTable;