import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Skeleton,
  Avatar,
  IconButton,
  Grid,
  useTheme,
  lighten,
} from "@mui/material";
import { branchDB, CandidateRow, tacData } from "@/Types/object.types";
import { Slot } from "@/Types/Frontend_Payload/assessment.types";
import toast from "react-hot-toast";
import TacProfileDialog from "@/Components/modals/TacProfileDialog";
import { getTacsListAction } from "@/Services/APIs/Inquiry/PreCounselling/preCounselling.action";

const getAvatarUrl = (pic: any) => {
  if (!pic) return "/images/avatars/avatar.png";
  if (typeof pic === "string") return pic;
  if (typeof pic === "object" && pic?.path) return pic.path;
  if (typeof pic === "object" && pic?.url) return pic.url;
  return "/images/avatars/avatar.png";
};

interface DashboardScheduleModalProps {
  modalOpen: boolean;
  setModalOpen: (val: boolean) => void;
  targetLead: CandidateRow;
  tacList: tacData[];
  selectedTac: tacData | string;
  setSelectedTac: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  todayStr: string;
  slotsLoading: boolean;
  slots: Slot[];
  selectedSlot: Slot;
  setSelectedSlot: (val: Slot) => void;
  handleBookSlot: (reason?: string) => void;  
  bookingLoading: boolean;
  schedulePhase: "pre" | "assess";
  branches: branchDB[];
  selectedBranch: string;
  setSelectedBranch: (val: string) => void;
  method: string;
  setMethod: (val: string) => void;
  rescheduleReason?: string;
  setRescheduleReason?: (val: string) => void;
}

const DashboardScheduleModal: React.FC<DashboardScheduleModalProps> = ({
  modalOpen,
  setModalOpen,
  targetLead,
  tacList,
  selectedTac,
  setSelectedTac,
  selectedBranch,
  setSelectedBranch,
  date,
  setDate,
  todayStr,
  slotsLoading,
  slots,
  selectedSlot,
  setSelectedSlot,
  handleBookSlot,
  bookingLoading,
  schedulePhase,
  branches,
  method,
  setMethod,
  rescheduleReason,
  setRescheduleReason,
}) => {
  const theme = useTheme();
  const headerGradient = `linear-gradient(270deg, var(--mui-palette-primary-main), ${lighten(
    theme.palette.primary.main,
    0.5
  )} 100%)`;

  const [profileTac, setProfileTac] = useState<any | null>(null);
  const [loadingTacProfile, setLoadingTacProfile] = useState<boolean>(false);
 
  const [localReason, setLocalReason] = useState<string>("");

  const currentReason = rescheduleReason !== undefined ? rescheduleReason : localReason;
  const handleReasonChange = setRescheduleReason || setLocalReason;

   
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    const existingResume =
      (targetLead as any)?.resume?.path ||
      (targetLead as any)?.resume ||
      (targetLead as any)?.resumeUrl ||
      null;
    if (existingResume && typeof existingResume === "string") {
      setPreviewUrl(existingResume);
    } else {
      setPreviewUrl(null);
      setResumeFile(null);
    }
  }, [targetLead, modalOpen]);

  const isPdf =
    previewUrl?.toLowerCase().includes(".pdf") ||
    resumeFile?.type === "application/pdf";

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setResumeFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const selectedTacId =
    typeof selectedTac === "string"
      ? selectedTac
      : (selectedTac as any)?._id || "";

  const activeTacObj = tacList.find((tac) => tac._id === selectedTacId);

  const isReschedule = targetLead?.status?.startsWith("pre_");
  const showResumeSection =
    !isReschedule ||
    targetLead?.status === "pre_assigned" ||
    targetLead?.status === "assigned";

  const handleOpenTacProfile = async () => {
    if (!selectedTacId) return;

    if ((activeTacObj as any)?.tacProfile && (activeTacObj as any)?.bio) {
      setProfileTac(activeTacObj);
      return;
    }

    setLoadingTacProfile(true);
    try {
      const payload = {
        page: 1,
        limit: 50,
        search: "",
        mode: (method as any) || "offline",
        branchId: selectedBranch,
      };

      const res = await getTacsListAction(payload);
      const fullTacList = res?.data?.data?.tacList || [];

      const matchedTac = fullTacList.find(
        (t: any) => t._id?.toString() === selectedTacId?.toString()
      );

      if (matchedTac) {
        setProfileTac(matchedTac);
      } else {
        setProfileTac(activeTacObj);
      }
    } catch (error) {
      console.error("Failed to fetch full TAC profile:", error);
      toast.error("Failed to load TAC details");
      setProfileTac(activeTacObj);
    } finally {
      setLoadingTacProfile(false);
    }
  };

  return (
    <>
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: "rounded-xl overflow-hidden p-0" }}
      >
        <DialogTitle
          className="font-bold text-[20px] text-white px-6 py-4"
          style={{ background: headerGradient }}
        >
          {schedulePhase === "assess"
            ? "Schedule / Reschedule Assessment"
            : targetLead?.status?.startsWith("pre_")
            ? "Reschedule Pre-Counselling"
            : "Schedule Pre-Counselling"}
        </DialogTitle>

        <DialogContent className="flex flex-col gap-5 p-6 pt-5">
          {/* Candidate Info */}
          <Box className="mb-1">
            <Typography variant="body2" className="text-gray-500">
              Candidate
            </Typography>
            <Typography className="font-bold text-[16px]">
              {targetLead?.name} ({targetLead?.inqNo})
            </Typography>
          </Box>

          
          <Box className="flex flex-col sm:flex-row gap-4 items-center w-full">
            <FormControl fullWidth size="medium" className="flex-1">
              <InputLabel>Select Branch</InputLabel>
              <Select
                value={selectedBranch || ""}
                onChange={(e) => setSelectedBranch(e.target.value as string)}
                label="Select Branch"
              >
                {branches.map((br) => (
                  <MenuItem key={br._id} value={br._id}>
                    {br.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="medium" className="flex-1">
              <InputLabel>Select Method</InputLabel>
              <Select
                value={method || ""}
                onChange={(e) => setMethod(e.target.value as string)}
                label="Select Method"
              >
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Row 2: Select Assigning TAC & Profile Skeleton */}
          <Box className="flex flex-col sm:flex-row gap-4 items-center w-full">
            <FormControl size="medium" className={`w-full ${selectedTacId ? "flex-1 sm:w-1/2" : "w-full"}`}>
              <InputLabel>Select Assigning TAC</InputLabel>
              <Select
                value={selectedTacId}
                onChange={(e) => setSelectedTac(e.target.value as string)}
                label="Select Assigning TAC"
              >
                {tacList.length === 0 && (
                  <MenuItem disabled>No TAC available in this branch</MenuItem>
                )}
                {tacList.map((tac) => (
                  <MenuItem key={tac._id} value={tac._id}>
                    {tac.firstName} {tac.lastName}{" "}
                    {tac.counterNo ? `(Counter: ${tac.counterNo})` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedTacId && (
              activeTacObj ? (
                <Box className="flex-1 w-full sm:w-1/2 rounded-xl p-2 flex items-center gap-3 shadow-xl bg-[var(--mui-palette-background-paper)] h-[56px] transition-all">
                  <Avatar
                    src={getAvatarUrl(activeTacObj.profilePic)}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "var(--mui-palette-primary-main)",
                      fontWeight: "bold",
                    }}
                  >
                    {activeTacObj.firstName?.charAt(0)}
                  </Avatar>
                  <Box className="flex-1 min-w-0">
                    <Typography
                      variant="subtitle2"
                      noWrap
                      className="font-bold leading-tight"
                    >
                      {activeTacObj.firstName} {activeTacObj.lastName}
                    </Typography>
                    <Typography
                      variant="caption"
                      noWrap
                      className="text-[var(--mui-palette-text-secondary)]"
                    >
                      {(activeTacObj as any).tacProfile?.designation ||
                        "TAC Consultant"}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    disabled={loadingTacProfile}
                    onClick={handleOpenTacProfile}
                    className="border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-default)] hover:text-[var(--mui-palette-primary-main)] hover:border-[var(--mui-palette-primary-main)] transition-colors"
                  >
                    {loadingTacProfile ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <i className="ri-external-link-line text-[16px]" />
                    )}
                  </IconButton>
                </Box>
              ) : (
                <Box className="flex-1 w-full sm:w-1/2 border border-dashed border-[var(--mui-palette-divider)] rounded-xl p-2 flex items-center gap-3 bg-[var(--mui-palette-background-default)] opacity-60 h-[56px]">
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box className="flex-1">
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                  <Skeleton variant="rounded" width={32} height={32} />
                </Box>
              )
            )}
          </Box>

          {/* Row 3: Select Date */}
          <TextField
            fullWidth
            type="date"
            label="Select Date"
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: todayStr }}
            value={date || ""}
            onChange={(e) => setDate(e.target.value)}
            size="medium"
          />

          {/* ⚡ Reschedule Reason Field (Visible when Rescheduling) */}
          {isReschedule && (
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Reason for Rescheduling"
              placeholder="Enter reason for rescheduling..."
              value={currentReason}
              onChange={(e) => handleReasonChange(e.target.value)}
              size="medium"
            />
          )}

          {/* Available Slots Section */}
          {selectedTacId && (
            <Box>
              <Typography variant="subtitle2" className="mb-3 font-bold">
                Available Time Slots
              </Typography>
              <Box className="flex flex-wrap gap-3">
                {slotsLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <Skeleton
                      key={idx}
                      variant="rounded"
                      width={120}
                      height={36}
                      className="rounded-[20px]"
                    />
                  ))
                ) : slots.length === 0 ? (
                  <Typography className="text-[var(--mui-palette-text-primary)] text-sm">
                    No slots available for this date.
                  </Typography>
                ) : (
                  slots.map((slot, index) => (
                    <Button
                      key={index}
                      disabled={!slot.available}
                      variant={
                        selectedSlot?.time === slot.time
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => slot.available && setSelectedSlot(slot)}
                      className={`normal-case rounded-[20px] px-6 ${
                        selectedSlot?.time === slot.time
                          ? "bg-primary border-primary text-white"
                          : slot.available
                          ? "bg-transparent border-[#e0e0e0] hover:border-primary text-inherit"
                          : "bg-[#f5f5f5] border-[#e0e0e0]"
                      } disabled:text-[#bdbdbd] disabled:border-[#e0e0e0]`}
                    >
                      {slot.time}
                    </Button>
                  ))
                )}
              </Box>
            </Box>
          )}

          {/* Resume Upload & Preview Section */}
          {showResumeSection && (
            <Grid container spacing={2} className="pt-2">
              <Grid size={{ xs: 12, md: previewUrl ? 6 : 12 }}>
                <Typography className="text-xs font-semibold text-[var(--mui-palette-text-primary)] mb-2">
                  Upload Resume
                </Typography>
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all h-[180px] ${
                    isDragging
                      ? "border-[var(--mui-palette-primary-main)] bg-[var(--mui-palette-primary-lightOpacity)]"
                      : "border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-default)] hover:bg-[var(--mui-palette-action-hover)] hover:border-[var(--mui-palette-primary-main)]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    hidden
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={onFileInputChange}
                  />
                  <Box className="w-12 h-12 rounded-2xl bg-[var(--mui-palette-primary-lightOpacity)] flex items-center justify-center text-[var(--mui-palette-primary-main)] mb-3">
                    <i className="ri-upload-cloud-2-line text-2xl" />
                  </Box>
                  <Typography className="font-bold text-sm text-[var(--mui-palette-text-primary)]">
                    Drag & Drop Resume
                  </Typography>
                  <Typography className="text-xs text-[var(--mui-palette-text-secondary)] mt-1">
                    PDF, JPG, JPEG, PNG
                  </Typography>
                </Box>
              </Grid>

              {previewUrl && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography className="text-xs font-semibold text-[var(--mui-palette-text-primary)] mb-2">
                    Resume Preview
                  </Typography>
                  <Box
                    onClick={() => setIsPreviewOpen(true)}
                    className="border border-[var(--mui-palette-divider)] rounded-2xl h-[180px] bg-[var(--mui-palette-background-default)] overflow-hidden relative cursor-pointer group hover:border-[var(--mui-palette-primary-main)] transition-all shadow-sm"
                  >
                    {isPdf ? (
                      <Box className="w-full h-full pointer-events-none relative">
                        <iframe
                          src={previewUrl}
                          className="w-full h-full border-0"
                        />
                        <Box className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Box className="bg-[var(--mui-palette-background-paper)] text-[var(--mui-palette-primary-main)] px-3.5 py-2 rounded-xl shadow-md font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                            <i className="ri-eye-line text-sm" />
                            View Document
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box className="w-full h-full flex items-center justify-center bg-[var(--mui-palette-background-paper)] relative">
                        <img
                          src={previewUrl}
                          alt="Resume Preview"
                          className="w-full h-full object-contain"
                        />
                        <Box className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Box className="bg-[var(--mui-palette-background-paper)] text-[var(--mui-palette-primary-main)] px-3.5 py-2 rounded-xl shadow-md font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                            <i className="ri-eye-line text-sm" />
                            View Image
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions className="px-6 pb-5">
          <Button
            onClick={() => setModalOpen(false)}
            className="text-[var(--mui-palette-text-secondary)] font-semibold normal-case"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!selectedSlot || !selectedTacId || bookingLoading}
            onClick={() => handleBookSlot(currentReason)} // ⚡ Pass reason on confirm
            className="bg-[var(--mui-palette-primary-main)] rounded-lg px-6 normal-case shadow-md"
          >
            {bookingLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Confirm & Book"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className:
            "rounded-3xl relative overflow-hidden bg-[var(--mui-palette-background-paper)]",
        }}
      >
        <Box className="flex items-center justify-between px-6 py-4 border-b border-[var(--mui-palette-divider)]">
          <Typography
            variant="subtitle1"
            className="font-bold text-[var(--mui-palette-text-primary)]"
          >
            Resume Preview
          </Typography>
          <Box className="flex items-center gap-2">
            {previewUrl && (
              <a
                href={previewUrl}
                download="Resume"
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  size="small"
                  variant="outlined"
                  className="rounded-xl normal-case font-semibold text-xs"
                  startIcon={<i className="ri-download-2-line" />}
                >
                  Download
                </Button>
              </a>
            )}
            <IconButton
              size="small"
              onClick={() => setIsPreviewOpen(false)}
              className="text-[var(--mui-palette-text-secondary)]"
            >
              <i className="ri-close-line text-xl" />
            </IconButton>
          </Box>
        </Box>
        <DialogContent className="p-0 bg-[var(--mui-palette-background-default)] flex items-center justify-center min-h-[60vh]">
          {previewUrl && isPdf ? (
            <iframe
              src={previewUrl}
              title="Resume PDF Preview"
              className="w-full min-h-[75vh] border-0"
            />
          ) : (
            previewUrl && (
              <img
                src={previewUrl}
                alt="Resume Image Preview"
                className="max-w-full max-h-[75vh] object-contain p-4"
              />
            )
          )}
        </DialogContent>
      </Dialog>

      <TacProfileDialog
        open={Boolean(profileTac)}
        tac={profileTac}
        onClose={() => setProfileTac(null)}
      />
    </>
  );
};

export default DashboardScheduleModal;