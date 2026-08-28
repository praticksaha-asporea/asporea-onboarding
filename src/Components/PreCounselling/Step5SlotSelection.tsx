import React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import { Slot } from "@/Types/Frontend_Payload/assessment.types";
import { SectionHeader } from "./SectionHeader";
import { sectionCardClass } from "./HeaderCard";

interface Step5SlotSelectionProps {
  selectedTacId: string;
  date: string;
  setDate: (date: string) => void;
  todayStr: string;
  loadingSlots: boolean;
  slots: Slot[];
  selectedSlot: Slot | null;
  setSelectedSlot: React.Dispatch<React.SetStateAction<Slot | null>>;
}

export const Step5SlotSelection: React.FC<Step5SlotSelectionProps> = ({
  selectedTacId,
  date,
  setDate,
  todayStr,
  loadingSlots,
  slots,
  selectedSlot,
  setSelectedSlot,
}) => {
  return (
    <Card className={sectionCardClass}>
      <SectionHeader
        icon="ri-calendar-schedule-line"
        step="Step 5"
        title="Pick a Date & Time Slot"
        accent="var(--mui-palette-secondary-main)"
      />

      {!selectedTacId ? (
        <Box className="flex flex-col items-center text-center gap-2 py-8">
          <i className="ri-user-search-line text-3xl text-[var(--mui-palette-text-secondary)]" />
          <Typography
            variant="body2"
            className="text-[var(--mui-palette-text-secondary)]"
          >
            Select a TAC above to see their available slots.
          </Typography>
        </Box>
      ) : (
        <>
          <TextField
            type="date"
            size="small"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mb-5 max-w-[200px]"
            InputProps={{ className: "rounded-xl" }}
            inputProps={{ min: todayStr }}
          />

          {loadingSlots ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(auto-fill, minmax(165px, 1fr))",
                },
                gap: 1.5,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={36.5}
                  sx={{ borderRadius: "20px", width: "100%" }}
                />
              ))}
            </Box>
          ) : slots.length === 0 ? (
            <Typography
              variant="body2"
              className="text-[var(--mui-palette-text-secondary)]"
            >
              No slots available for this date.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(auto-fill, minmax(165px, 1fr))",
                },
                gap: 1.5,
              }}
            >
              {slots.map((slot, idx) => {
                const isSelected = selectedSlot?.time === slot.time;
                return (
                  <Button
                    key={idx}
                    disabled={!slot.available}
                    onClick={() => {
                      if (!slot.available) return;
                      setSelectedSlot((prev) =>
                        prev?.from === slot.from && prev?.to === slot.to
                          ? null
                          : slot,
                      );
                    }}
                    sx={{
                      width: "100%",
                      minWidth: 0,
                      height: "36.5px",
                      borderRadius: "20px",
                      fontSize: { xs: "11px", sm: "13px" },
                      px: { xs: 0.5, sm: 2 },
                      textTransform: "none",
                      fontWeight: 500,
                      transition:
                        "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, background-color 0.2s ease, border-color 0.2s ease",
                      willChange: "transform",
                      bgcolor: isSelected
                        ? "var(--mui-palette-primary-main)"
                        : "var(--mui-palette-background-paper)",
                      color: isSelected
                        ? "#ffffff !important"
                        : slot.available
                        ? "var(--mui-palette-text-primary)"
                        : "var(--mui-palette-text-disabled)",

                      
                      "&.Mui-disabled": {
                        bgcolor: isSelected
                          ? "var(--mui-palette-primary-main)"
                          : undefined,
                        color: isSelected
                          ? "#ffffff !important"
                          : "var(--mui-palette-text-disabled)",
                      },
                      boxShadow: isSelected
                        ? "0px 4px 14px rgba(18, 93, 163, 0.4)"
                        : "0px 4px 10px rgba(0, 0, 0, 0.2), inset 0px 1px 0px rgba(255, 255, 255, 0.08)",
                      "&:hover": {
                        zIndex: 2,
                        transform: slot.available
                          ? "translateY(-7px) scale(1.04)"
                          : "none",
                        boxShadow: isSelected
                          ? "0px 14px 28px rgba(18, 93, 163, 0.5)"
                          : slot.available
                            ? "0px 14px 25px rgba(0, 0, 0, 0.35), 0px 6px 10px rgba(0, 0, 0, 0.2)"
                            : "none",
                        borderColor: isSelected
                          ? "transparent"
                          : "var(--mui-palette-primary-main)",
                      },
                      "&:active": {
                        transform: slot.available
                          ? "translateY(-2px) scale(0.98)"
                          : "none",
                      },
                    }}
                  >
                    {slot.time || `${slot.from} - ${slot.to}`}
                  </Button>
                );
              })}
            </Box>
          )}
        </>
      )}
    </Card>
  );
};
