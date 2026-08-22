"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { SectionHeader } from "@/Components/PreCounselling/SectionHeader";

export type CounsellingMode = "on" | "off";

export interface AssignedBranch {
    _id: string;
    title: string;
    city?: string;
}

interface ModeBranchSelectorProps {
    mode: CounsellingMode;
    onModeChange: (mode: CounsellingMode) => void;
    branch: AssignedBranch | null;
    disabled?: boolean;
}

const MODE_OPTIONS: { value: CounsellingMode; label: string; icon: string; hint: string }[] = [
    { value: "on", label: "Online", icon: "ri-vidicon-line", hint: "Video / phone call" },
    { value: "off", label: "In-Person", icon: "ri-building-4-line", hint: "Visit the branch" },
];

/**
 * Branch is assigned to the candidate by the backend (reduxUser.branch) —
 * this just displays it. Mode is the one thing the candidate can actually
 * change here, and switching it re-scopes the TAC list (see usePreCounselling).
 */
export const ModeBranchSelector: React.FC<ModeBranchSelectorProps> = ({
    mode,
    onModeChange,
    branch,
    disabled = false,
}) => {
    return (
        <Card className="p-5 sm:p-7 rounded-3xl border border-[var(--mui-palette-divider)] shadow-[0px_8px_24px_-12px_rgba(15,23,42,0.12)] mb-6">
            <SectionHeader
                icon="ri-route-line"
                eyebrow="Step 2"
                title="Session Mode & Branch"
                description="Choose how you'd like to connect with your TAC."
                accentColor="secondary"
            />

            <Box className="flex flex-col md:flex-row md:items-center gap-6">
                <Box className="flex gap-2 p-1 rounded-2xl bg-[var(--mui-overlays-1,_rgba(0,0,0,0.03))] w-fit">
                    {MODE_OPTIONS.map((opt) => {
                        const isActive = mode === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={disabled}
                                onClick={() => onModeChange(opt.value)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                    ? "bg-white shadow-[0px_4px_14px_-4px_rgba(15,23,42,0.25)] text-[var(--mui-palette-primary-main)]"
                                    : "text-[var(--mui-palette-text-secondary)] hover:text-[var(--mui-palette-text-primary)]"
                                    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                <i className={opt.icon} style={{ fontSize: 17 }} />
                                {opt.label}
                            </button>
                        );
                    })}
                </Box>

                <Box className="flex flex-col gap-1.5">
                    <Typography
                        variant="caption"
                        className="font-semibold uppercase text-[var(--mui-palette-text-secondary)]"
                        style={{ letterSpacing: "0.06em" }}
                    >
                        Your Branch
                    </Typography>
                    {branch ? (
                        <Chip
                            icon={<i className="ri-map-pin-2-fill" style={{ fontSize: 15, marginLeft: 10 }} />}
                            label={branch.city ? `${branch.title} — ${branch.city}` : branch.title}
                            className="w-fit font-semibold rounded-xl"
                            sx={{
                                bgcolor: "color-mix(in srgb, var(--mui-palette-secondary-main) 10%, transparent)",
                                color: "var(--mui-palette-secondary-main)",
                                px: 0.5,
                                py: 2,
                            }}
                        />
                    ) : (
                        <Typography variant="caption" className="text-[var(--mui-palette-text-secondary)] max-w-xs">
                            No branch assigned yet — please contact the FOE at your nearest branch.
                        </Typography>
                    )}
                </Box>
            </Box>
        </Card>
    );
};