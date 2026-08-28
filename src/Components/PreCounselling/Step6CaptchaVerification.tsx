import React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { LoadCanvasTemplate } from "react-simple-captcha";
import { SectionHeader } from "./SectionHeader";
import { sectionCardClass } from "./HeaderCard";

interface Step6CaptchaVerificationProps {
  handleCaptchaRefresh: () => void;
  captchaValue: string;
  handleCaptchaChange: (val: string) => void;
  handleCaptchaVerify: () => void;
  captchaVerified: boolean;
  canConfirm: boolean;
  handleConfirm: () => void;
  bookingLoading: boolean;
}

export const Step6CaptchaVerification: React.FC<
  Step6CaptchaVerificationProps
> = ({
  handleCaptchaRefresh,
  captchaValue,
  handleCaptchaChange,
  handleCaptchaVerify,
  captchaVerified,
  canConfirm,
  handleConfirm,
  bookingLoading,
}) => {
  return (
    <>
      <Card className={sectionCardClass}>
        <SectionHeader
          icon="ri-shield-check-line"
          step="Step 6"
          title="Quick Verification"
          description="Confirm you're not a robot to finish up."
          accent="var(--mui-palette-success-main)"
        />
        <Box className="flex items-start gap-3 flex-wrap">
          <Box
            className="rounded-xl overflow-hidden shadow-[0px_2px_8px_rgba(15,23,42,0.08)] flex items-center justify-center shrink-0"
            sx={{
              width: 100,
              height: 40,
              minWidth: 100,
              minHeight: 40,
              "& canvas": {
                width: "100px !important",
                height: "40px !important",
                display: "block",
              },
            }}
          >
            <LoadCanvasTemplate reloadText=" " reloadColor="#125da3" />
          </Box>
          <IconButton
            onClick={handleCaptchaRefresh}
            aria-label="Refresh captcha"
            className="rounded-xl"
            sx={{
              bgcolor:
                "color-mix(in srgb, var(--mui-palette-primary-main) 8%, transparent)",
            }}
          >
            <i className="ri-refresh-line text-lg" />
          </IconButton>
          <TextField
            size="small"
            placeholder="Enter the code above"
            value={captchaValue}
            onChange={(e) => handleCaptchaChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCaptchaVerify();
              }
            }}
            error={captchaValue.length > 0 && !captchaVerified}
            helperText={
              captchaValue.length > 0 && !captchaVerified
                ? "Click Verify once you've typed the code"
                : captchaVerified
                  ? "Verified"
                  : " "
            }
            className="max-w-xs"
            autoComplete="off"
            InputProps={{
              className: "rounded-xl",
              endAdornment:
                captchaValue && captchaVerified ? (
                  <InputAdornment position="end">
                    <i
                      className="ri-checkbox-circle-fill text-[var(--mui-palette-success-main)]"
                      style={{ fontSize: 18 }}
                    />
                  </InputAdornment>
                ) : undefined,
            }}
          />
          <button
            type="button"
            onClick={handleCaptchaVerify}
            className="px-4 py-2 rounded-xl bg-[#125da3] text-white text-sm font-medium hover:bg-[#0d4c88] transition-colors"
          >
            Verify
          </button>
        </Box>
      </Card>

      <Box
        className="flex justify-end gap-4 mt-2 py-4 sticky bottom-0 backdrop-blur-sm"
        style={{
          background:
            "color-mix(in srgb, var(--mui-palette-background-default, white) 85%, transparent)",
        }}
      >
        <Button
          variant="contained"
          size="large"
          disabled={!canConfirm}
          onClick={handleConfirm}
          className="rounded-xl normal-case text-sm px-8 font-semibold"
          sx={{
            boxShadow: canConfirm
              ? "0px 8px 20px -6px var(--mui-palette-primary-main)"
              : "none",
          }}
        >
          {bookingLoading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            <>
              Confirm Readiness
              <i className="ri-check-line ml-1.5" />
            </>
          )}
        </Button>
      </Box>
    </>
  );
};
