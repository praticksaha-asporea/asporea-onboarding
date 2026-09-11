"use client";

import {
  Box,
  Typography,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Checkbox,
  Avatar,
  Collapse,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { useReminders } from "./useReminders";

const RemindersView = () => {
  const {
    status,
    setStatus,
    candidates,
    tacs,
    isLoading,
    isSending,
    selectedCandidates,
    selectedTacs,
    toggleCandidate,
    toggleTac,
    handleSelectAllCandidates,
    handleSelectAllTacs,
    candidateHeading,
    setCandidateHeading,
    candidateMessage,
    setCandidateMessage,
    tacHeading,
    setTacHeading,
    tacMessage,
    setTacMessage,
    handleSendReminders,
  } = useReminders();

  return (
    <Box className="w-full min-h-screen rounded-[20px] shadow-2xl p-4 md:p-8 font-sans bg-[var(--mui-palette-primary)]">
      <Box className="mb-8">
        <Typography className="text-[22px] md:text-[28px] font-medium text-[var(--mui-palette-text-primary)]">
          Bulk Reminders
        </Typography>
        <Typography className="text-[14px] text-[var(--mui-palette-primary-main)] mt-1">
          Select a status to fetch candidates and their assigned TACs, then push
          custom notifications.
        </Typography>
      </Box>

      {/* ── STATUS SELECTOR ── */}
      <Box className="mb-8 max-w-md">
        <Typography className="text-[14px] font-semibold mb-2">
          Select Target Status
        </Typography>
        <Select
          fullWidth
          size="small"
          displayEmpty
          value={status}
          onChange={(e) => setStatus(e.target.value as string)}
          className="bg-[var(--mui-palette-background-default)] rounded-xl"
        >
          <MenuItem value="" disabled>
            Select Status...
          </MenuItem>
          <MenuItem value="inquiry_submitted">Inquiry Submitted</MenuItem>
          <MenuItem value="pre_scheduled">Pre-Counselling Scheduled</MenuItem>
          <MenuItem value="pre_completed">Pre-Counselling Completed</MenuItem>
          <MenuItem value="pre_not_responded">Pre Not Responded</MenuItem>
          <MenuItem value="doc_submitted">Documents Submitted</MenuItem>
          <MenuItem value="exp_submitted">Experience Submitted</MenuItem>
          <MenuItem value="assess_scheduled">Assessment Scheduled</MenuItem>
        </Select>
      </Box>

      {isLoading ? (
        <Box className="flex justify-center items-center py-20">
          <CircularProgress />
        </Box>
      ) : (
        status && (
          <Grid container spacing={6}>
            {/* ── CANDIDATES SECTION ── */}
                         <Grid size={{ xs: 12, md: 6 }}>
           
              <Card className="rounded-2xl shadow-2xl bg-[var(--mui-palette-primary)] h-full flex flex-col">
                <Box className="p-4 bg-[var(--mui-palette-background-default)] flex justify-between items-center  ">
                  <Typography className="font-medium text-[18px] tracking-wide">
                    Candidates ({candidates.length})
                  </Typography>
                  {candidates.length > 0 && (
                    <Button
                      size="small"
                      onClick={handleSelectAllCandidates}
                      sx={{ textTransform: "none", fontWeight: "bold" }}
                    >
                      {selectedCandidates.length === candidates.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  )}
                </Box>

                <CardContent className="flex-1 overflow-y-auto max-h-[450px] p-4 bg-[var(--mui-palette-background-default)]/30">
                  {candidates.length === 0 ? (
                    <Typography className="text-center p-6 text-[var(--mui-palette-text-secondary)]">
                      No candidates found for this status.
                    </Typography>
                  ) : (
                    <Box className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {candidates.map((c) => {
                        const isSelected = selectedCandidates.includes(c.leadId);
                        return (
                          <Box
                            key={c.leadId}
                            onClick={() => toggleCandidate(c.leadId)}
                            className={`relative cursor-pointer rounded-2xl shadow-2xl bg-[var(--mui-palette-primary)]  p-4 flex flex-col items-center text-center transition-all duration-300 ease-out
                              hover:-translate-y-2 hover:scale-[1.05] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]  
                              ${
                                isSelected
                                  ? "border-[var(--mui-palette-primary-main)] bg-[var(--mui-palette-primary-lightOpacity)] shadow-md"
                                  : "border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)]"
                              }
                            `}
                          >
                            <Checkbox
                              checked={isSelected}
                              className="absolute top-1 right-1"
                              size="small"
                              disableRipple
                              tabIndex={-1}
                            />
                            <Avatar
                              src={
                                typeof c.profilePic === "string"
                                  ? c.profilePic
                                  : c.profilePic?.url ||
                                    "/images/avatars/avatar.png"
                              }
                              sx={{
                                width: 56,
                                height: 56,
                                mb: 1.5,
                                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                              }}
                            />
                            <Typography className="font-semibold text-[13px] w-full truncate leading-tight">
                              {c.fullName}
                            </Typography>
                            <Typography className="text-[11px] text-[var(--mui-palette-text-secondary)] mt-0.5">
                              {c.inqNo}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </CardContent>

                {/* Candidate Message Form (Slide Down) */}
                <Collapse in={selectedCandidates.length > 0}>
                  <Box className="p-4 bg-[var(--mui-palette-background-default)] border-[var(--mui-palette-divider)]">
                    <Typography className="text-[16px] font-medium mb-3 tracking-wide text-[var(--mui-palette-primary)]">
                      Notification to Candidates ({selectedCandidates.length} selected)
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      label="Heading"
                      value={candidateHeading}
                      onChange={(e) => setCandidateHeading(e.target.value)}
                      className="mb-4 bg-[var(--mui-palette-primary)]"
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Message"
                      multiline
                      rows={3}
                      value={candidateMessage}
                      onChange={(e) => setCandidateMessage(e.target.value)}
                      className="bg-[var(--mui-palette-background-primary)]"
                    />
                  </Box>
                </Collapse>
              </Card>
            </Grid>

            {/* ── TACs SECTION ── */}
                        <Grid size={{ xs: 12, md: 6 }}>
          
              <Card className="rounded-2xl shadow-2xl bg-[var(--mui-palette-primary)] h-full flex flex-col">
                <Box className="p-4 bg-[var(--mui-palette-background-default)] flex justify-between items-center  ">
                  <Typography className="font-medium text-[18px] tracking-wide">
                    Associated TACs ({tacs.length})
                  </Typography>
                  {tacs.length > 0 && (
                    <Button
                      size="small"
                      onClick={handleSelectAllTacs}
                      sx={{ textTransform: "none", fontWeight: "bold" }}
                    >
                      {selectedTacs.length === tacs.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  )}
                </Box>

                <CardContent className="flex-1 overflow-y-auto max-h-[450px] p-4 bg-[var(--mui-palette-background-default)]/30">
                  {tacs.length === 0 ? (
                    <Typography className="text-center p-6 text-[var(--mui-palette-text-secondary)]">
                      No assigned TACs found.
                    </Typography>
                  ) : (
                    <Box className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {tacs.map((t, idx) => {
                       const rowKey = `${t.tacId}_${t.leadId}`;
                        const isSelected = selectedTacs.includes(rowKey);
                        return (
                          <Box
                           key={rowKey}
                          onClick={() => toggleTac(rowKey)}
                            className={`relative cursor-pointer rounded-2xl shadow-2xl p-4 flex flex-col items-center text-center transition-all duration-300 ease-out
                              hover:-translate-y-2 hover:scale-[1.05] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]  
                              ${
                                isSelected
                                  ? "border-[var(--mui-palette-secondary-main)] bg-[var(--mui-palette-secondary-lightOpacity)] shadow-md"
                                  : "border-[var(--mui-palette-divider)] bg-[var(--mui-palette-primary)]"
                              }
                            `}
                          >
                            <Checkbox
                              checked={isSelected}
                              className="absolute top-1 right-1"
                              size="small"
                              color="secondary"
                              disableRipple
                              tabIndex={-1}
                            />
                            <Avatar
                              src={t.profilePic || undefined}
                              sx={{
                                width: 56,
                                height: 56,
                                mb: 1.5,
                                bgcolor: "var(--mui-palette-primary-main)",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                              }}
                            >
                              {!t.profilePic && t.tacName.charAt(0)}
                            </Avatar>
                            <Typography className="font-semibold text-[13px] w-full truncate leading-tight">
                              {t.tacName}
                            </Typography>
                            <Typography className="text-[10px] text-[var(--mui-palette-text-secondary)] mt-1 leading-tight w-full truncate">
                              Assigned: {t.inqNo}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </CardContent>

                {/* TAC Message Form (Slide Down) */}
                <Collapse in={selectedTacs.length > 0}>
                  <Box className="p-4 bg-[var(--mui-palette-background-default)]   border-[var(--mui-palette-divider)]">
                    <Typography className="text-[16px] font-medium tracking-wide mb-3 text-[var(--mui-palette-secondary)]">
Notification to TACs ({selectedTacs.length} Inquiry selected / {new Set(selectedTacs.map((key) => key.split("_")[0])).size} unique TAC)                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      label="Heading"
                      value={tacHeading}
                      onChange={(e) => setTacHeading(e.target.value)}
                      className="mb-4 bg-[var(--mui-palette-primary)]"
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Message"
                      multiline
                      rows={3}
                      value={tacMessage}
                      onChange={(e) => setTacMessage(e.target.value)}
                      className="bg-[var(--mui-palette-primary)]"
                    />
                  </Box>
                </Collapse>
              </Card>
            </Grid>
          </Grid>
        )
      )}

      {/* ── SUBMIT BUTTON ── */}
      {status && (selectedCandidates.length > 0 || selectedTacs.length > 0) && (
        <Box className="mt-8 flex justify-end">
          <Button
            variant="contained"
            size="large"
            disabled={isSending}
            onClick={handleSendReminders}
            className="px-8 py-3 rounded-xl shadow-lg bg-[var(--mui-palette-primary-main)] hover:bg-[var(--mui-palette-primary-dark)] transition-transform hover:scale-105"
            startIcon={
              isSending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <i className="ri-send-plane-fill" />
              )
            }
          >
            {isSending ? "Sending..." : "Send Reminders"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RemindersView;