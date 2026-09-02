"use client";

import React from "react";
import FollowUpBadge from "@/Components/Common/FollowUpBadge";  
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  IconButton,
  Pagination,
  Avatar,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Tooltip,
  Select,
  MenuItem,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { usePendingTrackingView } from "./usePendingTrackingView";
import DashboardCommunicationModal from "../TAC_Dashboard/components/DashboardView/DashboardCommunicationModal";

dayjs.extend(relativeTime);

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
    searchInput,
    setSearchInput,
    stageFilter,
    setStageFilter,
    commModalOpen,
    setCommModalOpen,
    commMode,
    commCandidate,
  } = usePendingTrackingView();

  const getOverdueDuration = (lead: any) => {
    const baseTime =
      lead.inquiryStages?.stage1 === "pending"
        ? lead.createdAt
        : lead.updatedAt || lead.createdAt;

    // Grace Period (1 Hour) ke BAAD ka actual overdue duration
    const officialOverdueStartTime = dayjs(baseTime).add(1, "hour");

    return dayjs(officialOverdueStartTime).fromNow(true);
  };

  return (
    <Box className="w-full rounded-[20px] font-sans">
      {/* ----------------- TOP TOOLBAR ----------------- */}
      <Box className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6 bg-[var(--mui-palette-secondary)] p-4 md:p-6 rounded-[20px] shadow-2xl">
        <Typography
          component="div"
          className="text-[20px] md:text-[24px] tracking-wide font-medium text-[var(--mui-palette-text-secondary)] flex items-center gap-3"
        >
          <Box className="flex items-center justify-center w-10 h-10 rounded-lg text-[var(--mui-palette-primary-main)]">
            <i className="ri-time-line text-2xl" />
          </Box>
          Follow Ups
        </Typography>

        <Box className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Google Style Search Bar */}
          <TextField
            size="small"
            placeholder="Search leads..."
            variant="outlined"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full sm:w-[250px] shadow-3xl"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "99px",
                boxShadow: "0 1px 6px rgba(32,33,36,0.12)",
                backgroundColor: "var(--mui-palette-background-paper)",
                "& fieldset": { border: "none" },
                "&:hover fieldset": { border: "none" },
                "&.Mui-focused fieldset": { border: "none" },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ri-search-line text-[var(--mui-palette-text-secondary)] ml-1" />
                </InputAdornment>
              ),
            }}
          />

          {/* Dynamic Stage Filter Dropdown */}
          <Select
            size="small"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full sm:w-[180px] text-[13px] font-medium"
            sx={{
              borderRadius: "99px",
              backgroundColor: "var(--mui-palette-background-paper)",
              boxShadow: "0 1px 6px rgba(32,33,36,0.12)",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
            }}
          >
            <MenuItem value="all">All Pending Steps</MenuItem>
            <MenuItem value="stage1">Step 1 Pending</MenuItem>
            <MenuItem value="stage2">Step 2 Pending</MenuItem>
            <MenuItem value="stage3">Step 3 Pending</MenuItem>
            <MenuItem value="followUpRequired">Mark as Follow Up</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* ----------------- MAIN GRID / CARDS ----------------- */}
      {loading ? (
        <Box className="flex justify-center items-center py-20 bg-[var(--mui-palette-background-paper)] rounded-[20px] shadow-sm border border-[var(--mui-palette-divider)]">
          <CircularProgress size={36} thickness={4} />
        </Box>
      ) : error ? (
        <Box className="text-center py-16 bg-[var(--mui-palette-background-paper)] rounded-[20px] shadow-sm border border-[var(--mui-palette-divider)] text-red-500 font-medium">
          <i className="ri-error-warning-line text-4xl block mb-2" />
          {error}
        </Box>
      ) : data.length === 0 ? (
        <Box className="text-center py-20 bg-[var(--mui-palette-primary)] rounded-[20px] shadow-2xl text-[var(--mui-palette-text-secondary)] font-medium">
          No delayed inquiries right now!
        </Box>
      ) : (
        <Grid container spacing={3}>
          {data.map((lead: any) => {
            const stageLabel = getPendingStageLabel(lead.inquiryStages);
            const displayName = lead.fullName || lead.name || "Unknown Lead";
            const avatarSrc = resolveFileSrc(lead.profilePic);
            const overdueDuration = getOverdueDuration(lead); // Already returns human string (e.g. "15 minutes")

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={lead._id}>
                <Card className="h-full flex flex-col relative rounded-2xl shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] hover:-translate-y-2.5 hover:scale-[1.015] hover:border-[var(--mui-palette-primary-main)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-[var(--mui-palette-primary)]">
                  <FollowUpBadge show={lead?.followUpRequired} />
                  <CardContent className="p-5 flex flex-col flex-grow">

                    {/* Top Section */}
                    <Box className="flex items-start justify-between mb-4 gap-2">
                      <Box className="flex items-center gap-3 overflow-hidden">
                        <Avatar
                          src={avatarSrc || undefined}
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: "var(--mui-palette-primary-main)",
                            fontSize: "16px",
                            fontWeight: "bold",
                          }}
                          className="shadow-sm border-2 border-[var(--mui-palette-background-default)]"
                        >
                          {!avatarSrc && getInitials(displayName)}
                        </Avatar>
                        <Box className="overflow-hidden">
                          <Typography
                            className="font-semibold tracking-wide text-[15px] leading-tight text-[var(--mui-palette-text-primary)] truncate"
                            title={displayName}
                          >
                            {displayName}
                          </Typography>
                          <Typography className="text-[12px] mt-0.5 text-[var(--mui-palette-text-secondary)] font-medium truncate">
                            {lead.inqNo || "No ID Available"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Middle Details */}
                    <Box className="flex flex-col gap-2.5 mb-5 mt-2 flex-grow">
                      <Typography
                        className="text-[13px] text-[var(--mui-palette-text-primary)] flex items-center gap-2.5 truncate"
                        title={lead.contact?.email}
                      >
                        <i className="ri-mail-line text-[15px] text-[var(--mui-palette-text-primary)]" />
                        <span className="truncate">
                          {lead.contact?.email || "No Email"}
                        </span>
                      </Typography>

                      <Typography className="text-[13px] text-[var(--mui-palette-text-primary)] flex items-center gap-2.5">
                        <i className="ri-phone-line text-[15px] text-[var(--mui-palette-text-primary)]" />
                        {lead.contact?.whatsapp ||
                          lead.contact?.phone ||
                          "No Phone"}
                      </Typography>

                      {/* Overdue Text (Directly rendering formatted string) */}
                      <Typography className="text-[13px] text-[var(--mui-palette-error-main)] font-semibold flex items-center gap-2.5 mt-1">
                        <i className="ri-time-line text-[15px]" />
                        Overdue: {overdueDuration}
                      </Typography>
                    </Box>

                    {/* Bottom Actions */}
                    <Box className="flex items-center justify-between mt-auto">
                      <Chip
                        label={stageLabel}
                        size="small"
                        className="text-[12px] font-semibold h-[24px] bg-[var(--mui-palette-warning-main)] text-[var(--mui-palette-primary-contrastText)]"
                      />

                      <Box className="flex items-center gap-0.5">
                        <Tooltip title="WhatsApp Chat" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => openCommModal(lead, "chat")}
                            className="hover:bg-[rgba(37,211,102,0.08)]"
                            sx={{ color: "#25D366 !important" }}
                          >
                            <i className="ri-whatsapp-line text-[22px]" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Send Email" placement="top" arrow>
                          <IconButton
                            size="small"
                            onClick={() => openCommModal(lead, "email")}
                            className="hover:bg-[rgba(234,67,53,0.08)] transition-all duration-200"
                            sx={{ color: "#ea4335 !important", padding: "7px" }}
                          >
                            <i className="ri-mail-line text-[20px]" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="View Candidate Details" placement="top" arrow>
                          <IconButton
                            size="small"
                            onClick={() => onViewCandidate(lead._id)}
                            className="hover:bg-[rgba(147,51,234,0.08)] transition-all duration-200"
                            sx={{ color: "#1E90FF !important", padding: "6px" }}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Box className="flex justify-center mt-8">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, val) => setPage(val)}
            color="primary"
            shape="rounded"
            className="bg-[var(--mui-palette-background-paper)] p-1 rounded-lg shadow-sm border border-[var(--mui-palette-divider)]"
          />
        </Box>
      )}

      {/* Communication Modal */}
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