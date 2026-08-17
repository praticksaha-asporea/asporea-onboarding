import { useState, useMemo } from "react";

export interface ScheduleItem {
    id: string;
    candidateName: string;
    phase: string;
    time: string;
    dateStr: string; // YYYY-MM-DD
    type: "Online Meeting" | "Document Review" | "Counselling Session";
    status: "upcoming" | "completed" | "missed";
}

export const useSchedules = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: string; events: ScheduleItem[] } | null>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);

    // Helper to format Date to YYYY-MM-DD
    const formatDateKey = (year: number, month: number, day: number) => {
        const m = String(month + 1).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        return `${year}-${m}-${d}`;
    };

    // Dynamic Static Mock Data based on current month/year
    const mockSchedules: ScheduleItem[] = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const todayStr = formatDateKey(year, month, new Date().getDate());
        const tomorrowStr = formatDateKey(year, month, new Date().getDate() + 1);
        const dayAfterStr = formatDateKey(year, month, new Date().getDate() + 2);
        const pastStr = formatDateKey(year, month, new Date().getDate() - 3);

        return [
            {
                id: "1",
                candidateName: "Anil Kumar",
                phase: "Pre-Counselling",
                time: "10:30 AM",
                dateStr: todayStr,
                type: "Counselling Session",
                status: "upcoming",
            },
            {
                id: "2",
                candidateName: "Ramesh Sharma",
                phase: "Assessment",
                time: "02:00 PM",
                dateStr: todayStr,
                type: "Online Meeting",
                status: "upcoming",
            },
            {
                id: "3",
                candidateName: "Priya Verma",
                phase: "Document Upload",
                time: "04:30 PM",
                dateStr: todayStr,
                type: "Document Review",
                status: "upcoming",
            },
            {
                id: "4",
                candidateName: "Siddharth Malhotra",
                phase: "Application Tracking",
                time: "11:00 AM",
                dateStr: tomorrowStr,
                type: "Online Meeting",
                status: "upcoming",
            },
            {
                id: "5",
                candidateName: "Neha Gupta",
                phase: "Pre-Counselling",
                time: "03:15 PM",
                dateStr: tomorrowStr,
                type: "Counselling Session",
                status: "upcoming",
            },
            {
                id: "6",
                candidateName: "Rahul Dravid",
                phase: "Assessment",
                time: "12:00 PM",
                dateStr: dayAfterStr,
                type: "Online Meeting",
                status: "upcoming",
            },
            {
                id: "7",
                candidateName: "Vikas Singh",
                phase: "Inquiry Check",
                time: "01:00 PM",
                dateStr: pastStr,
                type: "Document Review",
                status: "completed",
            },
        ];
    }, [currentDate]);

    // Calendar Days Calculation
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Check if date is in the past
    const isPastDate = (day: number) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(year, month, day);
        return targetDate < today;
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year
        );
    };

    // Group events by YYYY-MM-DD
    const eventsByDate = useMemo(() => {
        const map: Record<string, ScheduleItem[]> = {};
        mockSchedules.forEach((item) => {
            if (!map[item.dateStr]) map[item.dateStr] = [];
            map[item.dateStr].push(item);
        });
        return map;
    }, [mockSchedules]);

    return {
        currentDate,
        year,
        month,
        daysInMonth,
        firstDayOfWeek,
        prevMonth,
        nextMonth,
        goToToday,
        isPastDate,
        isToday,
        eventsByDate,
        formatDateKey,
        selectedDayEvents,
        setSelectedDayEvents,
        selectedSchedule,
        setSelectedSchedule,
    };
};