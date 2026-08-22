"use client";

import React from "react";
import {
    Avatar,
    Box,
    Chip,
    Dialog,
    DialogContent,
    Divider,
    IconButton,
    Typography,
} from "@mui/material";

import { CamelCase } from "@/Utils/common";
import { IUser } from "@/lib/models/User.model";

interface TacProfileDialogProps {
    open: boolean;
    tac: IUser | null;
    onClose: () => void;
}

const InfoSection = ({
    icon,
    title,
    items,
}: {
    icon: string;
    title: string;
    items?: string[];
}) => {
    if (!items?.length) return null;

    return (
        <Box className="w-full">
            {/* Section Header */}
            <Box className="flex items-center gap-2 mb-3">
                <Box
                    className="
            flex items-center justify-center
            rounded-xl
            bg-[color-mix(in_srgb,var(--mui-palette-primary-main)_10%,transparent)]
            text-[var(--mui-palette-primary-main)]
            shrink-0
          "
                    sx={{
                        width: 34,
                        height: 34,
                    }}
                >
                    <i className={icon} style={{ fontSize: 17 }} />
                </Box>

                <Typography
                    variant="subtitle2"
                    className="
            font-bold
            text-[var(--mui-palette-text-primary)]
            leading-none
          "
                >
                    {title}
                </Typography>
            </Box>

            {/* Tags */}
            <Box className="flex flex-wrap gap-2 pl-[42px]">
                {items.map((item, index) => (
                    <Box
                        key={`${item}-${index}`}
                        className="
              inline-flex
              items-center
              px-3
              py-1.5
              rounded-lg
              border
              border-[var(--mui-palette-divider)]
              bg-[color-mix(in_srgb,var(--mui-palette-background-paper)_65%,transparent)]
              text-[var(--mui-palette-text-secondary)]
              transition-all
              duration-150
              hover:border-[var(--mui-palette-primary-main)]
              hover:text-[var(--mui-palette-primary-main)]
            "
                    >
                        <Typography
                            variant="caption"
                            className="font-medium leading-none"
                        >
                            {CamelCase(item)}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

const RatingStars = ({ rating }: { rating: number }) => {
    return (
        <Box className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, index) => {
                const starValue = index + 1;

                let icon = "ri-star-line";

                if (rating >= starValue) {
                    icon = "ri-star-fill";
                } else if (rating >= starValue - 0.5) {
                    icon = "ri-star-half-fill";
                }

                return (
                    <i
                        key={index}
                        className={`${icon} text-amber-500`}
                        style={{ fontSize: 16 }}
                    />
                );
            })}
        </Box>
    );
};

export const TacProfileDialog: React.FC<TacProfileDialogProps> = ({
    open,
    tac,
    onClose,
}) => {
    if (!tac) return null;

    const rating = tac.tacProfile?.rating ?? 0;

    const experienceYears = tac.experienceInMonths
        ? Number((tac.experienceInMonths / 12).toFixed(2))
        : 0;

    const mode = tac.tacProfile?.mode;

    const availability =
        mode === "both"
            ? {
                label: "Online & In-Person",
                icon: "ri-global-line",
            }
            : mode === "online"
                ? {
                    label: "Online",
                    icon: "ri-computer-line",
                }
                : {
                    label: "In-Person",
                    icon: "ri-building-line",
                };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            scroll="paper"
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    overflow: "hidden",
                    backgroundImage: "none",

                    // Important
                    height: "min(90vh, 800px)",
                    maxHeight: "90vh",

                    display: "flex",
                    flexDirection: "column",
                },
            }}
        >
            {/* ================= HEADER ================= */}
            <Box className="shrink-0">
                {/* Cover */}
                <Box
                    className="relative h-36"
                    sx={{
                        background:
                            "linear-gradient(135deg, var(--mui-palette-primary-main), color-mix(in srgb, var(--mui-palette-primary-main) 55%, #ffffff))",
                    }}
                >
                    <IconButton
                        onClick={onClose}
                        aria-label="Close profile"
                        className="absolute top-4 right-4"
                        sx={{
                            color: "white",
                            bgcolor: "rgba(255,255,255,0.16)",
                            backdropFilter: "blur(8px)",
                            "&:hover": {
                                bgcolor: "rgba(255,255,255,0.25)",
                            },
                        }}
                    >
                        <i className="ri-close-line text-xl" />
                    </IconButton>
                </Box>

                {/* Profile Identity */}
                <Box className="px-6 pb-4">
                    <Box className="flex items-end gap-5 -mt-10">
                        <Avatar
                            src={tac.profilePic as unknown as string}
                            sx={{
                                width: 88,
                                height: 88,
                                border: "4px solid var(--mui-palette-background-paper)",
                                boxShadow: "0 4px 14px rgba(15,23,42,0.15)",
                                fontSize: 28,
                                fontWeight: 700,
                                flexShrink: 0,
                            }}
                        >
                            {tac.firstName?.charAt(0)}
                        </Avatar>

                        <Box className="flex-1 min-w-0 pb-1">
                            <Typography
                                variant="h6"
                                className="font-bold leading-tight truncate"
                            >
                                {tac.firstName} {tac.lastName}
                            </Typography>

                            <Typography
                                variant="body2"
                                className="text-[var(--mui-palette-text-secondary)] mt-1"
                            >
                                {CamelCase(tac.tacProfile?.designation || "TAC")}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Rating + Availability */}
                    <Box className="flex items-center gap-2 flex-wrap mt-4">
                        {typeof tac.tacProfile?.rating === "number" && (
                            <Box
                                className="
              inline-flex items-center gap-2
              px-3 py-1.5 rounded-full
              bg-[color-mix(in_srgb,#f59e0b_10%,transparent)]
            "
                            >
                                <RatingStars rating={rating} />

                                <Typography
                                    variant="caption"
                                    className="font-bold text-amber-500"
                                >
                                    {rating.toFixed(1)}
                                </Typography>
                            </Box>
                        )}

                        <Box
                            className="
            inline-flex items-center gap-1.5
            px-3 py-1.5 rounded-full
            bg-[color-mix(in_srgb,var(--mui-palette-success-main)_8%,transparent)]
            text-[var(--mui-palette-success-main)]
          "
                        >
                            <i
                                className={availability.icon}
                                style={{ fontSize: 15 }}
                            />

                            <Typography variant="caption" className="font-semibold">
                                {availability.label}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* ================= SCROLLABLE CONTENT ================= */}
            <DialogContent
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",

                    p: 0,

                    borderTop: "1px solid",
                    borderColor: "var(--mui-palette-divider)",

                    // Better scrollbar
                    "&::-webkit-scrollbar": {
                        width: "7px",
                    },

                    "&::-webkit-scrollbar-track": {
                        background: "transparent",
                    },

                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor:
                            "color-mix(in srgb, var(--mui-palette-text-secondary) 35%, transparent)",
                        borderRadius: "10px",
                    },

                    "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor:
                            "color-mix(in srgb, var(--mui-palette-text-secondary) 55%, transparent)",
                    },

                    scrollbarWidth: "thin",
                }}
            >
                <Box className="px-6 py-5 flex flex-col gap-6">

                    {/* ================= ABOUT ================= */}
                    {tac.bio?.trim() && (
                        <>
                            <Box>
                                <Box className="flex items-center gap-2 mb-3">
                                    <Box
                                        className="
                                        flex items-center justify-center
                                        rounded-xl
                                        shrink-0
                                        bg-[color-mix(in_srgb,var(--mui-palette-primary-main)_10%,transparent)]
                                        text-[var(--mui-palette-primary-main)]
                                        "
                                        sx={{
                                            width: 34,
                                            height: 34,
                                        }}
                                    >
                                        <i
                                            className="ri-user-3-line"
                                            style={{ fontSize: 17 }}
                                        />
                                    </Box>

                                    <Typography
                                        variant="subtitle2"
                                        className="font-bold"
                                    >
                                        About
                                    </Typography>
                                </Box>

                                <Box
                                    className="
                                        ml-[42px]
                                        px-4 py-3.5
                                        rounded-xl
                                        border
                                        border-[var(--mui-palette-divider)]
                                    "
                                >
                                    <Typography
                                        variant="body2"
                                        className="
                                        text-[var(--mui-palette-text-secondary)]
                                        leading-relaxed
                                        "
                                    >
                                        {tac.bio}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider />
                        </>
                    )}

                    {/* ================= EXPERIENCE / RATING ================= */}
                    <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Box
                            className="
            rounded-2xl
            px-4 py-3.5
            border
            border-[var(--mui-palette-divider)]
            bg-[color-mix(in_srgb,var(--mui-palette-primary-main)_5%,transparent)]
          "
                        >
                            <Box className="flex items-center gap-2 mb-1">
                                <i
                                    className="ri-briefcase-4-line text-[var(--mui-palette-primary-main)]"
                                    style={{ fontSize: 18 }}
                                />

                                <Typography
                                    variant="caption"
                                    className="text-[var(--mui-palette-text-secondary)] font-medium"
                                >
                                    Experience
                                </Typography>
                            </Box>

                            <Typography variant="subtitle1" className="font-bold">
                                {experienceYears
                                    ? `${experienceYears} ${experienceYears === 1 ? "Year" : "Years"
                                    }`
                                    : "Not specified"}
                            </Typography>
                        </Box>

                        <Box
                            className="
            rounded-2xl
            px-4 py-3.5
            border
            border-[var(--mui-palette-divider)]
            bg-[color-mix(in_srgb,var(--mui-palette-success-main)_5%,transparent)]
          "
                        >
                            <Box className="flex items-center gap-2 mb-1">
                                <i
                                    className="ri-user-star-line text-[var(--mui-palette-success-main)]"
                                    style={{ fontSize: 18 }}
                                />

                                <Typography
                                    variant="caption"
                                    className="text-[var(--mui-palette-text-secondary)] font-medium"
                                >
                                    Rating
                                </Typography>
                            </Box>

                            <Typography variant="subtitle1" className="font-bold">
                                {typeof tac.tacProfile?.rating === "number"
                                    ? `${rating.toFixed(1)} / 5`
                                    : "Not rated"}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider />

                    {/* ================= EXPERTISE ================= */}
                    <InfoSection
                        icon="ri-lightbulb-line"
                        title="Areas of Expertise"
                        items={tac.tacProfile?.areasOfExp}
                    />

                    {/* ================= INDUSTRY ================= */}
                    <InfoSection
                        icon="ri-building-4-line"
                        title="Industry Expertise"
                        items={tac.tacProfile?.industryExp}
                    />

                    {/* ================= SPECIALIZATION ================= */}
                    <InfoSection
                        icon="ri-focus-3-line"
                        title="Specialization"
                        items={tac.tacProfile?.specialization}
                    />

                    {/* ================= LANGUAGES ================= */}
                    <InfoSection
                        icon="ri-translate-2"
                        title="Languages Known"
                        items={tac.tacProfile?.languagesKnown}
                    />

                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default TacProfileDialog;