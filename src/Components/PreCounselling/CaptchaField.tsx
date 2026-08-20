"use client";

import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";

import {
    loadCaptchaEnginge,
    LoadCanvasTemplate,
    validateCaptcha,
} from "react-simple-captcha";

import { SectionHeader } from "@/Components/PreCounselling/SectionHeader";

interface CaptchaFieldProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: boolean;
    helperText?: string;
    onVerifiedChange: (verified: boolean) => void;
}

export const CaptchaField: React.FC<CaptchaFieldProps> = ({
    value,
    onChange,
    onBlur,
    error = false,
    helperText,
    onVerifiedChange,
}) => {
    useEffect(() => {
        loadCaptchaEnginge(5);
        onVerifiedChange(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const verifyCaptcha = (captchaValue: string) => {
        if (!captchaValue.trim()) {
            onVerifiedChange(false);
            return;
        }
        const isValid = validateCaptcha(captchaValue);
        onVerifiedChange(isValid);
    };

    const handleRefresh = () => {
        loadCaptchaEnginge(5);
        onChange("");
        onVerifiedChange(false);
    };

    return (
        <Card className="p-5 sm:p-7 rounded-3xl border border-[var(--mui-palette-divider)] shadow-[0px_8px_24px_-12px_rgba(15,23,42,0.12)] mb-6">
            <SectionHeader
                icon="ri-shield-check-line"
                eyebrow="Step 6"
                title="Quick Verification"
                description="Confirm you're not a robot to finish up."
                accentColor="success"
            />

            <Box className="flex items-start gap-3 flex-wrap">
                <Box className="rounded-xl overflow-hidden shadow-[0px_2px_8px_rgba(15,23,42,0.08)]">
                    <LoadCanvasTemplate reloadText=" " reloadColor="#125da3" />
                </Box>

                <IconButton
                    onClick={handleRefresh}
                    aria-label="Refresh captcha"
                    className="rounded-xl"
                    sx={{ bgcolor: "color-mix(in srgb, var(--mui-palette-primary-main) 8%, transparent)" }}
                >
                    <i className="ri-refresh-line text-lg" />
                </IconButton>

                <TextField
                    size="small"
                    placeholder="Enter the code above"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        onVerifiedChange(false);
                    }}
                    onBlur={onBlur}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            verifyCaptcha(value);
                        }
                    }}
                    error={error}
                    helperText={helperText || " "}
                    className="max-w-xs"
                    autoComplete="off"
                    InputProps={{
                        className: "rounded-xl",
                        endAdornment:
                            value && !error ? (
                                <InputAdornment position="end">
                                    <i className="ri-checkbox-circle-fill text-[var(--mui-palette-success-main)]" style={{ fontSize: 18 }} />
                                </InputAdornment>
                            ) : undefined,
                    }}
                />

                <button
                    type="button"
                    onClick={() => verifyCaptcha(value)}
                    className="px-4 py-2 rounded-xl bg-[#125da3] text-white text-sm font-medium hover:bg-[#0d4c88] transition-colors"
                >
                    Verify
                </button>
            </Box>
        </Card>
    );
};