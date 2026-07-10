"use client";

import Link from "next/link";

// MUI Imports
import { Box, CircularProgress } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import { MuiOtpInput } from "mui-one-time-password-input";

// Hooks & Components
import Logo from "../../../Components_Theme/layout/shared/Logo";
import Illustrations from "../../../Components/Illustrations";
import type { Mode } from "@core/types";
import { useTACLogin } from "./useTACLogin";


const TACLogin = ({ mode }: { mode: Mode }) => {
  const {
    isPasswordShown,
    authMode,
    setIdentity,
    setPassword,
    otp,
    handleOtpChange,
    sendOtp,
    enableVerifyOTP,
    loading,
    handleClickShowPassword,
    handleSendOtp,
    handleVerifyOtp,
    countdown,
    formik,
    authBackground,
    handleToggleAuthMode
  } = useTACLogin({ mode });



  return (
    <div className="flex flex-col justify-center items-center min-bs-[100dvh] relative p-6">
      <Card className="flex flex-col sm:is-[450px]">
        <CardContent className="p-6 sm:!p-12">
          <Link href="/" className="flex justify-center items-center mbe-6">
            <Logo />
          </Link>
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <Typography variant="h4">{`Welcome to Asporea`}</Typography>
              <Typography className="mbs-1">
                Login or Sign Up to get started.
              </Typography>
            </div>

            <form
              noValidate
              autoComplete="off"
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-5"
            >
              {/* IDENTITY FIELD */}
              <TextField
                autoFocus
                fullWidth
                id="identity"
                name="identity"
                label="Phone Number or Email"
                value={formik.values.identity}
                onBlur={formik.handleBlur}

                error={formik.submitCount > 0 && Boolean(formik.errors.identity)}
                helperText={formik.submitCount > 0 && formik.errors.identity ? (formik.errors.identity as string) : undefined}
                onChange={(e) => {
                  formik.handleChange(e);
                  setIdentity(e.target.value);
                }}
              />

              {/* PASSWORD FIELD */}
              {authMode === "password" && (
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  value={formik.values.password}
                  onBlur={formik.handleBlur}
                  error={formik.submitCount > 0 && Boolean(formik.errors.password)}
                  helperText={formik.submitCount > 0 && formik.errors.password ? (formik.errors.password as string) : undefined}
                  onChange={(e) => {
                    formik.handleChange(e);
                    setPassword(e.target.value);
                  }}
                  type={isPasswordShown ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={handleClickShowPassword}
                        >
                          <i className={isPasswordShown ? "ri-eye-off-line" : "ri-eye-line"} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}

              <div
                className={`flex items-center gap-x-3 gap-y-1 flex-wrap ${authMode === "password" ? "justify-between" : "justify-center"}`}
              >
                {authMode === "password" && (
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Remember me"
                  />
                )}
                <Typography
                  className="text-end cursor-pointer font-bold"
                  color="primary"
                  onClick={handleToggleAuthMode}
                >
                  Login via{" "}
                  {authMode === "password" ? "OTP" : "Password"}
                </Typography>
              </div>

              {/* PASSWORD SIGNIN BUTTON */}
              {authMode === "password" && (
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Log In"
                  )}
                </Button>
              )}

              {/* MAIN OTP SEND BUTTON (Sirf tab chalega jab tak OTP hit na ho) */}
              {authMode === "otp" && (
                <Button
                  fullWidth
                  variant="contained"
                  className="btn btn-success"
                  type="submit"
                  disabled={sendOtp || loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              )}


              {authMode === "otp" && sendOtp && (
                <>
                  <div className="flex justify-between items-center flex-wrap gap-2 mt-2">
                    <Typography color={countdown > 0 ? "textSecondary" : "error"} className="text-sm font-medium">
                      {countdown > 0
                        ? `Resend in ${Math.floor(countdown / 60).toString().padStart(2, "0")}:${(countdown % 60).toString().padStart(2, "0")}`
                        : "Ready to resend!"}
                    </Typography>
                    <Button
                      color="error"
                      size="small"
                      variant="text"
                      type="button"
                      disabled={countdown > 0 || loading}
                      onClick={handleSendOtp}
                    >
                      Resend OTP
                    </Button>
                  </div>

                  <Box className="flex flex-col gap-4 mt-3">
                    <MuiOtpInput
                      value={otp}
                      onChange={handleOtpChange}
                      length={6}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      type="button"
                      disabled={!enableVerifyOTP || loading}
                      onClick={handleVerifyOtp}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </Box>
                </>
              )}
            </form>
          </div>
        </CardContent>
      </Card>

      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  );
};

export default TACLogin;