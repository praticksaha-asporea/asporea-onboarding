"use client";

import React, { useState, useMemo } from "react";
import { Box, Typography, Button, IconButton, Avatar } from "@mui/material";
import type { Mode } from "@core/types";
import { useSchedules, ScheduleMeeting } from "./useSchedules";

const ChevronLeftIcon = () => <i className="ri-arrow-left-s-line text-lg" />;
const ChevronRightIcon = () => <i className="ri-arrow-right-s-line text-lg" />;
const MoreVertIcon = () => <i className="ri-more-2-line text-lg" />;
const VideocamOutlinedIcon = () => <i className="ri-video-download-line text-lg" />;
const CalendarCheckIcon = () => <i className="ri-calendar-check-line text-3xl" />; // Increased size for empty state

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
      <Box className="flex flex-col p-6 rounded-[24px] bg-[var(--mui-palette-secondary)] shadow-2xl w-full max-w-sm justify-center items-center min-h-[240px]  ">
        <Box className="w-12 h-12 rounded-full    text-[var(--mui-palette-primary-main)] flex items-center justify-center mb-3">
          <CalendarCheckIcon />
        </Box>
        <Typography variant="subtitle1" fontWeight="600" className="text-[var(--mui-palette-text-primary)] mb-1">
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
    <Box className="flex flex-col p-5 rounded-[24px] bg-[var(--mui-palette-secondary)] shadow-2xl w-full max-w-sm">
      <Box className="flex justify-between items-start mb-4">
        <Box className="flex items-center gap-3">
          <Avatar
            src={avatarSrc}
            sx={{ width: 44, height: 44 }}
            className="font-bold text-sm shadow-sm"
          >
            {!avatarSrc && meeting.candidateName.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box className="overflow-hidden">
            <Typography variant="caption" className="text-[var(--mui-palette-primary-main)] font-semibold block">
              {meeting.inqNo}
            </Typography>
            <Typography variant="subtitle2" fontWeight="600" className="text-[var(--mui-palette-text-secondary)] tracking-wide mt-0.5">
              {meeting.candidateName}
            </Typography>
          </Box>
        </Box>
        
        {status === "LIVE" && (
          <Box className="flex items-center gap-1.5 px-2.5 py-1 animate-blink rounded-full text-[13px] font-medium tracking-wider text-[var(--mui-palette-success-main)]">
            <Box className="w-3 h-3 rounded-full bg-[var(--mui-palette-success-main)]" />
            Live Now
          </Box>
        )}

        {status === "ENDED" && (
          <Box className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-medium text-[var(--mui-palette-error-main)]">
            <Box className="w-3 h-3 rounded-full bg-[var(--mui-palette-error-main)]" />
            Ended
          </Box>
        )}

        {status === "UPCOMING" && (
          <Box className="flex items-center gap-1.5 px-2.5 py-1 animate-blink rounded-full text-[13px] font-medium text-[var(--mui-palette-warning-main)]">
            <Box className="w-2 h-2 rounded-full bg-[var(--mui-palette-warning-main)]" />
            Upcoming
          </Box>
        )}
      </Box>

      {/* Phase & Timing */}
      <Box className="my-3">
        <Typography variant="caption" className="text-[var(--mui-palette-text-secondary)] font-medium">
          {meeting.phase} Session
        </Typography>
        <Box className="flex items-center gap-3 mt-1">
          <Typography variant="h5" fontWeight="600" className="text-[var(--mui-palette-success-main)]">
            {meeting.startTime}
          </Typography>
          <ChevronRightIcon />
          <Typography variant="h5" fontWeight="700" className="text-[var(--mui-palette-error-main)]">
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
          className="border border-[var(--mui-palette-divider)] text-[var(--mui-palette-text-primary)] hover:bg-[var(--mui-palette-action-hover)] rounded-[16px] py-2.5 normal-case font-semibold mt-2"
        >
          Join Online Meeting
        </Button>
      ) : (
        <Box className="py-2.5 px-4 shadow-xl bg-[var(--mui-palette-action-hover)] rounded-[16px] text-center mt-2">
          <Typography variant="body2" className="font-semibold text-[var(--mui-palette-text-secondary)]">
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
    <Box className="flex flex-col p-5 rounded-2xl bg-[var(--mui-palette-secondary)] shadow-2xl w-full max-w-sm h-[480px]">
      <Box className="flex justify-between items-center mb-4">
        <Box className="flex items-center gap-2">
          <Box className="w-9 h-9 rounded-full bg-[var(--mui-palette-primary)] text-[var(--mui-palette-primary-main)] flex items-center justify-center">
            <i className="ri-calendar-check-line text-base" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="500" className="text-[var(--mui-palette-text-primary)] leading-normal tracking-wide">
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="500">
              {sortedMeetings.length} Appointments
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {sortedMeetings.length === 0 ? (
          <Typography variant="body2" color="text.secondary" className="text-center mt-10">
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
                className={`flex gap-3 shadow-sm items-center p-3 rounded-2xl transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--mui-palette-action-selected)]  shadow-md"
                    : "hover:bg-[var(--mui-palette-action-hover)] border border-transparent"
                }`}
              >
                {/* Time */}
                <Box className="flex flex-col items-center min-w-[55px]">
                  <Typography variant="caption" fontWeight="700" className="text-[var(--mui-palette-success-main)] text-[11px]">
                    {m.startTime}
                  </Typography>
                  <Typography variant="caption" className="text-[var(--mui-palette-error-main)] text-[10px] font-semibold">
                    {m.endTime}
                  </Typography>
                </Box>

                <Box className="w-1 rounded-full bg-[var(--mui-palette-warning-main)] self-stretch" />

                {/* Avatar & Info */}
                <Avatar src={avatarSrc} sx={{ width: 32, height: 32 }} className="text-xs font-bold">
                  {!avatarSrc && m.candidateName.substring(0, 2).toUpperCase()}
                </Avatar>

                <Box className="flex flex-col overflow-hidden">
                  <Typography variant="subtitle2" fontWeight="600" className="text-[var(--mui-palette-text-primary)] truncate" title={m.title}>
                    {m.candidateName}
                  </Typography>
                  <Typography variant="caption" className="text-[var(--mui-palette-text-secondary)] capitalize text-[11px]">
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
    <Box className="flex flex-col p-6 rounded-[32px] bg-[var(--mui-palette-secondary)] shadow-2xl w-full lg:w-[450px]">
      <Box className="flex justify-between items-center mb-6 px-2">
        <Typography variant="h6" fontWeight="500" className="text-[var(--mui-palette-text-primary)]">
          {monthNames[month]} {year}
        </Typography>
        <Box className="flex items-center   shadow-2xl rounded-[12px] overflow-hidden">
          <IconButton size="small" onClick={handlePrevMonth} disabled={year === today.getFullYear() && month === today.getMonth()} className="rounded-none border-r border-[var(--mui-palette-divider)] disabled:opacity-30">
            <ChevronLeftIcon />
          </IconButton>
          <IconButton size="small" onClick={handleNextMonth} className="rounded-none">
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <Box className="grid grid-cols-7 text-center gap-y-4">
        {daysOfWeek.map((day) => (
          <Typography key={day} variant="caption" fontWeight="700" className="text-[var(--mui-palette-text-secondary)] mb-2">
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
            <Box key={idx} className="flex justify-center items-center h-10">
              <Box
                onClick={() => {
                  if (dateObj.isCurrentMonth && !isPast) {
                    setSelectedDate(new Date(year, month, dateObj.day));
                  }
                }}
                className={`w-10 h-10 flex items-center justify-center font-bold text-sm transition-all ${
                  isPast || !dateObj.isCurrentMonth ? "cursor-not-allowed opacity-40" : "cursor-pointer"
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

    // 1. If explicitly clicked by user, show that one
    if (selectedMeetingId) {
      const found = selectedDateMeetings.find((m) => m.id === selectedMeetingId);
      if (found) return found;
    }

    // 2. If viewing a Past/Future date (not today), DO NOT auto-select.
    // User must click a card manually.
    if (selectedDateStr !== todayStr) {
      return null;
    }

    // 3. If Today: Check for Live Now
    const liveNow = selectedDateMeetings.find(
      (m) => currentMinutes >= m.startMinutes && currentMinutes <= m.endMinutes
    );
    if (liveNow) return liveNow;

    // 4. If Today: Check for Next Upcoming
    const nextUpcoming = selectedDateMeetings
      .filter((m) => m.startMinutes > currentMinutes)
      .sort((a, b) => a.startMinutes - b.startMinutes)[0];

    // If there's an upcoming, show it. Otherwise, EVERYTHING IS ENDED, return null.
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
    <Box className="p-4 md:p-8 min-h-[calc(100vh-100px)] relative overflow-x-hidden">
      {loading && (
        <Box className="absolute top-2 right-8 z-50">
          <Typography variant="caption" className="animate-pulse text-[var(--mui-palette-primary-main)] font-semibold">
            Syncing schedule...
          </Typography>
        </Box>
      )}

      {/* 🌟 FIX 1: INCREASED MAX-WIDTH TO 1350px SO CARDS NEVER GET SQUISHED OR CUT 🌟 */}
      <Box className="max-w-[1350px] mx-auto relative flex justify-center mt-6">
        
        <Box className="flex flex-col lg:flex-row items-start justify-center transition-all duration-700 ease-in-out w-full gap-8">
          
          <Box
            className={`transition-all duration-700 ease-in-out flex justify-center origin-center shrink-0 ${
              hasMeetings ? "lg:w-[450px] scale-100 opacity-100" : "lg:w-[700px] scale-[1.05] opacity-100 my-auto"
            }`}
            sx={{ transform: hasMeetings ? 'translateX(0)' : 'translateX(0px)' }}
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

          <Box
            className="flex-1 flex flex-col sm:flex-row gap-6 w-full items-start justify-start transition-all duration-700 ease-in-out origin-left"
            sx={{
              opacity: hasMeetings ? 1 : 0,
              visibility: hasMeetings ? "visible" : "hidden",
              maxWidth: hasMeetings ? "1000px" : "0px",
              transform: hasMeetings ? "translateX(0)" : "translateX(-50px)",
              maxHeight: hasMeetings ? "1000px" : "0px",
              // 🌟 FIX 1: REMOVED OVERFLOW HIDDEN SO SHADOWS AND PADDING DON'T CUT 🌟
              overflow: hasMeetings ? "visible" : "hidden", 
            }}
          >
            {hasMeetings && (
              <>
                <Box className="flex-1 w-full max-w-sm shrink-0">
                  <DailyScheduleCard
                    date={selectedDate}
                    meetings={selectedDateMeetings}
                    selectedMeetingId={activeOrUpcomingMeeting?.id || null}
                    onSelectMeeting={(m) => setSelectedMeetingId(m.id)}
                  />
                </Box>

                <Box className="w-full max-w-sm shrink-0">
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