import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface SectionHeaderProps {
  icon: string;
  step: string;
  title: string;
  description?: string;
  accent?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  step,
  title,
  description,
  accent = "var(--mui-palette-primary-main)",
}) => (
  <Box className="flex items-start gap-4 mb-5">
    <Box
      className="flex items-center justify-center rounded-2xl shrink-0"
      style={{
        width: 44,
        height: 44,
        background: `color-mix(in srgb, ${accent} 12%, transparent)`,
      }}
    >
      <i className={icon} style={{ fontSize: 22, color: accent }} />
    </Box>
    <Box className="min-w-0">
      <Typography
        variant="caption"
        className="font-bold tracking-widest uppercase"
        style={{ color: accent, letterSpacing: "0.08em" }}
      >
        {step}
      </Typography>
      <Typography variant="h6" className="font-bold leading-snug -mt-0.5">
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          className="text-[var(--mui-palette-text-secondary)] mt-0.5"
        >
          {description}
        </Typography>
      )}
    </Box>
  </Box>
);