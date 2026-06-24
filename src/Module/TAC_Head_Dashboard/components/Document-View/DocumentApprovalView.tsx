"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Chip, 
  Pagination, CircularProgress 
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getAwaitingDocumentsAction } from "../../../../Services/APIs/tacHead/document.action";
import DocumentActionModal from "./DocumentActionModal";  

dayjs.extend(relativeTime);

const DocumentApprovalView = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
 
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const res = await getAwaitingDocumentsAction(page, 10);
    if (res?.success !== false) {
      setLeads(res.leads || []);
      setTotalPages(res.meta?.totalPages || 1);
    } else {
      // toast.error(res?.message || "Failed to load documents");
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const openActionModal = (lead: any) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  return (
    <Box className="w-full rounded-[20px] shadow-2xl p-4 md:p-8 font-sans bg-white">
      <Typography className="text-[22px] md:text-[28px] font-medium tracking-tight mb-6">
        TAC Head - Document Approvals
      </Typography>

      <TableContainer component={Paper} className="shadow-xl">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Candidate</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Inquiry No</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Assigned TAC</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Position Applied</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white">Submitted</TableCell>
              <TableCell className="py-4 px-4 font-semibold bg-[var(--mui-palette-primary-main)] text-white text-right">Review</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10"><CircularProgress /></TableCell></TableRow>
            ) : leads.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 font-medium text-gray-500">No documents awaiting approval.</TableCell></TableRow>
            ) : (
              leads.map((row: any) => (
                <TableRow key={row._id} hover>
                  <TableCell className="py-3 px-4">
                    <Typography className="font-semibold text-[13px]">{row.fullName}</Typography>
                    <Typography className="text-[12px] text-gray-500">{row.contact?.phone}</Typography>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[13px] font-mono font-medium">
                    {row.inqNo || "N/A"}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[13px]">
                    {row.preferences?.consultantId 
                      ? `${row.preferences.consultantId.firstName} ${row.preferences.consultantId.lastName}` 
                      : "Unassigned"}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Chip 
                      label={row.documents?.position?.title || "N/A"} 
                      size="small" 
                      variant="outlined" 
                      className="text-[12px] font-bold bg-gray-50" 
                    />
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[12px] text-[var(--mui-palette-primary)]">
                    {row.documents?.submittedOn ? dayjs(row.documents.submittedOn).fromNow() : "N/A"}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right">
                    <IconButton size="small" onClick={() => openActionModal(row)} color="primary" className="bg-blue-50 hover:bg-[var(--mui-palette-primary-main)] hover:text-white transition-all text-[#0054a6]">
                      <i className="ri-file-search-line text-[20px]" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box className="flex justify-center mt-6">
          <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
        </Box>
      )}

      {/* Action Modal Component */}
      <DocumentActionModal 
        open={modalOpen} 
        setOpen={setModalOpen} 
        lead={selectedLead} 
        refreshData={fetchDocuments} 
      />
    </Box>
  );
};

export default DocumentApprovalView;