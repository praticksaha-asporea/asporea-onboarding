"use client";

import React, { useState, useMemo } from "react";
import { Box, Typography, Button, IconButton, Avatar } from "@mui/material";
import type { Mode } from "@core/types";
import { useSchedules, ScheduleMeeting } from "./useSchedules";

const ChevronLeftIcon = () => <i className="ri-arrow-left-s-line text-lg" />;
const ChevronRightIcon = () => <i className="ri-arrow-right-s-line text-lg" />;
const VideocamOutlinedIcon = () => <i className="ri-video-download-line text-lg" />;
const CalendarCheckIcon = () => <i className="ri-calendar-check-line text-3xl" />;

const resolveFileSrc = (path?: string) => {
  if (!path || path.trim() === "") return "/images/avatars/avatar.png";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:3000";
  return `${BACKEND_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};

const LiveEventCard = ({
  meeting,
  status,
}: {
  meeting: ScheduleMeeting | null;
  status: "LIVE" | "ENDED" | "UPCOMING";
}) => {
  if (!meeting) {
    return (
      <Box className="flex flex-col p-5 rounded-[24px] bg-[var(--mui-palette-secondary)] shadow-2xl w-full justify-center items-center min-h-[220px]">
        <Box className="w-10 h-10 rounded-full text-[var(--mui-palette-primary-main)] flex items-center justify-center mb-2">
          <CalendarCheckIcon />
        </Box>
        <Typography variant="subtitle2" fontWeight="500" className="text-[var(--mui-palette-primary-main)] tracking-wide mb-1 text-center">
          No Active Session
        </Typography>
        <Typography variant="caption" color="text.secondary" className="text-center px-2 leading-relaxed">
          Select an appointment from the list to view details.
        </Typography>
      </Box>
    );
  }

  const avatarSrc = resolveFileSrc(meeting.profilePic);

  return (
    <Box className="flex flex-col p-5 rounded-[24px] bg-[var(--mui-palette-secondary)] shadow-2xl w-full">
      {/* Header */}
      <Box className="flex justify-between items-start mb-3 gap-2">
        <Box className="flex items-center gap-2.5 min-w-0">
          <Avatar
            src={avatarSrc}
            sx={{ width: 40, height: 40 }}
            className="font-bold text-sm shadow-sm shrink-0"
          >
            {!avatarSrc && meeting.candidateName.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box className="min-w-0">
            <Typography variant="caption" className="text-[var(--mui-palette-primary-main)] font-semibold block truncate text-[11px]">
              {meeting.inqNo}
            </Typography>
            <Typography variant="subtitle2" fontWeight="600" className="text-[var(--mui-palette-text-secondary)] tracking-wide truncate text-xs sm:text-sm">
              {meeting.candidateName}
            </Typography>
          </Box>
        </Box>
        
        {status === "LIVE" && (
          <Box className="flex items-center gap-1 px-2 py-0.5 animate-blink rounded-full text-[11px] font-medium tracking-wider text-[var(--mui-palette-success-main)] shrink-0">
            <Box className="w-2 h-2 rounded-full bg-[var(--mui-palette-success-main)]" />
            Live Now
          </Box>
        )}

        {status === "ENDED" && (
          <Box className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-[var(--mui-palette-error-main)] shrink-0">
            <Box className="w-2 h-2 rounded-full bg-[var(--mui-palette-error-main)]" />
            Ended
          </Box>
        )}

        {status === "UPCOMING" && (
          <Box className="flex items-center gap-1 px-2 py-0.5 animate-blink rounded-full text-[11px] font-medium text-[var(--mui-palette-warning-main)] shrink-0">
            <Box className="w-1.5 h-1.5 rounded-full bg-[var(--mui-palette-warning-main)]" />
            Upcoming
          </Box>
        )}
      </Box>

      {/* Phase & Timing */}
      <Box className="my-2">
        <Typography variant="caption" className="text-[var(--mui-palette-text-secondary)] font-medium text-[11px]">
          {meeting.phase} Session
        </Typography>
        <Box className="flex items-center gap-2 mt-1">
          <Typography variant="subtitle1" fontWeight="600" className="text-[var(--mui-palette-success-main)] text-sm sm:text-base">
            {meeting.startTime}
          </Typography>
          <ChevronRightIcon />
          <Typography variant="subtitle1" fontWeight="700" className="text-[var(--mui-palette-error-main)] text-sm sm:text-base">
            {meeting.endTime}
          </Typography>
        </Box>
      </Box>

      {/* Mode Action */}
      {meeting.method === "on" ? (
        <Button
          fullWidth
          variant="outlined"
          disabled={status === "ENDED"}
          startIcon={<VideocamOutlinedIcon />}
          className="border border-[var(--mui-palette-divider)] text-[var(--mui-palette-text-primary)] hover:bg-[var(--mui-palette-action-hover)] rounded-[14px] py-2 text-xs sm:text-sm normal-case font-semibold mt-3"
        >
          Join Online Meeting
        </Button>
      ) : (
        <Box className="py-2.5 px-3 shadow-md bg-[var(--mui-palette-action-hover)] rounded-[14px] text-center mt-3">
          <Typography variant="body2" className="font-semibold text-[var(--mui-palette-text-secondary)] text-xs sm:text-sm">
            Offline / In-Person Visit
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const DailyScheduleCard = ({
  date,
  meetings,
  selectedMeetingId,
  onSelectMeeting,
}: {
  date: Date;
  meetings: ScheduleMeeting[];
  selectedMeetingId: string | null;
  onSelectMeeting: (m: ScheduleMeeting) => void;
}) => {
  const isToday = new Date().toDateString() === date.toDateString();
  const title = isToday
    ? "Today's Schedule"
    : `Schedule for ${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`;

  const sortedMeetings = useMemo(() => {
    return [...meetings].sort((a, b) => a.startMinutes - b.startMinutes);
  }, [meetings]);

  return (
    <Box className="flex flex-col p-4 sm:p-5 rounded-2xl bg-[var(--mui-palette-secondary)] shadow-2xl w-full h-[440px]">
      <Box className="flex justify-between items-center mb-3">
        <Box className="flex items-center gap-2 min-w-0">
          <Box className="w-8 h-8 rounded-full bg-[var(--mui-palette-primary)] text-[var(--mui-palette-primary-main)] flex items-center justify-center shrink-0">
            <i className="ri-calendar-check-line " />
          </Box>
          <Box className="min-w-0">
            <Typography variant="subtitle2" fontWeight="600" className="text-[var(--mui-palette-text-primary)] leading-tight truncate text-xs sm:text-sm">
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="500" className="text-[10px] sm:text-[11px]">
              {sortedMeetings.length} Appointments
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        {sortedMeetings.length === 0 ? (
          <Typography variant="body2" color="text.secondary" className="text-center mt-10 text-xs sm:text-sm">
            No meetings scheduled for this day.
          </Typography>
        ) : (
          sortedMeetings.map((m) => {
            const isSelected = m.id === selectedMeetingId;
            const avatarSrc = resolveFileSrc(m.profilePic);

            return (
              <Box
                key={m.id}
                onClick={() => onSelectMeeting(m)}
                className={`flex gap-2 shadow-sm items-center p-2 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--mui-palette-action-selected)] shadow-2xl"
                    : "hover:bg-[var(--mui-palette-action-hover)] border border-transparent"
                }`}
              >
                {/* Time */}
                <Box className="flex flex-col items-center min-w-[48px] shrink-0">
                  <Typography variant="caption" fontWeight="700" className="text-[var(--mui-palette-success-main)] text-[10px]">
                    {m.startTime}
                  </Typography>
                  <Typography variant="caption" className="text-[var(--mui-palette-error-main)] text-[9px] font-semibold">
                    {m.endTime}
                  </Typography>
                </Box>

                <Box className="w-1 rounded-full bg-[var(--mui-palette-warning-main)] self-stretch shrink-0" />

                {/* Avatar & Info */}
                <Avatar src={avatarSrc} sx={{ width: 28, height: 28 }} className="text-[10px] font-bold shrink-0">
                  {!avatarSrc && m.candidateName.substring(0, 2).toUpperCase()}
                </Avatar>

                <Box className="flex flex-col overflow-hidden min-w-0">
                  <Typography variant="subtitle2" fontWeight="600" className="text-[var(--mui-palette-text-primary)] truncate text-xs" title={m.title}>
                    {m.candidateName}
                  </Typography>
                  <Typography variant="caption" className="text-[var(--mui-palette-text-secondary)] capitalize text-[10px] truncate">
                    {m.phase} • {m.method === "on" ? "Online" : "Offline"}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

const CalendarPanel = ({ currentDate, setCurrentDate, selectedDate, setSelectedDate, today }: any) => {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    const prevMonthDate = new Date(year, month - 1, 1);
    if (
      prevMonthDate.getFullYear() > today.getFullYear() ||
      (prevMonthDate.getFullYear() === today.getFullYear() && prevMonthDate.getMonth() >= today.getMonth())
    ) {
      setCurrentDate(prevMonthDate);
    }
  };

  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  for (let i = startDay - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false, fullDate: new Date(year, month - 1, daysInPrevMonth - i) });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true, fullDate: new Date(year, month, i) });
  }

  const nextMonthDays = (35 - calendarDays.length < 0 ? 42 : 35) - calendarDays.length;
  for (let i = 1; i <= nextMonthDays; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false, fullDate: new Date(year, month + 1, i) });
  }

  return (
    <Box className="flex flex-col p-4 sm:p-5 rounded-[28px] bg-[var(--mui-palette-secondary)] shadow-2xl w-full h-[440px]">
      <Box className="flex justify-between items-center mb-4 px-1">
        <Typography variant="subtitle1" fontWeight="600" className="text-[var(--mui-palette-text-primary)] text-sm sm:text-base">
          {monthNames[month]} {year}
        </Typography>
        <Box className="flex items-center shadow-md rounded-[10px] overflow-hidden">
          <IconButton size="small" onClick={handlePrevMonth} disabled={year === today.getFullYear() && month === today.getMonth()} className="rounded-none border-r border-[var(--mui-palette-divider)] disabled:opacity-30 p-1">
            <ChevronLeftIcon />
          </IconButton>
          <IconButton size="small" onClick={handleNextMonth} className="rounded-none p-1">
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <Box className="grid grid-cols-7 text-center gap-y-2 flex-1 items-center">
        {daysOfWeek.map((day) => (
          <Typography key={day} variant="caption" fontWeight="700" className="text-[var(--mui-palette-text-secondary)] text-[10px]">
            {day}
          </Typography>
        ))}

        {calendarDays.map((dateObj, idx) => {
          const cellDate = new Date(dateObj.fullDate);
          cellDate.setHours(0, 0, 0, 0);
          const compareToday = new Date(today);
          compareToday.setHours(0, 0, 0, 0);

          const isPast = cellDate < compareToday;
          const isSelected = dateObj.isCurrentMonth && dateObj.day === selectedDate.getDate() && month === selectedDate.getMonth();
          const isMuted = !dateObj.isCurrentMonth;
          const isCurrentDay = cellDate.getTime() === compareToday.getTime();

          return (
            <Box key={idx} className="flex justify-center items-center">
              <Box
                onClick={() => {
                  if (dateObj.isCurrentMonth && !isPast) {
                    setSelectedDate(new Date(year, month, dateObj.day));
                  }
                }}
                className={`w-8 h-8 flex items-center justify-center font-bold text-xs transition-all ${
                  isPast || !dateObj.isCurrentMonth ? "cursor-not-allowed opacity-30" : "cursor-pointer"
                } ${
                  isSelected
                    ? "bg-[var(--mui-palette-primary-main)] text-[var(--mui-palette-primary-contrastText)] rounded-full shadow-md"
                    : isCurrentDay && !isSelected
                      ? "border-2 border-[var(--mui-palette-primary-main)] text-[var(--mui-palette-primary-main)] rounded-full"
                      : isMuted || isPast
                        ? "text-[var(--mui-palette-text-disabled)]"
                        : "text-[var(--mui-palette-text-primary)] hover:bg-[var(--mui-palette-action-hover)] rounded-full"
                }`}
              >
                {dateObj.day}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// --- MAIN VIEW ---
const SchedulesView = ({ mode }: { mode: Mode }) => {
  const today = new Date();

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  const { schedules, loading } = useSchedules(currentMonthDate);

  const formatYYYYMMDD = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const selectedDateStr = formatYYYYMMDD(selectedDate);
  const todayStr = formatYYYYMMDD(today);

  const selectedDateMeetings = useMemo(() => {
    return schedules.filter((m) => m.date === selectedDateStr);
  }, [selectedDateStr, schedules]);

  const currentMinutes = today.getHours() * 60 + today.getMinutes();

  const activeOrUpcomingMeeting = useMemo(() => {
    if (selectedDateMeetings.length === 0) return null;

    if (selectedMeetingId) {
      const found = selectedDateMeetings.find((m) => m.id === selectedMeetingId);
      if (found) return found;
    }

    if (selectedDateStr !== todayStr) {
      return null;
    }

    const liveNow = selectedDateMeetings.find(
      (m) => currentMinutes >= m.startMinutes && currentMinutes <= m.endMinutes
    );
    if (liveNow) return liveNow;

    const nextUpcoming = selectedDateMeetings
      .filter((m) => m.startMinutes > currentMinutes)
      .sort((a, b) => a.startMinutes - b.startMinutes)[0];

    return nextUpcoming || null;
  }, [selectedDateMeetings, selectedMeetingId, currentMinutes, selectedDateStr, todayStr]);

  const meetingStatus = useMemo(() => {
    if (!activeOrUpcomingMeeting) return "UPCOMING";
    
    if (selectedDateStr < todayStr) return "ENDED";
    if (selectedDateStr > todayStr) return "UPCOMING";

    if (currentMinutes > activeOrUpcomingMeeting.endMinutes) {
      return "ENDED";
    } else if (
      currentMinutes >= activeOrUpcomingMeeting.startMinutes &&
      currentMinutes <= activeOrUpcomingMeeting.endMinutes
    ) {
      return "LIVE";
    } else {
      return "UPCOMING";
    }
  }, [activeOrUpcomingMeeting, selectedDateStr, todayStr, currentMinutes]);

  const hasMeetings = selectedDateMeetings.length > 0;

  return (
    <Box className="p-2 sm:p-4 min-h-[calc(100vh-100px)] relative overflow-x-hidden w-full">
      {loading && (
        <Box className="absolute top-2 right-4 z-50">
          <Typography variant="caption" className="animate-pulse text-[var(--mui-palette-primary-main)] font-semibold text-xs">
            Syncing schedule...
          </Typography>
        </Box>
      )}

      {/* 🌟 REVERTED BACK TO ANIMATED FLEX LAYOUT WITH FLUID RESPONSIVENESS 🌟 */}
      <Box className="w-full max-w-[1250px] mx-auto mt-2 overflow-visible">
        <Box className="flex flex-col lg:flex-row items-center lg:items-start justify-center transition-all duration-700 ease-in-out w-full gap-4 lg:gap-6">
          
          {/* Animated Calendar Panel */}
          <Box
            className={`transition-all duration-700 ease-in-out flex justify-center origin-center shrink-0 ${
              hasMeetings ? "w-full lg:w-[320px] xl:w-[360px] scale-100 opacity-100" : "w-full max-w-[480px] my-auto scale-[1.03] opacity-100"
            }`}
          >
            <CalendarPanel
              currentDate={currentMonthDate}
              setCurrentDate={setCurrentMonthDate}
              selectedDate={selectedDate}
              setSelectedDate={(d: Date) => {
                setSelectedDate(d);
                setSelectedMeetingId(null);  
              }}
              today={today}
            />
          </Box>

          {/* Animated Sliding Drawer Wrapper for Cards */}
          <Box
            className="flex flex-col md:flex-row gap-4 lg:gap-6 transition-all duration-700 ease-in-out origin-left"
            sx={{
              opacity: hasMeetings ? 1 : 0,
              visibility: hasMeetings ? "visible" : "hidden",
              width: hasMeetings ? "100%" : "0px",
              maxWidth: hasMeetings ? "1000px" : "0px",
              transform: hasMeetings ? "translateX(0)" : "translateX(-40px)",
              flex: hasMeetings ? 1 : 0, // This allows the drawer to collapse horizontally
              overflow: hasMeetings ? "visible" : "hidden", // Keeps shadows from clipping when open
            }}
          >
            {hasMeetings && (
              <>
                <Box className="w-full flex-1 min-w-[280px] max-w-[420px] shrink-0 mx-auto">
                  <DailyScheduleCard
                    date={selectedDate}
                    meetings={selectedDateMeetings}
                    selectedMeetingId={activeOrUpcomingMeeting?.id || null}
                    onSelectMeeting={(m) => setSelectedMeetingId(m.id)}
                  />
                </Box>
                <Box className="w-full flex-1 min-w-[280px] max-w-[420px] shrink-0 mx-auto">
                  <LiveEventCard 
                    meeting={activeOrUpcomingMeeting} 
                    status={meetingStatus} 
                  />
                </Box>
              </>
            )}
          </Box>
          
        </Box>
      </Box>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--mui-palette-divider);
          border-radius: 4px;
        }
      `}</style>
    </Box>
  );
};

export default SchedulesView;