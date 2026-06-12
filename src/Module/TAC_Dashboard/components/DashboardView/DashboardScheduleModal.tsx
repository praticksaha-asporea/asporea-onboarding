import React from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Typography
} from "@mui/material";

interface DashboardScheduleModalProps {
  modalOpen: boolean;
  setModalOpen: (val: boolean) => void;
  targetLead: any;
  tacList: any[];
  selectedTac: string;
  setSelectedTac: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  todayStr: string;
  slotsLoading: boolean;
  slots: any[];
  selectedSlot: any;
  setSelectedSlot: (val: any) => void;
  handleBookSlot: () => void;
  bookingLoading: boolean;
}

const DashboardScheduleModal: React.FC<DashboardScheduleModalProps> = ({
  modalOpen, setModalOpen, targetLead, tacList, selectedTac, setSelectedTac,
  date, setDate, todayStr, slotsLoading, slots, selectedSlot, setSelectedSlot,
  handleBookSlot, bookingLoading
}) => {
  return (
    <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ className: "rounded-xl p-2" }}>
      <DialogTitle className="font-bold text-[20px]">
        {targetLead?.status === "pre_not_responded" ? "Reschedule Pre-Counselling" : "Schedule Pre-Counselling"}
      </DialogTitle>
      <DialogContent className="flex flex-col gap-5 pt-4">
        <Box className="mb-2">
          <Typography variant="body2" className="text-gray-500">Candidate</Typography>
          <Typography className="font-bold">{targetLead?.name} ({targetLead?.inqNo})</Typography>
        </Box>

        <FormControl fullWidth size="small">
          <InputLabel>Select Assigning TAC</InputLabel>
          <Select value={selectedTac} onChange={(e) => setSelectedTac(e.target.value as string)} label="Select Assigning TAC">
            {tacList.length === 0 && <MenuItem disabled>No TAC available in this branch</MenuItem>}
            {tacList.map((tac) => (
              <MenuItem key={tac._id} value={tac._id}>
                {tac.firstName} {tac.lastName} {tac.counterNo ? `(Counter: ${tac.counterNo})` : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth type="date" size="small" label="Select Date"
          InputLabelProps={{ shrink: true }} inputProps={{ min: todayStr }}
          value={date} onChange={(e) => setDate(e.target.value)}
        />

        {selectedTac && (
          <Box>
            <Typography variant="subtitle2" className="mb-3 font-bold">Available Time Slots</Typography>
            <Box className="flex flex-wrap gap-4">
              {slotsLoading ? (
                <Typography className="mb-4 text-[var(--mui-palette-text-primary)] text-sm">Loading slots...</Typography>
              ) : slots.length === 0 ? (
                <Typography className="text-[var(--mui-palette-text-primary)] text-sm">No slots available for this date.</Typography>
              ) : (
                slots.map((slot, index) => (
                  <Button
                    key={index} disabled={!slot.available}
                    variant={selectedSlot?.time === slot.time ? "contained" : "outlined"}
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
        <Button onClick={() => setModalOpen(false)} className="text-white mt-8 bg-[var(--mui-palette-primary-main)] normal-case">Cancel</Button>
        <Button
          variant="contained" disabled={!selectedSlot || !selectedTac || bookingLoading}
          onClick={handleBookSlot} className="bg-[var(--mui-palette-primary-main)] rounded-lg px-6 mt-8 normal-case shadow-md"
        >
          {bookingLoading ? <CircularProgress size={20} color="inherit" /> : "Confirm & Book"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardScheduleModal;