"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Pagination,
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import EscalationActionModal from "./EscalationActionModal";
import { useDashboardView } from "./useDashboardView";

dayjs.extend(relativeTime);

interface DashboardViewProps {
  setCurrentView: (view: "dashboard" | "detail") => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ setCurrentView }) => {
  const {
    escalations,
    loading,
    filters,
    totalPages,
    handleSearchChange,
    handleTacChange,
    handlePageChange,
    uniqueTacs,
    modalOpen,
    setModalOpen,
    selectedEscalation,
    openActionModal,
    handleResetFilters,
    fetchEscalations,
  } = useDashboardView();

  const getStatusColor = (status: string) => {
    if (status === "approved") return "success";
    if (status === "rejected") return "error";
    return "warning";
  };
return (
    <Box className="w-full rounded-[20px] shadow-2xl p-4 md:p-8 font-sans bg-[var(--mui-palette-primary)]">
      <Typography className="text-[22px] text-[var(--mui-palette-secondary)] md:text-[28px] font-medium tracking-tight mb-6">
        Escalation Requests
      </Typography>

      
      <Box className="flex flex-col md:flex-row gap-4 mb-6 p-4 rounded-xl shadow-2xl">
        <TextField
          size="small"
          label="Search by Candidate or Inq No."
          variant="outlined"
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 md:max-w-md"
        />

        <FormControl size="small" className="flex-1 md:max-w-xs">
          <InputLabel>Filter by TAC</InputLabel>
          <Select
            value={filters.tacId}
            label="Filter by Target TAC"
            onChange={(e) => handleTacChange(e.target.value as string)}
          >
            <MenuItem value=""><em>All TACs</em></MenuItem>
            {uniqueTacs.map((tac) => (
              <MenuItem key={tac._id} value={tac._id}>
                {tac.firstName} {tac.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {(filters.search || filters.tacId) && (
          <Button variant="text" color="error" onClick={handleResetFilters} className="normal-case">
            Clear Filters
          </Button>
        )}
      </Box>

     
      <TableContainer component={Paper} className="shadow-xl">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Inq No.</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Candidate</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Escalated By</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Target TAC</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Status</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Date</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white text-right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : escalations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  No escalation requests found.
                </TableCell>
              </TableRow>
            ) : (
              escalations.map((row) => (
                <TableRow key={row._id} hover>
                 
                  <TableCell className="py-3 px-4 text-[13px] font-bold text-[var(--mui-palette-secondary)]">
                    {row.inqNo}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Typography className="font-semibold text-[13px]">{row.fullName}</Typography>
                    <Typography className="text-[12px] text-gray-500">{row.leadStatus}</Typography>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[13px]">
                    {row.fromName}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[13px]">
                    {row.toName}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Chip
                      label={row.statusLabel}
                      color={row.statusColor}
                      size="small"
                      variant="outlined"
                      className="text-[13px] border-none shadow-2xl font-bold"
                    />
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[12px] text-[var(--mui-palette-primary)]">
                    {row.timeAgo}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right">
                    <IconButton
                      size="small"
                      onClick={() => openActionModal(row.rawRecord)}
                      color="primary"
                      className="bg-var(--mui-palette-primary-main)"
                    >
                      <i className="ri-shield-check-line text-[20px]" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── PAGINATION CONTROLS ── */}
      {totalPages > 1 && (
        <Box className="flex justify-center mt-4">
          <Pagination
            count={totalPages}
            page={filters.page}
            onChange={(_e, val) => handlePageChange(val)}
            color="primary"
          />
        </Box>
      )}

      {/* ── ACTION INTERACTION MODAL ── */}
      <EscalationActionModal
        open={modalOpen}
        setOpen={setModalOpen}
        escalation={selectedEscalation}
        refreshData={fetchEscalations}
      />
    </Box>
  );
};

export default DashboardView;

// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, Pagination, CircularProgress, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
// import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";
// import toast from "react-hot-toast";
// import { CamelCase } from "@/Utils/common";
// import { getEscalationListAction } from "@/Services/APIs/tacHead/escalation.actions";
// import EscalationActionModal from "./EscalationActionModal";  

// dayjs.extend(relativeTime);

// const DashboardView = ({ setCurrentView }: any) => {
//   const [escalations, setEscalations] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedTac, setSelectedTac] = useState("");
//   const [uniqueTacs, setUniqueTacs] = useState<any[]>([]);
  
//   // Modal States
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedEscalation, setSelectedEscalation] = useState<any>(null);

//  const fetchEscalations = useCallback(async () => {
//     setLoading(true);
//     const res = await getEscalationListAction(page, 10, searchTerm, selectedTac);
//     if (res?.success) {
//       setEscalations(res.data.escalations);
//       setTotalPages(res.data.meta.totalPages);

     
//       if (page === 1 && selectedTac === "") {
//         const tacs = res.data.escalations.map((esc: any) => esc.toId).filter(Boolean);
//         const unique = Array.from(new Set(tacs.map((a: any) => a._id))).map(id => {
//           return tacs.find((a: any) => a._id === id);
//         });
//         setUniqueTacs(unique);
//       }
//     } else {
//       toast.error(res?.message || "Failed to load requests");
//     }
//     setLoading(false);
//   }, [page, searchTerm, selectedTac]);

//   useEffect(() => {
//     fetchEscalations();
//   }, [fetchEscalations]);

//   const openActionModal = (escalation: any) => {
//     setSelectedEscalation(escalation);
//     setModalOpen(true);
//   };

//   const getStatusColor = (status: string) => {
//     if (status === "approved") return "success";
//     if (status === "rejected") return "error";
//     return "warning";
//   };

//   const handleResetFilters = () => {
//     setSearchTerm("");
//     setSelectedTac("");
//     setPage(1);
//   };

//   return (
//     <Box className="w-full rounded-[20px] shadow-2xl p-4 md:p-8 font-sans">
//       <Typography className="text-[22px] text-[var(--mui-palette-primary)]
//  md:text-[28px] font-medium tracking-tight mb-6">
//       Escalation Requests
//       </Typography>

//       {/* ---------------- FILTER SECTION  ---------------- */}
//       <Box className="flex flex-col md:flex-row gap-4 mb-6 bg-[var(--mui-palette-primary)] p-4 rounded-xl shadow-2xl">
//         <TextField
//           size="small"
//           label="Search by Candidate or Inq No."
//           variant="outlined"
//           value={searchTerm}
//           onChange={(e) => {
//             setSearchTerm(e.target.value);
//             setPage(1);  
//           }}
//           className="flex-1 md:max-w-md"
//         />
        
//         <FormControl size="small" className="flex-1 md:max-w-xs">
//           <InputLabel>Filter by TAC</InputLabel>
//           <Select
//             value={selectedTac}
//             label="Filter by Target TAC"
//             onChange={(e) => {
//               setSelectedTac(e.target.value);
//               setPage(1);  
//             }}
//           >
//             <MenuItem value=""><em>All TACs</em></MenuItem>
//             {uniqueTacs.map((tac) => (
//               <MenuItem key={tac._id} value={tac._id}>
//                 {tac.firstName} {tac.lastName}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>

//         {(searchTerm || selectedTac) && (
//           <Button variant="text" color="error" onClick={handleResetFilters} className="normal-case">
//             Clear Filters
//           </Button>
//         )}
//       </Box>
//       {/* ------------------------------------------------------------- */}

//       <TableContainer component={Paper} className="shadow-xl">
//         <Table size="small">
//           <TableHead>
//             <TableRow>
//               <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Inq No.</TableCell>
//               <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Candidate</TableCell>
//               <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Escalated By</TableCell>
//               <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Target TAC</TableCell>
//               <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Status</TableCell>
//               <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Date</TableCell>
//               <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white text-right">Action</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {loading ? (
//               <TableRow><TableCell colSpan={6} className="text-center py-10"><CircularProgress /></TableCell></TableRow>
//             ) : escalations.length === 0 ? (
//               <TableRow><TableCell colSpan={6} className="text-center py-8">No escalation requests found.</TableCell></TableRow>
//             ) : (
//               escalations.map((row: any) => (
//                 <TableRow key={row._id} hover>
//                   <TableCell className="py-3 px-4 text-[13px] font-bold text-[var(--mui-palette-secondary)]
// ">
//                     {row.leadId?.inqNo || "N/A"}
//                   </TableCell>
//                   <TableCell className="py-3 px-4">
//                     <Typography className="font-semibold text-[13px]">{row.leadId?.fullName}</Typography>
//                     <Typography className="text-[12px] text-gray-500">{CamelCase(row.leadId?.status)}</Typography>
//                   </TableCell>
//                   <TableCell className="py-3 px-4 text-[13px]">{row.fromId?.firstName} {row.fromId?.lastName}</TableCell>
//                   <TableCell className="py-3 px-4 text-[13px]">{row.toId?.firstName} {row.toId?.lastName}</TableCell>
//                   <TableCell className="py-3 px-4">
//                     <Chip label={CamelCase(row.status)} color={getStatusColor(row.status)} size="small" variant="outlined" className="text-[13px] border-none shadow-2xl font-bold" />
//                   </TableCell>
//                   <TableCell className="py-3 px-4 text-[12px] text-[var(--mui-palette-primary)]">{dayjs(row.createdAt).fromNow()}</TableCell>
//                   <TableCell className="py-3 px-4 text-right">
//                     <IconButton size="small" onClick={() => openActionModal(row)} color="primary" className="bg-var(--mui-palette-primary-main)">
//                       <i className="ri-shield-check-line text-[20px]" />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {totalPages > 1 && (
//         <Box className="flex justify-center mt-4">
//           <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
//         </Box>
//       )}

//       {/* Action Modal Component */}
//       <EscalationActionModal 
//         open={modalOpen} 
//         setOpen={setModalOpen} 
//         escalation={selectedEscalation} 
//         refreshData={fetchEscalations} 
//       />
//     </Box>
//   );
// };

// export default DashboardView;