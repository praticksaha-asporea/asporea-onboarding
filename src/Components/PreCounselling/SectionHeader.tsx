"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface SectionHeaderProps {
    icon: string; // remixicon class, e.g. "ri-user-voice-line"
    eyebrow: string; // e.g. "STEP 2"
    title: string;
    description?: string;
    accentColor?: "primary" | "secondary" | "success" | "warning";
}

const accentMap: Record<string, string> = {
    primary: "var(--mui-palette-primary-main)",
    secondary: "var(--mui-palette-secondary-main)",
    success: "var(--mui-palette-success-main)",
    warning: "var(--mui-palette-warning-main)",
};

/**
 * The repeating visual signature for this flow: a soft circular icon badge
 * next to a tracked-out eyebrow label and a bold title. Used at the top of
 * every section card so the whole page reads as one scannable checklist.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
    icon,
    eyebrow,
    title,
    description,
    accentColor = "primary",
}) => {
    const accent = accentMap[accentColor];

    return (
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
                    {eyebrow}
                </Typography>
                <Typography variant="h6" className="font-bold leading-snug -mt-0.5">
                    {title}
                </Typography>
                {description && (
                    <Typography variant="body2" className="text-[var(--mui-palette-text-secondary)] mt-0.5">
                        {description}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};