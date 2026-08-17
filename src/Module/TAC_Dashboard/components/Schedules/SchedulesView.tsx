"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  AvatarGroup,
  Button,
  IconButton,
  Divider,
} from "@mui/material";

const ChevronLeftIcon = () => <i className="ri-arrow-left-s-line text-lg" />;
const ChevronRightIcon = () => <i className="ri-arrow-right-s-line text-lg" />;
const MoreVertIcon = () => <i className="ri-more-2-line text-lg" />;
const VideocamOutlinedIcon = () => (
  <i className="ri-video-download-line text-lg" />
);
const CalendarCheckIcon = () => (
  <i className="ri-calendar-check-line text-base" />
);

import type { Mode } from "@core/types";

const dummyMeetings = [
  // Past Meetings (For Aug 14)
  {
    id: 1,
    title: "Initial Screening with Rahul",
    date: "2026-08-14",
    startTime: "09:00",
    endTime: "09:30",
    type: "assessment",
    link: "#",
  },
  {
    id: 2,
    title: "Document Review for Priya",
    date: "2026-08-14",
    startTime: "11:00",
    endTime: "11:45",
    type: "review",
    link: "#",
  },
  // Upcoming Meetings (For Aug 14)
  {
    id: 3,
    title: "Meeting with Astro Founder",
    date: "2026-08-14",
    startTime: "14:30",
    endTime: "15:15",
    type: "live",
    link: "https://zoom.us/test1",
  },
  {
    id: 4,
    title: "Technical Round - Amit Singh",
    date: "2026-08-14",
    startTime: "16:00",
    endTime: "17:00",
    type: "assessment",
    link: "https://zoom.us/test2",
  },
  {
    id: 5,
    title: "Final HR Sync",
    date: "2026-08-14",
    startTime: "17:30",
    endTime: "18:00",
    type: "sync",
    link: "#",
  },
  {
    id: 6,
    title: "Feedback Session",
    date: "2026-08-14",
    startTime: "18:15",
    endTime: "18:45",
    type: "review",
    link: "#",
  },
  {
    id: 7,
    title: "Wrap up Call",
    date: "2026-08-14",
    startTime: "19:00",
    endTime: "19:30",
    type: "sync",
    link: "#",
  },
  // Future Dates
  {
    id: 8,
    title: "Candidate Evaluation",
    date: "2026-08-15",
    startTime: "10:00",
    endTime: "11:00",
    type: "assessment",
    link: "#",
  },
  {
    id: 9,
    title: "Pre-Counselling - Sneha",
    date: "2026-08-16",
    startTime: "14:00",
    endTime: "15:00",
    type: "counselling",
    link: "#",
  },
];

const LiveEventCard = ({
  meeting,
  dateStr,
}: {
  meeting: any;
  dateStr: string;
}) => {
  if (!meeting)
    return (
      <Box className="flex flex-col p-6 rounded-[24px] bg-[var(--mui-palette-background-paper)] shadow-sm border border-[var(--mui-palette-divider)] w-full max-w-sm justify-center items-center min-h-[220px]">
        <Typography variant="body2" color="text.secondary">
          No upcoming meetings
        </Typography>
      </Box>
    );

  const [year, month, day] = meeting.date.split("-");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <Box className="flex flex-col p-5 rounded-[24px] bg-[var(--mui-palette-background-paper)] shadow-2xl w-full max-w-sm">
      <Box className="flex justify-between items-start mb-4">
        <Box className="flex items-center gap-3">
          <Box className="flex flex-col items-center justify-center border border-[var(--mui-palette-divider)] rounded-xl w-12 h-12 overflow-hidden bg-[var(--mui-palette-background-default)]">
            <Box className="bg-red-500 text-white text-[10px] font-bold uppercase w-full text-center py-0.5">
              {monthNames[parseInt(month) - 1]}
            </Box>
            <Box className="text-[var(--mui-palette-text-primary)] font-bold text-lg leading-none mt-1">
              {day}
            </Box>
          </Box>
          <Box>
            <Typography
              variant="caption"
              className="text-[var(--mui-palette-text-secondary)] font-semibold"
            >
              Next Upcoming Event
            </Typography>
            <Box className="flex items-center gap-1.5 mt-0.5">
              <Box className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <Typography
                variant="subtitle2"
                fontWeight="700"
                className="text-[var(--mui-palette-text-primary)] truncate max-w-[160px]"
              >
                {meeting.title}
              </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton
          size="small"
          className="text-[var(--mui-palette-text-secondary)] -mt-1 -mr-2"
        >
          <MoreVertIcon />
        </IconButton>
      </Box>

      <Box className="flex items-center gap-3 mb-5 mt-2">
        <Box>
          <Typography
            variant="h4"
            fontWeight="700"
            className="text-[var(--mui-palette-text-primary)]"
          >
            {meeting.startTime}
          </Typography>
        </Box>
        <ChevronRightIcon />
        <Box>
          <Typography
            variant="h4"
            fontWeight="700"
            className="text-[var(--mui-palette-text-primary)]"
          >
            {meeting.endTime}
          </Typography>
        </Box>
      </Box>

      <Button
        fullWidth
        variant="outlined"
        href={meeting.link}
        target="_blank"
        startIcon={<VideocamOutlinedIcon />}
        className="border border-[var(--mui-palette-divider)] text-[var(--mui-palette-text-primary)] hover:bg-[var(--mui-palette-action-hover)] rounded-[16px] py-2.5 normal-case font-semibold"
      >
        Go to Zoom link
      </Button>
    </Box>
  );
};

// 2. Day's Schedule List Card
const DailyScheduleCard = ({
  date,
  meetings,
}: {
  date: Date;
  meetings: any[];
}) => {
  const isToday = new Date().toDateString() === date.toDateString();
  const title = isToday
    ? "Today's Schedule"
    : `Schedule for ${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`;

  return (
    <Box className="flex flex-col p-5 rounded-2xl bg-[var(--mui-palette-background-paper)] shadow-2xl   w-full max-w-sm h-[480px]">
      <Box className="flex justify-between items-center mb-4">
        <Box className="flex items-center gap-2">
          <Box
            className="w-9 h-9 rounded-full bg-[var(--mui-palette-primary)] text-[var(--mui-palette-primary-main)]
 flex items-center justify-center"
          >
            <CalendarCheckIcon />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight="500"
              className="text-[var(--mui-palette-text-primary)] leading-tight"
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight="500"
            >
              {meetings.length} Appointments
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider className="mb-4" />

      {/* Scrollable list of meetings */}
      <Box className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {meetings.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            className="text-center mt-10"
          >
            No meetings scheduled for this day.
          </Typography>
        ) : (
          meetings
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((m) => (
              <Box
                key={m.id}
                className="flex gap-3 items-start p-3 rounded-2xl hover:bg-[var(--mui-palette-action-hover)] transition-colors border border-transparent hover:border-[var(--mui-palette-divider)] cursor-pointer"
              >
                <Box className="flex flex-col items-center min-w-[50px] pt-0.5">
                  <Typography
                    variant="caption"
                    fontWeight="700"
                    className="text-[var(--mui-palette-text-primary)]"
                  >
                    {m.startTime}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="text-[var(--mui-palette-text-disabled)] text-[10px]"
                  >
                    {m.endTime}
                  </Typography>
                </Box>

                <Box className="w-1 rounded-full bg-blue-400 self-stretch" />

                <Box className="flex flex-col">
                  <Typography
                    variant="subtitle2"
                    fontWeight="600"
                    className="text-[var(--mui-palette-text-primary)] line-clamp-1"
                  >
                    {m.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="text-[var(--mui-palette-text-secondary)] capitalize mt-0.5"
                  >
                    {m.type}
                  </Typography>
                </Box>
              </Box>
            ))
        )}
      </Box>
    </Box>
  );
};

// 3. Clean Calendar Component
const CalendarPanel = ({
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  today,
}: any) => {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    // Only allow going to previous month if it's not before the current real month/year
    const prevMonthDate = new Date(year, month - 1, 1);
    if (
      prevMonthDate.getFullYear() > today.getFullYear() ||
      (prevMonthDate.getFullYear() === today.getFullYear() &&
        prevMonthDate.getMonth() >= today.getMonth())
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
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      fullDate: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      fullDate: new Date(year, month, i),
    });
  }

  const nextMonthDays =
    (35 - calendarDays.length < 0 ? 42 : 35) - calendarDays.length;
  for (let i = 1; i <= nextMonthDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      fullDate: new Date(year, month + 1, i),
    });
  }

  return (
    <Box className="flex flex-col p-6 rounded-[32px] bg-[var(--mui-palette-background-paper)] shadow-2xl  w-full lg:w-[450px]">
      <Box className="flex justify-between items-center mb-6 px-2">
        <Typography
          variant="h6"
          fontWeight="500"
          className="text-[var(--mui-palette-text-primary)]"
        >
          {monthNames[month]} {year}
        </Typography>
        <Box className="flex items-center border border-[var(--mui-palette-divider)] rounded-[12px] overflow-hidden">
          <IconButton
            size="small"
            onClick={handlePrevMonth}
            disabled={
              year === today.getFullYear() && month === today.getMonth()
            }
            className="rounded-none border-r border-[var(--mui-palette-divider)] disabled:opacity-30"
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleNextMonth}
            className="rounded-none"
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <Box className="grid grid-cols-7 text-center gap-y-4">
        {daysOfWeek.map((day) => (
          <Typography
            key={day}
            variant="caption"
            fontWeight="700"
            className="text-[var(--mui-palette-text-secondary)] mb-2"
          >
            {day}
          </Typography>
        ))}

        {calendarDays.map((dateObj, idx) => {
          const cellDate = new Date(dateObj.fullDate);
          cellDate.setHours(0, 0, 0, 0);
          const compareToday = new Date(today);
          compareToday.setHours(0, 0, 0, 0);

          const isPast = cellDate < compareToday;
          const isSelected =
            dateObj.isCurrentMonth &&
            dateObj.day === selectedDate.getDate() &&
            month === selectedDate.getMonth();
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
                  isPast || !dateObj.isCurrentMonth
                    ? "cursor-not-allowed opacity-40"
                    : "cursor-pointer"
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

// --- MAIN VIEW COMPONENT ---

const SchedulesView = ({ mode }: { mode: Mode }) => {
  const today = new Date();

  const [currentMonthDate, setCurrentMonthDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);

  const formatYYYYMMDD = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const selectedDateStr = formatYYYYMMDD(selectedDate);

  const selectedDateMeetings = useMemo(() => {
    return dummyMeetings.filter((m) => m.date === selectedDateStr);
  }, [selectedDateStr]);

  const upcomingMeeting = useMemo(() => {
    const todayStr = formatYYYYMMDD(today);

    if (selectedDateStr !== todayStr) return null;

    const currentHour = today.getHours();
    const currentMin = today.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;

    const todaysMeetings = dummyMeetings
      .filter((m) => m.date === todayStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return todaysMeetings.find((m) => m.endTime >= currentTimeStr) || null;
  }, [selectedDateStr, today]);

  return (
    <Box className="p-4 md:p-8 min-h-[calc(100vh-100px)]">
      <Box className="flex flex-col lg:flex-row gap-8 max-w-[1100px] mx-auto items-start justify-center">
        {/* Left: Interactive Calendar */}
        <Box className="w-full lg:w-auto flex justify-center">
          <CalendarPanel
            currentDate={currentMonthDate}
            setCurrentDate={setCurrentMonthDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            today={today}
          />
        </Box>

        {/* Right: Dynamic Schedule Cards */}
        <Box className="flex-1 flex flex-col sm:flex-row gap-6 w-full items-start justify-start">
          {/* Daily Schedule List (Shows all 7-8 meetings) */}
          <Box className="flex-1 w-full max-w-sm">
            <DailyScheduleCard
              date={selectedDate}
              meetings={selectedDateMeetings}
            />
          </Box>

          {/* Live/Upcoming Meeting Card (Only shows if viewing today) */}
          <Box className="w-full max-w-sm">
            {selectedDateStr === formatYYYYMMDD(today) && (
              <LiveEventCard
                meeting={upcomingMeeting}
                dateStr={selectedDateStr}
              />
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
