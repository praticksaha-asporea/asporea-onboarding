"use client";

import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import clsx from "clsx";
import { ExperienceOption } from "@/Types/Frontend_Payload/experience.types";

interface ExperienceCardProps {
  type: ExperienceOption;
  isSelected: boolean;
  onSelect: () => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ type, isSelected, onSelect }) => {
  return (
    <Grid size={{ xs: 12, sm: 3 }}>
      <Card
        onClick={onSelect}
        className={clsx(
          "h-full pt-12 px-4 pb-6 cursor-pointer rounded-[16px] border-2 transition-all duration-200 ease-in-out flex flex-col items-center text-center",
          isSelected
            ? "border-[#1976d2] border-4 bg-[--mui-palette-secondary-darkerOpacity] shadow-[0_10px_25px_-5px_rgba(25,118,210,0.1),_0_8px_10px_-6px_rgba(25,118,210,0.1)]"
            : "border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),_0_2px_4px_-2px_rgba(0,0,0,0.05)] hover:border-[#d1d5db] hover:-translate-y-0.5",
        )}
      >
        <Box
          className={clsx(
            "w-16 h-16 rounded-full flex items-center justify-center mb-6",
            isSelected ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]" : "bg-[#f0f7ff] shadow-none",
          )}
        >
          <i className={`${type.icon} text-[var(--mui-palette-primary-main)] text-[28px]`}></i>
        </Box>
        <Typography variant="h6" className="font-extrabold mb-3">
          {type.title}
        </Typography>
        <Typography variant="body2" className="leading-6">
          {type.description}
        </Typography>
      </Card>
    </Grid>
  );
};