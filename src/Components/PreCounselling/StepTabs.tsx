"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";

export interface StepTabConfig {
    id: string;
    label: string;
    icon: string; // remixicon class
    accent: "primary" | "secondary" | "warning" | "success";
}

interface StepTabsProps {
    steps: StepTabConfig[];
    activeIndex: number;
    completed: boolean[];
    disabled?: boolean[]; // step is unreachable yet (dependency not met)
    disabledReason?: (string | undefined)[];
    onSelect: (index: number) => void;
}

const accentMap: Record<string, string> = {
    primary: "var(--mui-palette-primary-main)",
    secondary: "var(--mui-palette-secondary-main)",
    warning: "var(--mui-palette-warning-main)",
    success: "var(--mui-palette-success-main)",
};

export const StepTabs: React.FC<StepTabsProps> = ({
    steps,
    activeIndex,
    completed,
    disabled = [],
    disabledReason = [],
    onSelect,
}) => {
    return (
        <Box className="relative mb-6 overflow-x-auto p-1">
            <Box className="flex items-start gap-1 min-w-max sm:min-w-0 sm:justify-between relative px-1">
                <Box className="absolute top-5 left-6 right-6 h-[2px] -z-0" sx={{ bgcolor: "var(--mui-palette-divider)" }} />
                {steps.map((step, i) => {
                    const isActive = i === activeIndex;
                    const isDone = completed[i];
                    const isLocked = !!disabled[i];
                    const accent = accentMap[step.accent];

                    const tab = (
                        <Box
                            key={step.id}
                            onClick={() => !isLocked && onSelect(i)}
                            className={`relative z-10 flex flex-col items-center gap-1.5 px-2 sm:px-1 group ${isLocked ? "cursor-not-allowed" : "cursor-pointer"
                                }`}
                            style={{ minWidth: 76 }}
                        >
                            <Box
                                className="flex items-center justify-center rounded-full transition-all duration-200 shrink-0"
                                style={{
                                    width: 40,
                                    height: 40,
                                    background: isLocked
                                        ? "var(--mui-palette-background-paper, #fff)"
                                        : isDone
                                            ? "var(--mui-palette-success-main)"
                                            : isActive
                                                ? accent
                                                : "var(--mui-palette-background-paper, #fff)",
                                    border: isActive || isDone ? "none" : "2px solid var(--mui-palette-divider)",
                                    boxShadow: isActive ? `0px 6px 16px -4px ${accent}` : "none",
                                    transform: isActive ? "scale(1.08)" : "scale(1)",
                                    opacity: isLocked ? 0.5 : 1,
                                }}
                            >
                                {isLocked ? (
                                    <i className="ri-lock-2-line" style={{ fontSize: 15, color: "var(--mui-palette-text-secondary)" }} />
                                ) : isDone ? (
                                    <i className="ri-check-line text-white" style={{ fontSize: 18 }} />
                                ) : (
                                    <i
                                        className={step.icon}
                                        style={{ fontSize: 17, color: isActive ? "white" : "var(--mui-palette-text-secondary)" }}
                                    />
                                )}
                            </Box>
                            <Typography
                                variant="caption"
                                className="font-semibold text-center leading-tight transition-colors duration-200"
                                style={{
                                    color: isLocked
                                        ? "var(--mui-palette-text-secondary)"
                                        : isActive
                                            ? accent
                                            : isDone
                                                ? "var(--mui-palette-success-main)"
                                                : "var(--mui-palette-text-secondary)",
                                    opacity: isLocked ? 0.6 : 1,
                                }}
                            >
                                {step.label}
                            </Typography>
                        </Box>
                    );

                    return isLocked && disabledReason[i] ? (
                        <Tooltip key={step.id} title={disabledReason[i]} arrow>
                            {tab}
                        </Tooltip>
                    ) : (
                        tab
                    );
                })}
            </Box>
        </Box>
    );
};