"use client";

import React from "react";
import {
  Box, Card, CardContent, Stack, Typography, alpha,
  IconButton,
} from "@mui/material";
import { CamelCase } from "@/Utils/common";
import { useTodaySchedule } from "./useTodaySchedule";
import { todaySchedule } from "@/Types/ApiResponse/tacResponse.types";

interface TodaysScheduleProps {
  slots: todaySchedule[];
}

const TodaysSchedule: React.FC<TodaysScheduleProps> = ({ slots }) => {
  const { visibleCards, theme, handlePrev, handleNext, startIndex } = useTodaySchedule({ slots });
  return (
    <>
      <Card
        elevation={0}
        className="mb-6 p-4 md:p-5 bg-[var(--mui-palette-background-paper)] dark:bg-[var(--mui-palette-background-paper)] rounded-2xl dark:border-gray-800 shadow-sm"
      >
        <CardContent className="p-5">
          <Box className="flex items-center justify-between mb-5">
            <Box>
              <Typography className="text-[16px] font-semibold">
                Today's Schedule
              </Typography>

              <Typography className="text-sm text-gray-400">
                Upcoming pre-counselling and assessment slots
              </Typography>
            </Box>

            {slots.length > 4 && (
              <Box className="flex gap-1">
                <IconButton
                  size="small"
                  onClick={handlePrev}
                  disabled={startIndex === 0}
                >
                  <i className="ri-arrow-left-s-line text-xl" />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={handleNext}
                  disabled={startIndex + 4 >= slots.length}
                >
                  <i className="ri-arrow-right-s-line text-xl" />
                </IconButton>
              </Box>
            )}
          </Box>

          {slots.length === 0 ? (
            <Typography className="text-sm text-gray-400">
              No sessions scheduled for today.
            </Typography>
          ) : (
            <Box className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-4 gap-4">
              {visibleCards.map((slot: any, i) => (
                <Box
                  key={i}
               className={`rounded-xl p-4 shadow-2xl border-[var(--mui-palette-divider)] min-h-[80px] ${
  slot?.status === 'completed'
    ? 'bg-[var(--mui-palette-success-main)]/10'
    : slot?.status === 'assigned'
    ? 'bg-[var(--mui-palette-primary-main)]/10'
    : 'bg-[var(--mui-palette-warning-main)]/10'
}`}
                >
                  <Stack spacing={0.5}>
                    <Typography
                      className="text-sm font-semibold"
                      sx={{ color: theme.palette.primary.main }}
                    >
                      {slot.schedule.from}
                    </Typography>

                    <Typography className="text-sm font-medium text-[var(--mui-palette-primary)]
">
                      {slot.leadId?.fullName}
                    </Typography>

                    <Typography className="text-xs text-gray-400">
                      {CamelCase(slot.phase)} &middot;{" "}
                      {slot.schedule.method === "on" ? "Online" : "Offline"}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
      
    </>
  );
};

export default TodaysSchedule;