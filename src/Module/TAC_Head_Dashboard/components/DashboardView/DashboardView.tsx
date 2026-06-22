"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, Pagination, CircularProgress } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";
import { CamelCase } from "@/Utils/common";
import { getEscalationListAction } from "@/Services/APIs/tacHead/escalation.actions";
import EscalationActionModal from "./EscalationActionModal";  

dayjs.extend(relativeTime);

const DashboardView = ({ setCurrentView }: any) => {
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState<any>(null);

  const fetchEscalations = useCallback(async () => {
    setLoading(true);
    const res = await getEscalationListAction(page, 10);
    if (res?.success) {
      setEscalations(res.data.escalations);
      setTotalPages(res.data.meta.totalPages);
    } else {
    //   toast.error(res?.message || "Failed to load requests");
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchEscalations();
  }, [fetchEscalations]);

  const openActionModal = (escalation: any) => {
    setSelectedEscalation(escalation);
    setModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    if (status === "approved") return "success";
    if (status === "rejected") return "error";
    return "warning";
  };

  return (
    <Box className="w-full rounded-[20px] shadow-2xl p-4 md:p-8 font-sans">
      <Typography className="text-[22px] md:text-[28px] font-medium tracking-tight mb-6">
        TAC Head - Escalation Approvals
      </Typography>

      <TableContainer component={Paper} className="shadow-xl">
        <Table size="small">
          <TableHead>
            <TableRow>
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
              <TableRow><TableCell colSpan={6} className="text-center py-10"><CircularProgress /></TableCell></TableRow>
            ) : escalations.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">No escalation requests found.</TableCell></TableRow>
            ) : (
              escalations.map((row: any) => (
                <TableRow key={row._id} hover>
                  <TableCell className="py-3 px-4">
                    <Typography className="font-semibold text-[13px]">{row.leadId?.fullName}</Typography>
                    <Typography className="text-[12px] text-gray-500">{CamelCase(row.leadId?.status)}</Typography>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[13px]">{row.fromId?.firstName} {row.fromId?.lastName}</TableCell>
                  <TableCell className="py-3 px-4 text-[13px]">{row.toId?.firstName} {row.toId?.lastName}</TableCell>
                  <TableCell className="py-3 px-4">
                    <Chip label={CamelCase(row.status)} color={getStatusColor(row.status)} size="small" variant="outlined" className="text-[13px] border-none shadow-2xl font-bold" />
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[12px] text-[var(--mui-palette-primary)]">{dayjs(row.createdAt).fromNow()}</TableCell>
                  <TableCell className="py-3 px-4 text-right">
                    <IconButton size="small" onClick={() => openActionModal(row)} color="primary" className="bg-var(--mui-palette-primary-main)">
                      <i className="ri-shield-check-line text-[20px]" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box className="flex justify-center mt-4">
          <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
        </Box>
      )}

      {/* Action Modal Component */}
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