"use client";

import React from "react";
import { Box, Card, CardContent, Stack, Typography, alpha, useTheme } from "@mui/material";

export interface ScheduleSlot {
  time: string;
  candidate: string;
  type: string; // e.g. "Pre-Counselling" | "Assessment"
  mode: string; // e.g. "In-Person" | "Online"
}

interface TodaysScheduleProps {
  slots: ScheduleSlot[];
}

// TODO: replace with API data (GET /tac/dashboard/today-schedule)
const defaultSlots: ScheduleSlot[] = [
  { time: "10:00 AM", candidate: "Galvin Burton", type: "Pre-Counselling", mode: "In-Person" },
  { time: "02:00 PM", candidate: "Constance Reese", type: "Pre-Counselling", mode: "Online" },
  { time: "04:00 PM", candidate: "Hilda Reed", type: "Assessment", mode: "Online" },
];

const TodaysSchedule: React.FC<TodaysScheduleProps> = ({ slots = defaultSlots }) => {
  const theme = useTheme();

  return (
    <Card elevation={0} className="rounded-2xl border border-gray-100 shadow-md">
      <CardContent className="p-5">
        <Typography className="text-[16px] font-semibold mb-1">Today's Schedule</Typography>
        <Typography className="text-sm text-gray-400 mb-5">
          Upcoming pre-counselling and assessment slots
        </Typography>

        {slots.length === 0 ? (
          <Typography className="text-sm text-gray-400">No sessions scheduled for today.</Typography>
        ) : (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ overflowX: "auto", pb: 0.5 }}
          >
            {slots.map((slot, i) => (
              <Box
                key={i}
                sx={{
                  minWidth: { sm: 220 },
                  flexShrink: 0,
                  borderRadius: 3,
                  p: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography
                  className="text-xs font-semibold"
                  sx={{ color: theme.palette.primary.main, mb: 1 }}
                >
                  {slot.time}
                </Typography>
                <Typography className="text-sm font-medium text-gray-700">
                  {slot.candidate}
                </Typography>
                <Typography className="text-xs text-gray-400" sx={{ mt: 0.5 }}>
                  {slot.type} &middot; {slot.mode}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysSchedule;