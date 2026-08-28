"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface SectionHeaderProps {
    icon: string;
    eyebrow?: string;
    title: string;
    description?: string;
    accentColor?: "primary" | "success" | "info" | "warning";
}

export const SectionHeader = ({
    icon,
    eyebrow,
    title,
    description,
    accentColor = "primary",
}: SectionHeaderProps) => {
    const colors = {
        primary: "var(--mui-palette-primary-main)",
        success: "var(--mui-palette-success-main)",
        info: "var(--mui-palette-info-main)",
        warning: "var(--mui-palette-warning-main)",
    };

    const color = colors[accentColor];

    return (
        <Box className="flex items-start gap-3 mb-5">
            <Box
                className="flex items-center justify-center rounded-xl shrink-0"
                sx={{
                    width: 42,
                    height: 42,
                    color,
                    backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
                }}
            >
                <i className={icon} style={{ fontSize: 20 }} />
            </Box>

            <Box>
                {eyebrow && (
                    <Typography
                        variant="caption"
                        className="font-semibold uppercase tracking-wide"
                        sx={{ color }}
                    >
                        {eyebrow}
                    </Typography>
                )}

                <Typography variant="h6" className="font-bold leading-tight">
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
};