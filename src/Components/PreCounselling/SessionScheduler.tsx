"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {
  ExistingBooking,
} from "@/Types/Frontend_Payload/precounselling.types";
import { Slot } from "@/Types/Frontend_Payload/assessment.types";

interface SessionSchedulerProps {
  date: string;
  setDate: (val: string) => void;
  todayStr: string;
  slots: Slot[];
  selectedSlot: Slot | null;
  setSelectedSlot: (val: Slot | null) => void;
  loadingSlots: boolean;
  existingBooking: ExistingBooking | null;
}

export const SessionScheduler: React.FC<SessionSchedulerProps> = ({
  date,
  setDate,
  todayStr,
  slots,
  selectedSlot,
  setSelectedSlot,
  loadingSlots,
  existingBooking,
}) => {
  return (
    <Card className="rounded-[15px] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <CardContent className="p-6">
        <Typography variant="h5" fontWeight="bold" className="mb-4">
          Your Scheduled Session
        </Typography>

        <Typography variant="subtitle2" className="mb-2 font-bold">
          Counselling Date
        </Typography>
        <TextField
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          inputProps={{ min: todayStr }}
          disabled={!!existingBooking}
          className="w-full max-w-[300px] mb-10"
        />

        <Typography variant="subtitle2" className="mb-2 font-bold">
          Available Time Slots
        </Typography>

        {existingBooking ? (
          <Box className="flex flex-wrap gap-1.5 mb-4">
            <Button
              variant="contained"
              disabled
              className="bg-[var(--mui-palette-primary-main)] text-white normal-case rounded-[20px] px-6 !opacity-100"
            >
              {existingBooking.schedule?.from} - {existingBooking.schedule?.to}
            </Button>
          </Box>
        ) : loadingSlots ? (
          <Typography className="mb-4 text-gray-500">
            Loading slots...
          </Typography>
        ) : (
          <Box className="flex flex-wrap gap-1.5 mb-4">
            {slots.length === 0 ? (
              <Typography className="text-gray-500">
                No slots available for this date.
              </Typography>
            ) : (
              slots.map((slot, index) => (
                <Button
                  key={index}
                  disabled={!slot.available}
                  variant={
                    selectedSlot?.time === slot.time ? "contained" : "outlined"
                  }
                  onClick={() => slot.available && setSelectedSlot(slot)}
                  className={`normal-case rounded-[20px] px-6 ${selectedSlot?.time === slot.time
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
        )}

        <Box className="flex flex-wrap gap-6 mb-6 mt-4">
          <Box className="flex items-center gap-2">
            <Box className="w-4 h-4 rounded-[4px] bg-[#1976d2]" />
            <Typography variant="body2">Selected</Typography>
          </Box>
          <Box className="flex items-center gap-2">
            <Box className="w-4 h-4 rounded-[4px] border border-[#ccc] bg-[--var-primary]" />
            <Typography variant="body2">Available</Typography>
          </Box>
          <Box className="flex items-center gap-2">
            <Box className="w-4 h-4 rounded-[4px] bg-[--mui-palette-action-disabledBackground] border border-[#e0e0e0]" />
            <Typography variant="body2">Unavailable</Typography>
          </Box>
        </Box>

        <Box className="mt-8 p-4 rounded-[10px] border-l-4 border-l-[#1976d2] bg-[var(--variant-outlinedBg)]">
          <Typography variant="body2">
            Please ensure you have reviewed the pre-counselling materials before
            your session. Ensure you are ready at your scheduled time. Your TAC
            will contact you via your preferred communication method.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
