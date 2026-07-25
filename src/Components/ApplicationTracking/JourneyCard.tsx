"use client";

import React from "react";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { StatusBadge } from "./StatusBadge";

interface JourneyCardProps {
  title: string;
  status: string;
  dateLabel?: string;
  date?: string;
  description: React.ReactNode;
  buttonLabel?: string | null;
  disabledButton?: boolean;
  onClick?: () => void;
  secondaryButtonLabel?: string | null;
  onSecondaryClick?: () => void;
  disabledCard?: boolean;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({
  title, status, dateLabel, date, description, buttonLabel, 
  disabledButton, onClick, secondaryButtonLabel, onSecondaryClick, disabledCard,
}) => {
  return (
    <Card
      variant="outlined"
      className={`mb-6 p-6 sm:p-8 rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 ${disabledCard ? "opacity-50 pointer-events-none" : "hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"}`}
    >
      <Box className="flex justify-between items-start mb-6">
        <Typography variant="h6" className="text-[0.9rem] mt-1">{title}</Typography>

        <Box className="flex flex-col items-end gap-2">
          <StatusBadge status={status} />
          {dateLabel && date && (
            <Typography variant="caption" className="font-normal whitespace-nowrap text-[var(--mui-palette-text-secondary)]">
              {dateLabel}: <span className="font-normal text-[var(--mui-palette-text-secondary)]">{date}</span>
            </Typography>
          )}
        </Box>
      </Box>

      <Typography variant="body2" className=" leading-[1.6] mb-6">{description}</Typography>

      <Box className="flex justify-end items-center pt-5 gap-4">
        {secondaryButtonLabel && (
          <Button
            variant="outlined"
            onClick={onSecondaryClick}
            className="rounded-[8px] px-6 py-2 normal-case bg-var(--mui-palette-primary-main) shadow-none hover:bg-var(--mui-palette-secondary-lighter) hover:shadow-none transition-colors duration-150 disabled:bg-[#e3f2fd] disabled:text-[#93c5fd] disabled:cursor-not-allowed" //text-white 
          >
            {secondaryButtonLabel}
          </Button>
        )}
        {buttonLabel && (
          <Button
            variant="contained"
            disabled={disabledButton}
            onClick={onClick}
            className={`rounded-[8px] px-6 py-2 normal-case text-white shadow-none transition-colors duration-150
              ${buttonLabel === "Scheduled" ? "bg-[var(--mui-palette-primary-main)] !text-white disabled:!bg-[var(--mui-palette-primary-main)] disabled:!text-white opacity-65 cursor-not-allowed pointer-events-none" : "bg-[var(--mui-palette-primary-main)] hover:bg-[var(--mui-palette-primary-dark)] disabled:bg-[var(--mui-palette-action-disabledBackground)] disabled:text-[var(--mui-palette-action-disabled)]"}`}
          >
            {buttonLabel}
          </Button>
        )}
      </Box>
    </Card>
  );
};