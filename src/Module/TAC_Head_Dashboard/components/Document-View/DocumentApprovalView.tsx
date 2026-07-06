"use client";

import { useState, useEffect, useCallback,useRef } from "react";
import {
  Box,
  Typography,

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
  Paper,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getAwaitingDocumentsAction } from "../../../../Services/APIs/tacHead/document.action";
import DocumentActionModal from "./DocumentActionModal";

dayjs.extend(relativeTime);

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


const COLS = ["Candidate", "Assigned TAC", "Position Applied", "Submitted", "Actions"];

const DocumentApprovalView = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
const res = await getAwaitingDocumentsAction(page, 10, debouncedSearch);    
if (res && res.success !== false) {
      setLeads(res.data?.leads || []);
      setTotalPages(res.data?.meta?.totalPages || 1);
    } else {
      // toast.error(res?.message || "Failed to load documents");
    }
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const openActionModal = (lead: any) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  return (
    <Box className="w-full rounded-[20px] shadow-2xl p-4 md:p-8 font-sans bg-[var(--mui-palette-primary)]">
      <Typography
        className="text-[22px] md:text-[28px] text-[var(--mui-palette-secondary)]
      font-medium tracking-tight mb-6"
      >
        TAC Head - Document Approvals
      </Typography>

      <Box className="flex flex-col gap-3 mb-5">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, inquiry ID, email or phone..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          slotProps={{ input: { className: "rounded-lg text-[14px]" } }}
        />
      </Box>

      <TableContainer component={Paper} className="shadow-xl bg-[var(--mui-palette-primary)] " sx={responsiveTableSx}>
        <Table size="small">
          <TableHead>
            <TableRow className="resp-thead">
              {COLS.map((head, i) => (
                <TableCell
                  key={i}
                  className={`py-4 px-4 font-semibold bg-[var(--mui-palette-primary)] text-[var(--mui-palette-secondary-main)] whitespace-nowrap
                               ${head === "Actions" ? "text-right" : ""}`}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 font-medium text-gray-500"
                >
                  No documents awaiting approval.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((row: any) => (
                <TableRow key={row._id} hover className="resp-row transition-colors">
                  <TableCell className="py-3 px-4">
                    <Typography className="font-semibold text-[var(--mui-palette-primary)] text-[13px]">
                      {row.fullName}
                    </Typography>
                    <Typography className="text-[12px] text-[var(--mui-palette-primary)]
  font-medium">
                      {row.inqNo || "N/A"}
                    </Typography>
                  </TableCell>

                  <TableCell className="py-3 px-4 text-[var(--mui-palette-primary)] text-[13px]">
                    {row.preferences?.consultantId
                      ? `${row.preferences.consultantId.firstName} ${row.preferences.consultantId.lastName}`
                      : "Unassigned"}
                  </TableCell>

                  <TableCell className="py-3 px-4">
                    <Chip
                      label={row.documents?.position?.title || "N/A"}
                      size="small"
                      variant="outlined"
                      className="text-[12px] text-[var(--mui-palette-primary)]
 font-medium border-none shadow-2xl bg-[var(--mui-palette-primary)]"
                    />
                  </TableCell>

                  <TableCell className="py-3 px-4 text-[12px] text-[var(--mui-palette-primary)]">
                    {row.documents?.submittedOn
                      ? dayjs(row.documents.submittedOn).fromNow()
                      : "N/A"}
                  </TableCell>

                  <TableCell className="py-3 px-4 text-right">
                   <IconButton
                      size="small"
                      title="Review candidate"
                      onClick={() => openActionModal(row)}
                      color="primary"
                      className="bg-[var(--mui-palette-primary)] hover:bg-[var(--mui-palette-primary-main)] hover:text-white transition-all"
                    >
                      <i className="ri-search-eye-line text-[18px]" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box className="flex justify-center md:justify-end mt-4">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, val) => setPage(val)}
            color="primary"
            size="small" 
          />
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
