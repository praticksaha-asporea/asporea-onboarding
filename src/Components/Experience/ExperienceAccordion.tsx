"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Chip from "@mui/material/Chip";

interface SectionAccordionProps {
  title: string;
  status?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export const ExperienceAccordion: React.FC<SectionAccordionProps> = ({ title, status, defaultExpanded = false, children }) => {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      className="mb-3 overflow-hidden shadow-sm before:hidden border-dashed border-[var(--mui-palette-divider)] rounded-xl"
    >
      <AccordionSummary
        expandIcon={
          <Box className="w-8 h-8 rounded-full flex items-center justify-center">
            <i className="ri-arrow-down-s-line text-xl"></i>
          </Box>
        }
        className="p-3 bg-[var(--mui-overlays-1)] hover:bg-[var(--mui-palette-primary-lightOpacity)]"
      >
        <Box className="flex items-center gap-2">
          <Typography className="text-base font-extrabold">{title}</Typography>
          {status === "uploaded" && (
            <Chip label="Uploaded" size="small" className="bg-blue-50 text-[var(--mui-palette-primary-main)] font-extrabold text-xs h-6 rounded border border-green-200" />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails className="p-4 bg-[var(--mui-palette-background-paper)]">
        {children}
      </AccordionDetails>
    </Accordion>
  );
};