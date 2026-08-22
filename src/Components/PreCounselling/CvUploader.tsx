"use client";

import React, { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import { SectionHeader } from "@/Components/PreCounselling/SectionHeader";

interface CvUploaderProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
    uploading?: boolean;
    error?: string | null;
    maxSizeMB?: number;
    accept?: string;
}

export const CvUploader: React.FC<CvUploaderProps> = ({
    file,
    onFileChange,
    uploading = false,
    error,
    maxSizeMB = 5,
    accept = ".pdf,.doc,.docx",
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const validateAndSet = (candidate: File | undefined) => {
        if (!candidate) return;
        if (candidate.size > maxSizeMB * 1024 * 1024) {
            // eslint-disable-next-line no-alert
            alert(`File must be smaller than ${maxSizeMB}MB`);
            return;
        }
        onFileChange(candidate);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        validateAndSet(e.dataTransfer.files?.[0]);
    };

    const isSuccess = !!file && !uploading && !error;

    return (
        <Card className="p-5 sm:p-7 rounded-3xl border border-[var(--mui-palette-divider)] shadow-[0px_8px_24px_-12px_rgba(15,23,42,0.12)] mb-6">
            <SectionHeader
                icon="ri-file-upload-line"
                eyebrow="Step 5"
                title="Upload Your CV"
                description="Your TAC will review this ahead of the session."
                accentColor="warning"
            />

            <Box
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-200 ${isDragging
                    ? "border-[var(--mui-palette-primary-main)] bg-[color-mix(in_srgb,var(--mui-palette-primary-main)_6%,transparent)] scale-[1.01]"
                    : isSuccess
                        ? "border-[var(--mui-palette-success-main)] bg-[color-mix(in_srgb,var(--mui-palette-success-main)_6%,transparent)]"
                        : "border-[var(--mui-palette-divider)] hover:border-[var(--mui-palette-primary-main)]/50 hover:bg-[color-mix(in_srgb,var(--mui-palette-primary-main)_3%,transparent)]"
                    }`}
            >
                <Box
                    className="flex items-center justify-center rounded-full transition-transform duration-200"
                    style={{
                        width: 56,
                        height: 56,
                        background: isSuccess
                            ? "color-mix(in srgb, var(--mui-palette-success-main) 14%, transparent)"
                            : "color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent)",
                        transform: isDragging ? "translateY(-4px)" : "none",
                    }}
                >
                    <i
                        className={isSuccess ? "ri-file-check-line" : "ri-upload-cloud-2-line"}
                        style={{
                            fontSize: 26,
                            color: isSuccess ? "var(--mui-palette-success-main)" : "var(--mui-palette-primary-main)",
                        }}
                    />
                </Box>

                {file ? (
                    <Box className="flex items-center gap-2 max-w-full">
                        <Typography variant="body2" className="font-semibold truncate max-w-[220px]">
                            {file.name}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onFileChange(null);
                                if (inputRef.current) inputRef.current.value = "";
                            }}
                        >
                            <i className="ri-close-line text-lg" />
                        </IconButton>
                    </Box>
                ) : (
                    <Box className="text-center">
                        <Typography variant="body2" className="font-semibold">
                            Drag & drop your CV here, or{" "}
                            <span className="text-[var(--mui-palette-primary-main)]">browse files</span>
                        </Typography>
                        <Typography variant="caption" className="text-[var(--mui-palette-text-secondary)]">
                            PDF or Word, up to {maxSizeMB}MB
                        </Typography>
                    </Box>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    hidden
                    accept={accept}
                    onChange={(e) => validateAndSet(e.target.files?.[0])}
                />
            </Box>

            {uploading && <LinearProgress className="mt-3 rounded-full" />}
            {error && (
                <Box className="flex items-center gap-1.5 mt-3">
                    <i className="ri-error-warning-line text-[var(--mui-palette-error-main)]" style={{ fontSize: 15 }} />
                    <Typography variant="caption" className="text-[var(--mui-palette-error-main)]">
                        {error}
                    </Typography>
                </Box>
            )}
        </Card>
    );
};