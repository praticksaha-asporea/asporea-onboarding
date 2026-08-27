"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

export type StageStatus = "done" | "in_progress" | "pending" | "failed";

interface InquiryStageProgressProps {
    /** e.g. { stage1: "done", stage2: "done", stage3: "pending" } */
    stages: Record<string, string>;
    label?: string;
}

const statusConfig: Record<StageStatus, { color: string; icon: string }> = {
    done: { color: "var(--mui-palette-success-main)", icon: "ri-check-line" },
    in_progress: { color: "var(--mui-palette-primary-main)", icon: "" }, // uses CircularProgress instead
    pending: { color: "var(--mui-palette-text-disabled, #9ca3af)", icon: "ri-time-line" },
    failed: { color: "var(--mui-palette-error-main)", icon: "ri-close-line" },
};

const toLabel = (key: string) =>
    key.replace(/(\d+)/, " $1").replace(/^\w/, (c) => c.toUpperCase());

/**
 * Drop-in replacement for a read-only "Inquiry Stages" text field.
 * Renders each stage as a connected dot, colored + iconed by status,
 * with the connecting line lit up once the following stage has started.
 */
export const InquiryStageProgress: React.FC<InquiryStageProgressProps> = ({
    stages,
    label = "Inquiry Stages",
}) => {
    const entries = Object.entries(stages || {});

    return (
        <Box className="relative border border-[var(--mui-palette-divider)] rounded-xl px-5 pt-6 pb-4 h-full">
            <Typography
                variant="caption"
                className="absolute -top-2.5 left-3 px-1.5 font-medium text-[var(--mui-palette-text-secondary)]"
                sx={{ bgcolor: "var(--mui-palette-background-paper, #fff)" }}
            >
                {label}
            </Typography>

            <Box className="flex items-start">
                {entries.map(([key, rawStatus], i) => {
                    const status = (rawStatus as StageStatus) in statusConfig ? (rawStatus as StageStatus) : "pending";
                    const cfg = statusConfig[status];
                    const isLast = i === entries.length - 1;
                    const nextStatus = !isLast ? entries[i + 1][1] : null;
                    const lineActive = nextStatus === "done" || nextStatus === "in_progress";

                    return (
                        <React.Fragment key={key}>
                            <Box className="flex flex-col items-center gap-1 shrink-0" style={{ width: 76 }}>
                                <Box
                                    className="flex items-center justify-center rounded-full shrink-0"
                                    style={{
                                        width: 30,
                                        height: 30,
                                        background: status === "pending" ? "transparent" : `color-mix(in srgb, ${cfg.color} 14%, transparent)`,
                                        border: `2px solid ${cfg.color}`,
                                    }}
                                >
                                    {status === "in_progress" ? (
                                        <CircularProgress size={14} thickness={6} sx={{ color: cfg.color }} />
                                    ) : (
                                        <i className={cfg.icon} style={{ fontSize: 15, color: cfg.color }} />
                                    )}
                                </Box>
                                <Typography variant="caption" className="font-semibold text-center leading-tight" style={{ color: cfg.color }}>
                                    {toLabel(key)}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    className="text-center leading-tight capitalize"
                                    style={{ fontSize: 10, color: "var(--mui-palette-text-secondary)" }}
                                >
                                    {status.replace("_", " ")}
                                </Typography>
                            </Box>

                            {!isLast && (
                                <Box
                                    className="flex-1 h-[2px] mx-1"
                                    style={{
                                        marginTop: 14, // align with the center of the 30px circle
                                        background: lineActive ? "var(--mui-palette-success-main)" : "var(--mui-palette-divider)",
                                    }}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </Box>
        </Box>
    );
};