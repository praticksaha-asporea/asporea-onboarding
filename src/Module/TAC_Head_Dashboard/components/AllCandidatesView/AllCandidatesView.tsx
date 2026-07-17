"use client";

import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  CircularProgress,
  Paper,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import { useAllCandidates } from "./useAllCandidates";

const responsiveTableSx = {
  "& .resp-thead": { "@media (max-width: 767px)": { display: "none" } },
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

const COLS = ["Candidate", "Branch", "Assigned TAC", "Contact", "Status"];

const AllCandidatesView = () => {
  const {
    candidates,
    branches,
    tacs,
    filters,
    totalPages,
    isLoading,
    searchInput,
    onSearchChange,
    handleFilterChange,
    handlePageChange,
  } = useAllCandidates();

  return (
    <Box className="w-full rounded-[20px] shadow-2xl p-4 md:p-8 font-sans bg-[var(--mui-palette-primary)]">
      <Typography className="text-[22px] md:text-[28px] text-[var(--mui-palette-secondary)] font-medium tracking-tight mb-6">
        Candidates Under Your Supervision
      </Typography>

      {/* ── Filters Section ── */}
      <Box className="flex flex-col gap-3 mb-5">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, email or phone..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{ input: { className: "rounded-lg text-[14px]" } }}
        />

        <Box className="flex gap-2 flex-wrap">
          <Select
            displayEmpty
            size="small"
            value={filters.branchId}
            onChange={(e) => handleFilterChange("branchId", e.target.value)}
            className="flex-1 min-w-[160px] text-[12px]"
          >
            <MenuItem value="">All Assigned Branches</MenuItem>
            {branches.map((b: any) => (
              <MenuItem key={b._id} value={b._id}>
                {b.title}
              </MenuItem>
            ))}
          </Select>

          <Select
            displayEmpty
            size="small"
            value={filters.tacId}
            onChange={(e) => handleFilterChange("tacId", e.target.value)}
            className="flex-1 min-w-[160px] text-[12px]"
          >
            <MenuItem value="">All TAC Users</MenuItem>
            {tacs.map((t: any) => (
              <MenuItem key={t._id} value={t._id}>
                {t.firstName} {t.lastName}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* ── Main Data Table ── */}
      <TableContainer
        component={Paper}
        className="shadow-xl"
        sx={responsiveTableSx}
      >
        <Table size="small">
          <TableHead>
            <TableRow className="resp-thead">
              {COLS.map((head, i) => (
                <TableCell
                  key={i}
                  className={`py-4 px-4 font-semibold bg-[var(--mui-palette-primary)] text-[var(--mui-palette-secondary-main)] whitespace-nowrap ${
                    head === "Status" ? "text-center" : ""
                  }`}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={COLS.length} className="text-center py-10">
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : candidates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLS.length}
                  className="text-center py-8 text-gray-400"
                >
                  No candidates found.
                </TableCell>
              </TableRow>
            ) : (
              candidates.map((row) => (
                <TableRow
                  key={row._id}
                  hover
                  className="resp-row transition-colors"
                >
                  {/* Candidate Name & Inquiry Code */}
                  <TableCell
                    className="resp-cell !py-3 !px-4"
                    data-label="Candidate"
                  >
                    <Box>
                      <Typography className="font-semibold text-[13px]">
                        {row.fullName}
                      </Typography>
                      <Typography className="text-[12px] text-[var(--mui-palette-text-secondary)]">
                        {row.inqNo}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Branch Assignment */}
                  <TableCell
                    className="resp-cell !py-3 !px-4 text-[13px]"
                    data-label="Branch"
                  >
                    {row.branchTitle}
                  </TableCell>

                  {/* Assigned TAC Module User */}
                  <TableCell
                    className="resp-cell !py-3 !px-4 text-[13px]"
                    data-label="Assigned TAC"
                  >
                    {row.tacName}
                  </TableCell>

                  {/* Contact Info (Phone & Email) */}
                  <TableCell
                    className="resp-cell !py-3 !px-4 text-[12px] text-[var(--mui-palette-text-secondary)]"
                    data-label="Contact"
                  >
                    <Box>
                      <Typography className="text-[12px]">
                        {row.phone}
                      </Typography>
                      <Typography
                        className="text-[12px] truncate max-w-[150px]"
                        title={row.email}
                      >
                        {row.email}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Operational Timeline Status Badge */}
                  <TableCell
                    className="resp-cell !py-3 !px-4 md:text-center"
                    data-label="Status"
                  >
                    <Box
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${row.statusClass}`}
                    >
                      {row.statusLabel}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Table Pagination Controls ── */}
      {totalPages > 1 && (
        <Box className="flex justify-center md:justify-end mt-4">
          <Pagination
            count={totalPages}
            page={filters.page}
            onChange={(_e, val) => handlePageChange(val)}
            color="primary"
            size="small"
          />
        </Box>
      )}
    </Box>
  );
};

export default AllCandidatesView;
