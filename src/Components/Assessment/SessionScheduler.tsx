"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { Slot } from "@/Types/Frontend_Payload/assessment.types";
import Link from "next/link";

interface SessionSchedulerProps {
  visitMethod: "on" | "off";
  setVisitMethod: (val: "on" | "off") => void;
  date: string;
  setDate: (val: string) => void;
  todayStr: string;
  loadingSlots: boolean;
  slots: Slot[];
  selectedSlot: Slot | null;
  setSelectedSlot: (val: Slot | null) => void;
}

export const SessionScheduler: React.FC<SessionSchedulerProps> = ({
  visitMethod,
  setVisitMethod,
  date,
  setDate,
  todayStr,
  loadingSlots,
  slots,
  selectedSlot,
  setSelectedSlot,
}) => {
  return (
    <Card className="rounded-[15px] border border-[#e0e0e0] shadow-none">
      <CardContent className="p-6">
        <Typography variant="h5" fontWeight="bold" className="mb-4">
          Your Scheduled Session
        </Typography>

        <Typography variant="subtitle2" className="mb-2 font-bold">
          Select Visit Method
        </Typography>
        <Box className="flex flex-wrap gap-4 mb-8">
          <Button
            variant={visitMethod === "on" ? "contained" : "outlined"}
            onClick={() => setVisitMethod("on")}
            className={`rounded-xl px-6 normal-case ${visitMethod === "on" ? "bg-[#1976d2] text-white shadow-md" : "border-[#ccc] text-[var(--mui-palette-text-primary)]"}`}
          >
            <i className="ri-vidicon-line mr-2 text-lg"></i> Online (Video Call)
          </Button>
          <Button
            variant={visitMethod === "off" ? "contained" : "outlined"}
            onClick={() => setVisitMethod("off")}
            className={`rounded-xl px-6 normal-case ${visitMethod === "off" ? "bg-[#1976d2] text-white shadow-md" : "border-[#ccc] text-[var(--mui-palette-text-primary)]"}`}
          >
            <i className="ri-building-4-line mr-2 text-lg"></i> Branch Visit
            (On-Site)
          </Button>
        </Box>

        <Typography variant="subtitle2" className="mb-2 font-bold">
          Assessment Date
        </Typography>
        <TextField
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          inputProps={{ min: todayStr }}
          className="w-full max-w-[300px] mb-10"
        />

        <Typography variant="subtitle2" className="mb-2 font-bold">
          Available Time Slots
        </Typography>
        {loadingSlots ? (
          <Box className="flex py-4 mb-4">
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box className="flex flex-wrap gap-1.5 mb-4">
            {slots.length === 0 ? (
              <Typography className="text-gray-500 py-2">
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
                  className={`normal-case rounded-[20px] px-6 ${selectedSlot?.time === slot.time ? "bg-primary border-primary text-white" : slot.available ? "bg-transparent border-[#e0e0e0] hover:border-primary text-inherit" : "bg-[#f5f5f5] border-[#e0e0e0]"} disabled:text-[#bdbdbd] disabled:border-[#e0e0e0]`}
                >
                  {slot.time || `${slot.from} - ${slot.to}`}
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
            Please ensure you have reviewed the assessment materials before your
            session. Ensure you are ready to attend at your scheduled
            time. Consultant will contact you via your <Link href="/profile?tab=notifications" className="underline">
              preferred communication method
            </Link>.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
