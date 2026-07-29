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
        className="mb-6 p-4 md:p-5 bg-white dark:bg-[var(--mui-palette-background-paper)] rounded-2xl dark:border-gray-800 shadow-sm"
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
                  sx={{
                    borderRadius: 3,
                    p: 2,
                    bgcolor: alpha(slot?.status === 'completed' ? theme.palette.success.main : slot?.status === 'assigned' ? theme.palette.primary.main : theme.palette.warning.main, 0.10),
                    border: `1px solid ${theme.palette.divider}`,
                    minHeight: 80,
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography
                      className="text-sm font-semibold"
                      sx={{ color: theme.palette.primary.main }}
                    >
                      {slot.schedule.from}
                    </Typography>

                    <Typography className="text-sm font-medium text-gray-700">
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
      {/* <Card elevation={0} className="mb-6 p-4 md:p-5 bg-white dark:bg-[var(--mui-palette-background-paper)] rounded-2xl  dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
              {slots.map((slot: any, i) => (
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
                    {slot.schedule.from}
                  </Typography>
                  <Typography className="text-sm font-medium text-gray-700">
                    {slot?.leadId?.fullName}
                  </Typography>
                  <Typography className="text-xs text-gray-400" sx={{ mt: 0.5 }}>
                    {CamelCase(slot.phase)} &middot; {slot.schedule.method == "on" ? "Online" : "Offline"}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card> */}

      {/* <Box className="mb-6 p-4 md:p-5 bg-white dark:bg-[var(--mui-palette-background-paper)] rounded-2xl  dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <Box className="flex items-center gap-4">
          <Avatar
            src={resolveFileSrc(lastCandidate.profilePic as any)}
            sx={{
              width: 48,
              height: 48,
              border: "2px solid #e2e8f0",
              cursor: "pointer",
            }}
            className="hover:scale-105 transition-transform shadow-sm"
            onClick={() =>
              setPreviewImage(resolveFileSrc(lastCandidate.profilePic as any))
            }
          />
          <Box>
            <Typography
              className="text-[14px] text-[var(--mui-palette-secondary)]
    font-medium tracking-wider "
            >
              Last Candidate Detail
            </Typography>
            <Typography
              variant="h6"
              className="font-bold mt-1 text-[var(--mui-palette-text-secondary)] text-base"
            >
              {lastCandidate.name}{" "}
              <span className="text-xs ml-1 font-normal text-gray-500">
                ({lastCandidate.inqNo})
              </span>
            </Typography>
            {isFoe && lastCandidate.assignedTacName && (
              <Typography className="text-xs text-gray-500 font-medium mt-0.5">
                Assigned TAC:{" "}
                <span className="text-blue-600 font-semibold">
                  {lastCandidate.assignedTacName}
                </span>
              </Typography>
            )}
          </Box>
        </Box>

        <Box className="flex items-center gap-3 flex-wrap">
          <Box className="flex flex-col">
            <Typography className="text-[10px]  text-gray-400 font-semibold">
              Latest Visit Type
            </Typography>
            <Chip
              label={
                lastCandidate.visitType === "online" ||
                  lastCandidate.visitType === "on"
                  ? "🌐 Online"
                  : "🏢 In-Person"
              }
              size="small"
              className={`font-bold mt-2 text-xs ${lastCandidate.visitType === "online" ||
                lastCandidate.visitType === "on"
                ? " !text-[var(--mui-palette-primary-main)]"
                : "!bg-purple-100 !text-purple-700"
                }`}
            />
          </Box>

          <Box className="flex flex-col">
            <Typography className="text-[10px] text-gray-400 font-semibold">
              Current Status
            </Typography>
            <Chip
              label={CamelCase(lastCandidate.status)}
              size="small"
              variant="outlined"
              color="primary"
              className="font-medium mt-2  text-xs"
            />
          </Box>

          <Button
            variant="contained"
            size="small"
            onClick={() =>
              router.push(`/dashboard/candidate/${lastCandidate._id}`)
            }
            className="rounded-xl text-xs mt-5 normal-case font-semibold px-4 py-1.5 shadow-none"
          >
            View Profile
          </Button>
        </Box>
      </Box> */}
    </>
  );
};

export default TodaysSchedule;