// "use client";

// import { useState, useEffect, useCallback, useRef } from "react";
// import {
//   Box,
//   Typography,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   Pagination,
//   CircularProgress,
//   Paper,
//   TextField,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";
// import { getAwaitingExperienceAction } from "@/Services/APIs/tacHead/experience.action";
// import { CamelCase } from "@/Utils/common";
// import TechnicalActionModal from "./TechnicalActionModal";

// dayjs.extend(relativeTime);

// // ── Shared responsive-table sx (mirrors DashboardTable) ──────────────────────
// const responsiveTableSx = {
//   "& .resp-thead": { "@media (max-width: 767px)": { display: "none" } },
//   "& .resp-row": {
//     "@media (max-width: 767px)": {
//       display: "block",
//       borderBottom: "2px solid",
//       borderColor: "divider",
//       mb: 1,
//       borderRadius: 2,
//       overflow: "hidden",
//     },
//   },
//   "& .resp-cell": {
//     "@media (max-width: 767px)": {
//       display: "flex",
//       justifyContent: "space-between",
//       alignItems: "center",
//       px: 2,
//       py: 1,
//       borderBottom: "1px solid",
//       borderColor: "divider",
//       "&:last-child": { borderBottom: "none" },
//       "&::before": {
//         content: "attr(data-label)",
//         fontWeight: 600,
//         fontSize: "0.72rem",
//         color: "text.secondary",
//         flexShrink: 0,
//         mr: 2,
//         minWidth: 110,
//       },
//     },
//   },
// };

// // ── Status badge (mirrors DashboardTable getStatusBadge) ─────────────────────
// const getTechStatusBadge = (status: string) => {
//   switch (status) {
//     case "refered": return "bg-[var(--mui-palette-warning-main)] text-white";
//     case "passed": return "bg-[var(--mui-palette-success-main)] text-white";
//     case "failed": return "bg-[var(--mui-palette-error-main)] text-white";
//     default: return "bg-[--mui-palette-grey-400] text-white";
//   }
// };

// const COLS = ["Candidate", "Assigned TAC", "Technical Status", "Contact", "Actions"];

// // ── Component ─────────────────────────────────────────────────────────────────

// const TechnicalView = () => {
//   const [leads, setLeads] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedLead, setSelectedLead] = useState<any>(null);

//   // ── Filters ────────────────────────────────────────────────────────────────
//   const [searchInput, setSearchInput] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   // Debounce search — reset to page 1 on new query
//   const handleSearchChange = (val: string) => {
//     setSearchInput(val);
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(() => {
//       setDebouncedSearch(val);
//       setPage(1);
//     }, 400);
//   };

//   // Reset page when status changes
//   const handleStatusChange = (val: string) => {
//     setStatusFilter(val);
//     setPage(1);
//   };

//   // ── Fetch ──────────────────────────────────────────────────────────────────
//   const fetchTechnicalRequests = useCallback(async () => {
//     setLoading(true);
//     const res = await getAwaitingExperienceAction(page, 10, debouncedSearch, statusFilter);
//     if (res && res.success !== false) {
//       setLeads(res.data?.technicalRequestedLeads || []);
//       setTotalPages(res.data?.meta?.totalPages || 1);
//     }
//     setLoading(false);
//   }, [page, debouncedSearch, statusFilter]);

//   useEffect(() => {
//     fetchTechnicalRequests();
//   }, [fetchTechnicalRequests]);

//   const openActionModal = (lead: any) => {
//     setSelectedLead(lead);
//     setModalOpen(true);
//   };

//   return (
//     <Box className="w-full rounded-[20px] shadow-2xl p-4 md:p-8 font-sans bg-[var(--mui-palette-primary)]">
//       <Typography className="text-[22px] md:text-[28px] text-[var(--mui-palette-secondary)] font-medium tracking-tight mb-6">
//         Technical Round
//       </Typography>

//       {/* ── Filters (mirrors DashboardFilters layout) ─────────────────────── */}
//       <Box className="flex flex-col gap-3 mb-5">
//         <TextField
//           fullWidth
//           size="small"
//           placeholder="Search by name, inquiry ID, email or phone..."
//           value={searchInput}
//           onChange={(e) => handleSearchChange(e.target.value)}
//           slotProps={{ input: { className: "rounded-lg text-[14px]" } }}
//         />
//         <Box className="flex gap-2 flex-wrap">
//           <Select
//             displayEmpty
//             size="small"
//             value={statusFilter}
//             onChange={(e) => handleStatusChange(e.target.value)}
//             className="flex-1 min-w-[160px] text-[12px]"
//           >
//             <MenuItem value="">All Statuses</MenuItem>
//             <MenuItem value="refered">Referred</MenuItem>
//             <MenuItem value="passed">Passed</MenuItem>
//             <MenuItem value="failed">Failed</MenuItem>
//             <MenuItem value="na">Not Applicable</MenuItem>
//           </Select>
//         </Box>
//       </Box>

//       {/* ── Table ─────────────────────────────────────────────────────────── */}
//       <TableContainer component={Paper} className="shadow-xl" sx={responsiveTableSx}>
//         <Table size="small">
//           <TableHead>
//             <TableRow className="resp-thead">
//               {COLS.map((head, i) => (
//                 <TableCell
//                   key={i}
//                   className={`py-4 px-4 font-semibold bg-[var(--mui-palette-primary)] text-[var(--mui-palette-secondary-main)] whitespace-nowrap
//                     ${head === "Actions" ? "text-right" : ""}`}
//                 >
//                   {head}
//                 </TableCell>
//               ))}
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {loading ? (
//               <TableRow>
//                 <TableCell colSpan={COLS.length} className="text-center py-10">
//                   <CircularProgress size={28} />
//                 </TableCell>
//               </TableRow>
//             ) : leads.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={COLS.length} className="text-center py-8 text-gray-400">
//                   No candidates found.
//                 </TableCell>
//               </TableRow>
//             ) : (
//               leads.map((row: any) => (
//                 <TableRow key={row._id} hover className="resp-row transition-colors">
//                   {/* Candidate */}
//                   <TableCell className="resp-cell !py-3 !px-4" data-label="Candidate">
//                     <Box>
//                       <Typography className="font-semibold text-[13px]">
//                         {row.fullName}
//                       </Typography>
//                       <Typography className="text-[12px] text-[var(--mui-palette-text-secondary)]">
//                         {row.inqNo || "—"}
//                       </Typography>
//                     </Box>
//                   </TableCell>

//                   {/* Assigned TAC */}
//                   <TableCell className="resp-cell !py-3 !px-4 text-[13px]" data-label="Assigned TAC">
//                     {row.preferences?.consultantId
//                       ? `${row.preferences.consultantId.firstName} ${row.preferences.consultantId.lastName}`
//                       : <span className="text-gray-400">Unassigned</span>}
//                   </TableCell>

//                   {/* Technical Status */}
//                   <TableCell className="resp-cell !py-3 !px-4" data-label="Technical Status">
//                     <Box className={`inline-block px-3 py-1 rounded-full text-[11px] tracking-wide font-normal whitespace-nowrap ${getTechStatusBadge(row.technical?.status)}`}>
//                       {CamelCase(row.technical?.status) || "—"}
//                     </Box>
//                   </TableCell>

//                   {/* Contact */}
//                   <TableCell className="resp-cell !py-3 !px-4 text-[12px] text-[var(--mui-palette-text-secondary)]" data-label="Contact">
//                     {row.contact?.phone || "—"}
//                   </TableCell>

//                   {/* Actions */}
//                   <TableCell className="resp-cell !py-3 !px-4" data-label="Actions">
//                     <Box className="flex gap-1 md:justify-end">
//                       <IconButton
//                         size="small"
//                         title="Review candidate"
//                         onClick={() => openActionModal(row)}
//                         color="primary"
//                         disabled={["passed", "verified"].includes(row?.technical?.status)}
//                       >
//                         <i className="ri-search-eye-line text-[18px]" />
//                       </IconButton>
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {totalPages > 1 && (
//         <Box className="flex justify-center md:justify-end mt-4">
//           <Pagination
//             count={totalPages}
//             page={page}
//             onChange={(_e, val) => setPage(val)}
//             color="primary"
//             size="small"
//           />
//         </Box>
//       )}

//       <TechnicalActionModal
//         open={modalOpen}
//         setOpen={setModalOpen}
//         lead={selectedLead}
//         refreshData={fetchTechnicalRequests}
//       />
//     </Box>
//   );
// };

// export default TechnicalView;
"use client";

import React from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Pagination, CircularProgress, Paper, TextField, Select, MenuItem,
} from "@mui/material";
import { CamelCase } from "@/Utils/common";
import TechnicalActionModal from "./TechnicalActionModal";
import { useTechnicalView } from "./useTechnicalView";


const TechnicalView = () => {
  const {
    leads, loading, page, setPage, totalPages, modalOpen, setModalOpen,
    selectedLead, searchInput, statusFilter, handleSearchChange, handleStatusChange,
    openActionModal, fetchTechnicalRequests,
    responsiveTableSx, getTechStatusBadge, COLS
  } = useTechnicalView();

  return (
    <Box className="w-full rounded-[20px] shadow-2xl p-4 md:p-8 font-sans bg-[var(--mui-palette-primary)]">
      <Typography className="text-[22px] md:text-[28px] text-[var(--mui-palette-secondary)] font-medium tracking-tight mb-6">
        Technical Round
      </Typography>

      {/* ── Filter View Interface ── */}
      <Box className="flex flex-col gap-3 mb-5">
        <TextField
          fullWidth size="small" placeholder="Search by name, inquiry ID, email or phone..."
          value={searchInput} onChange={(e) => handleSearchChange(e.target.value)}
          slotProps={{ input: { className: "rounded-lg text-[14px]" } }}
        />
        <Box className="flex gap-2 flex-wrap">
          <Select
            displayEmpty size="small" value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)}
            className="flex-1 min-w-[160px] text-[12px]"
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="refered">Referred</MenuItem>
            <MenuItem value="passed">Passed</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="na">Not Applicable</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* ── Responsive Data Table Grid ── */}
      <TableContainer component={Paper} className="shadow-xl" sx={responsiveTableSx}>
        <Table size="small">
          <TableHead>
            <TableRow className="resp-thead">
              {COLS.map((head, i) => (
                <TableCell
                  key={i}
                  className={`py-4 px-4 font-semibold bg-[var(--mui-palette-primary)] text-[var(--mui-palette-secondary-main)] whitespace-nowrap ${
                    head === "Actions" ? "text-right" : ""
                  }`}
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
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLS.length} className="text-center py-8 text-gray-400">
                  No candidates found.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((row: any) => (
                <TableRow key={row._id} hover className="resp-row transition-colors">
                  <TableCell className="resp-cell !py-3 !px-4" data-label="Candidate">
                    <Box>
                      <Typography className="font-semibold text-[13px]">{row.fullName}</Typography>
                      <Typography className="text-[12px] text-[var(--mui-palette-text-secondary)]">{row.inqNo || "—"}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell className="resp-cell !py-3 !px-4 text-[13px]" data-label="Assigned TAC">
                    {row.preferences?.consultantId
                      ? `${row.preferences.consultantId.firstName} ${row.preferences.consultantId.lastName}`
                      : <span className="text-gray-400">Unassigned</span>}
                  </TableCell>

                  <TableCell className="resp-cell !py-3 !px-4" data-label="Technical Status">
                    <Box className={`inline-block px-3 py-1 rounded-full text-[11px] tracking-wide font-normal whitespace-nowrap ${getTechStatusBadge(row.technical?.status)}`}>
                      {CamelCase(row.technical?.status) || "—"}
                    </Box>
                  </TableCell>

                  <TableCell className="resp-cell !py-3 !px-4 text-[12px] text-[var(--mui-palette-text-secondary)]" data-label="Contact">
                    {row.contact?.phone || "—"}
                  </TableCell>

                  <TableCell className="resp-cell !py-3 !px-4" data-label="Actions">
                    <Box className="flex gap-1 md:justify-end">
                      <IconButton
                        size="small" title="Review candidate" onClick={() => openActionModal(row)} color="primary"
                        disabled={["passed", "verified"].includes(row?.technical?.status)}
                      >
                        <i className="ri-search-eye-line text-[18px]" />
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

      <TechnicalActionModal open={modalOpen} setOpen={setModalOpen} lead={selectedLead} refreshData={fetchTechnicalRequests} />
    </Box>
  );
};

export default TechnicalView;