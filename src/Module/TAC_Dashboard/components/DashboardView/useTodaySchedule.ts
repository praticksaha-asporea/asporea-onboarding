
import { useState } from "react";
import { useTheme } from "@mui/material";
import { todaySchedule } from "@/Types/ApiResponse/tacResponse.types";
export const useTodaySchedule = ({ slots }: { slots: todaySchedule[] }) => {

    const theme = useTheme();
    const [startIndex, setStartIndex] = useState(0);

    const visibleCards = slots.slice(startIndex, startIndex + 4);
    const handlePrev = () => {
        setStartIndex((prev) => Math.max(prev - 4, 0));
    };

    const handleNext = () => {
        setStartIndex((prev) =>
            Math.min(prev + 4, Math.max(slots.length - 4, 0))
        );
    };

    return { visibleCards, theme, handlePrev, handleNext, startIndex }
}