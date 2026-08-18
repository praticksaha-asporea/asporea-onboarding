"use client";

import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Avatar,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { getPendingStageLabel, getPendingDuration } from "./helper";

interface LeadStageTableProps {
  rows: any[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  setPage: (val: number) => void;
  onViewCandidate: (id: string) => void;
}

const resolveFileSrc = (path?: string) => {
  if (!path) return "/images/avatars/avatar.png";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:3000";
  return `${BACKEND_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};

const LeadStageTable: React.FC<LeadStageTableProps> = ({
  rows,
  loading,
  error,
  page,
  totalPages,
  setPage,
  onViewCandidate,
}) => {
  const cols = ["Candidate Name", "Inquiry No", "Pending Stage", "Pending Since (Duration)", "Actions"];

  return (
    <>
      <TableContainer component={Paper} className="shadow-xl w-full">
        <Table size="small">
          <TableHead>
            <TableRow>
              {cols.map((head, i) => (
                <TableCell
                  key={i}
                  align={head === "Actions" ? "right" : "left"}
                  className="py-3 px-3 font-semibold bg-[var(--mui-palette-primary)] text-[var(--mui-palette-secondary-main)] text-[12px]"
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
                <TableCell colSpan={cols.length} className="text-center py-8 text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={cols.length} className="text-center py-8 text-gray-400">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((lead: any) => {
                const stageLabel = getPendingStageLabel(lead.inquiryStages);
                const duration = getPendingDuration(lead.createdAt);

                return (
                  <TableRow key={lead._id} hover className="transition-colors">
                    {/* 1. Name */}
                    <TableCell className="!py-2.5 !px-3">
                      <Box className="flex items-center gap-3">
                        <Avatar
                          src={resolveFileSrc(lead.profilePic)}
                          sx={{ width: 38, height: 38, border: "2px solid #e2e8f0" }}
                        />
                        <Typography className="font-medium text-[13px]">
                          {lead.fullName || lead.name}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* 2. Inquiry No */}
                    <TableCell className="!py-2.5 !px-3 text-[12px] font-semibold text-gray-700">
                      {lead.inqNo || "—"}
                    </TableCell>

                    {/* 3. Pending Stage */}
                    <TableCell className="!py-2.5 !px-3">
                      <Chip
                        label={stageLabel}
                        size="small"
                        color={stageLabel.includes("Pending") ? "warning" : "success"}
                        className="text-[11px] font-semibold"
                      />
                    </TableCell>

                    {/* 4. Pending Duration */}
                    <TableCell className="!py-2.5 !px-3 text-[12px] text-gray-600 font-medium">
                      ⏱️ {duration}
                    </TableCell>

                    {/* 5. Actions */}
                    <TableCell align="right" className="!py-2.5 !px-3">
                      <button
                        onClick={() => onViewCandidate(lead._id)}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-3 py-1 rounded-lg transition-all"
                      >
                        View Details
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box className="flex justify-end mt-4">
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

export default LeadStageTable;