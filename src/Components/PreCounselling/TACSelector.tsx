"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import { SectionHeader } from "@/Components/PreCounselling/SectionHeader";

export interface TAC {
    id: string;
    name: string;
    photoUrl?: string;
    designation?: string;
    experienceYears?: number;
    rating?: number;
    languages?: string[];
    specialization?: string[];
    bio?: string;
}

interface TACSelectorProps {
    tacs: TAC[];
    selectedTacId: string | null;
    onSelect: (tacId: string) => void;
    loading?: boolean;
    disabled?: boolean;
    title?: string;
    emptyStateMessage?: string;
}

/**
 * Reusable TAC (Talent Acquisition Consultant) picker.
 * Purely presentational — feed it `tacs` from any source and it renders + selects.
 */
export const TACSelector: React.FC<TACSelectorProps> = ({
    tacs,
    selectedTacId,
    onSelect,
    loading = false,
    disabled = false,
    title = "Choose Your Preferred TAC",
    emptyStateMessage = "No TAC (Talent Acquisition Consultant) available yet. Your branch will assign one shortly.",
}) => {
    const [detailTac, setDetailTac] = useState<TAC | null>(null);

    return (
        <Card className="p-5 sm:p-7 rounded-3xl border border-[var(--mui-palette-divider)] shadow-[0px_8px_24px_-12px_rgba(15,23,42,0.12)] mb-6">
            <SectionHeader
                icon="ri-user-star-line"
                eyebrow="Step 3"
                title={title}
                description="Your dedicated point of contact for this session."
                accentColor="primary"
            />

            {loading ? (
                <Box className="flex flex-col gap-3">
                    {[1, 2].map((i) => (
                        <Box key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--mui-palette-divider)]">
                            <Skeleton variant="circular" width={52} height={52} />
                            <Box className="flex-1">
                                <Skeleton variant="text" width="40%" />
                                <Skeleton variant="text" width="60%" />
                            </Box>
                            <Skeleton variant="rounded" width={100} height={34} />
                        </Box>
                    ))}
                </Box>
            ) : tacs.length === 0 ? (
                <Box className="flex flex-col items-center text-center gap-2 py-8">
                    <i className="ri-user-search-line text-4xl text-[var(--mui-palette-text-secondary)]" />
                    <Typography variant="body2" className="text-[var(--mui-palette-text-secondary)] max-w-sm">
                        {emptyStateMessage}
                    </Typography>
                </Box>
            ) : (
                <Box className="flex flex-col gap-3">
                    {tacs.map((tac) => {
                        const isSelected = selectedTacId === tac.id;
                        return (
                            <Box
                                key={tac.id}
                                onClick={() => !disabled && onSelect(tac.id)}
                                className={`group relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isSelected
                                    ? "border-[var(--mui-palette-primary-main)] bg-[color-mix(in_srgb,var(--mui-palette-primary-main)_6%,transparent)]"
                                    : "border-[var(--mui-palette-divider)] hover:border-[var(--mui-palette-primary-main)]/40 hover:-translate-y-0.5 hover:shadow-[0px_10px_24px_-14px_rgba(15,23,42,0.3)]"
                                    } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
                            >
                                <Box className="relative shrink-0">
                                    <Avatar
                                        src={tac.photoUrl}
                                        className="w-13 h-13"
                                        sx={{
                                            width: 52,
                                            height: 52,
                                            border: isSelected
                                                ? "2.5px solid var(--mui-palette-primary-main)"
                                                : "2.5px solid transparent",
                                        }}
                                    >
                                        {tac.name?.charAt(0)}
                                    </Avatar>
                                    {isSelected && (
                                        <Box
                                            className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full"
                                            style={{
                                                width: 20,
                                                height: 20,
                                                background: "var(--mui-palette-primary-main)",
                                                border: "2px solid white",
                                            }}
                                        >
                                            <i className="ri-check-line text-white" style={{ fontSize: 12 }} />
                                        </Box>
                                    )}
                                </Box>

                                <Box className="flex-1 min-w-0">
                                    <Box className="flex items-center gap-2 flex-wrap">
                                        <Typography variant="subtitle1" className="font-bold leading-tight">
                                            {tac.name}
                                        </Typography>
                                        {typeof tac.rating === "number" && (
                                            <Box className="flex items-center gap-0.5 text-amber-500">
                                                <i className="ri-star-fill" style={{ fontSize: 13 }} />
                                                <Typography variant="caption" className="font-semibold">
                                                    {tac.rating.toFixed(1)}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                    <Typography variant="body2" className="text-[var(--mui-palette-text-secondary)]">
                                        {tac.designation}
                                        {tac.experienceYears ? ` • ${tac.experienceYears} yrs exp` : ""}
                                    </Typography>
                                </Box>

                                <Button
                                    size="small"
                                    variant="text"
                                    className="normal-case rounded-lg shrink-0 font-semibold"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDetailTac(tac);
                                    }}
                                >
                                    Details
                                    <i className="ri-arrow-right-s-line ml-0.5" style={{ fontSize: 16 }} />
                                </Button>
                            </Box>
                        );
                    })}
                </Box>
            )}

            <Dialog
                open={!!detailTac}
                onClose={() => setDetailTac(null)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ className: "rounded-[28px] overflow-hidden" }}
            >
                {detailTac && (
                    <>
                        <Box
                            className="h-20 relative"
                            style={{
                                background:
                                    "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-primary-main) 85%, black 0%), var(--mui-palette-primary-main))",
                            }}
                        >
                            <IconButton
                                onClick={() => setDetailTac(null)}
                                size="small"
                                className="absolute top-2 right-2"
                                sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)" }}
                            >
                                <i className="ri-close-line" style={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>
                        <DialogContent className="p-6 pt-0">
                            <Box className="flex flex-col items-center text-center gap-3 -mt-10">
                                <Avatar
                                    src={detailTac.photoUrl}
                                    sx={{ width: 84, height: 84, border: "4px solid white", boxShadow: "0px 6px 18px rgba(0,0,0,0.15)" }}
                                >
                                    {detailTac.name?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" className="font-bold leading-tight">
                                        {detailTac.name}
                                    </Typography>
                                    <Typography variant="body2" className="text-[var(--mui-palette-text-secondary)]">
                                        {detailTac.designation}
                                    </Typography>
                                </Box>

                                {typeof detailTac.rating === "number" && (
                                    <Rating value={detailTac.rating} precision={0.5} readOnly size="small" />
                                )}

                                <Divider className="w-full my-1" />

                                {detailTac.experienceYears !== undefined && (
                                    <Box className="flex items-center gap-2 text-sm">
                                        <i className="ri-briefcase-4-line text-[var(--mui-palette-primary-main)]" />
                                        <Typography variant="body2">
                                            <strong>{detailTac.experienceYears} years</strong> of experience
                                        </Typography>
                                    </Box>
                                )}

                                {detailTac.languages && detailTac.languages.length > 0 && (
                                    <Box className="flex flex-wrap gap-1.5 justify-center">
                                        {detailTac.languages.map((lang) => (
                                            <Chip key={lang} label={lang} size="small" className="rounded-lg" />
                                        ))}
                                    </Box>
                                )}

                                {detailTac.specialization && detailTac.specialization.length > 0 && (
                                    <Box className="flex flex-wrap gap-1.5 justify-center">
                                        {detailTac.specialization.map((spec) => (
                                            <Chip
                                                key={spec}
                                                label={spec}
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                className="rounded-lg font-medium"
                                            />
                                        ))}
                                    </Box>
                                )}

                                {detailTac.bio && (
                                    <Typography variant="body2" className="text-[var(--mui-palette-text-secondary)] mt-1">
                                        {detailTac.bio}
                                    </Typography>
                                )}

                                <Button
                                    variant="contained"
                                    fullWidth
                                    disabled={disabled}
                                    className="rounded-xl normal-case mt-3 font-semibold py-2.5 shadow-none"
                                    onClick={() => {
                                        onSelect(detailTac.id);
                                        setDetailTac(null);
                                    }}
                                >
                                    Select {detailTac.name.split(" ")[0]}
                                </Button>
                            </Box>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </Card>
    );
};