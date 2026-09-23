import React, { useState } from "react";
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
  handleBookSlot: () => void;
  bookingLoading: boolean;
  schedulePhase: "pre" | "assess";
  branches: branchDB[];
  selectedBranch: string;
  setSelectedBranch: (val: string) => void;
  method: string;
  setMethod: (val: string) => void;
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
}) => {
  const [profileTac, setProfileTac] = useState<any | null>(null);
  const [loadingTacProfile, setLoadingTacProfile] = useState<boolean>(false);

  const selectedTacId =
    typeof selectedTac === "string"
      ? selectedTac
      : (selectedTac as any)?._id || "";

  const activeTacObj = tacList.find((tac) => tac._id === selectedTacId);

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
        (t: any) => t._id?.toString() === selectedTacId?.toString(),
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
        PaperProps={{ className: "rounded-xl p-2" }}
      >
        <DialogTitle className="font-bold text-[20px]">
          {schedulePhase === "assess"
            ? "Schedule / Reschedule Assessment"
            : targetLead?.status === "pre_not_responded"
              ? "Reschedule Pre-Counselling"
              : "Schedule Pre-Counselling"}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-5 pt-4">
          <Box className="mb-2">
            <Typography variant="body2" className="text-gray-500">
              Candidate
            </Typography>
            <Typography className="font-bold">
              {targetLead?.name} ({targetLead?.inqNo})
            </Typography>
          </Box>

          <FormControl fullWidth size="medium">
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

          <FormControl fullWidth size="medium">
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

          {/* TAC Dropdown + Mini Card Section */}
          <Box className="flex flex-col sm:flex-row gap-4 items-start w-full">
            <FormControl size="medium" className="flex-1 w-full">
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

            {/* Selected TAC Mini Profile Card */}
            {activeTacObj ? (
              <Box className="w-full sm:w-[260px] shrink-0  rounded-xl p-2.5 flex items-center gap-3 shadow-xl bg-[var(--mui-palette-background-paper)] transition-all">
                <Avatar
                  src={getAvatarUrl(activeTacObj.profilePic)}
                  sx={{
                    width: 44,
                    height: 44,
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

                {/* Profile View Trigger Button */}
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
              <Box className="w-full sm:w-[260px] shrink-0 border border-dashed border-[var(--mui-palette-divider)] rounded-xl p-2.5 flex items-center gap-3 bg-[var(--mui-palette-background-default)] opacity-60">
                <Skeleton variant="circular" width={44} height={44} />
                <Box className="flex-1">
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
                <Skeleton variant="rounded" width={32} height={32} />
              </Box>
            )}
          </Box>

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

          {selectedTacId && (
            <Box>
              <Typography variant="subtitle2" className="mb-3 font-bold">
                Available Time Slots
              </Typography>
              <Box className="flex flex-wrap gap-4">
                {slotsLoading ? (
                  <Typography className="mb-4 text-[var(--mui-palette-text-primary)] text-sm">
                    Loading slots...
                  </Typography>
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
        </DialogContent>
        <DialogActions className="px-5">
          <Button
            onClick={() => setModalOpen(false)}
            className="text-[var(--mui-palette-text-secondary)] font-semibold mt-8 normal-case"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!selectedSlot || !selectedTacId || bookingLoading}
            onClick={handleBookSlot}
            className="bg-[var(--mui-palette-primary-main)] rounded-lg px-6 mt-8 normal-case shadow-md"
          >
            {bookingLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Confirm & Book"
            )}
          </Button>
        </DialogActions>
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
