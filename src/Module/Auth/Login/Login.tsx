"use client";
import { toast } from "react-hot-toast";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

// MUI Imports
import { Dialog, DialogContent, Box, CircularProgress } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import { MuiOtpInput } from "mui-one-time-password-input";

// Hooks & Components
import { useImageVariant } from "@core/hooks/useImageVariant";
import Logo from "../../../Components_Theme/layout/shared/Logo";
import Illustrations from "../../../Components/Illustrations";
import type { Mode } from "@core/types";

import { useLogin } from "@/Module/Auth/Login/useLogin";

const Login = ({ mode }: { mode: Mode }) => {
  const {
    isPasswordShown,
    authMode,
    identity,
    setIdentity,
    password,
    setPassword,
    otp,
    handleOtpChange,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    sendOtp,
    enableVerifyOTP,
    showSetupPassword,
    setShowSetupPassword,
    loading,
    handleClickShowPassword,
    togglePasswordOTP,
    handlePasswordLogin,
    handleSendOtp,
    handleVerifyOtp,
    handleSavePasswordAndRedirect,
  } = useLogin();

  const router = useRouter();
  const darkImg = "/images/pages/auth-v1-mask-dark.png";
  const lightImg = "/images/pages/auth-v1-mask-light.png";
  const authBackground = useImageVariant(mode, lightImg, darkImg);
  const [pwdError, setPwdError] = useState({ newPwd: "", confirmPwd: "" });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({
    identity: "",
    password: "",
  });

  const handlePasswordValidation = () => {
    let isValid = true;
    let errors = { newPwd: "", confirmPwd: "" };

    if (!newPassword) {
      errors.newPwd = "Password is required";
      isValid = false;
    } else if (newPassword.length < 6) {
      errors.newPwd = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!confirmPassword) {
      errors.confirmPwd = "Confirm Password is required";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      errors.confirmPwd = "Passwords do not match";
      isValid = false;
    }

    setPwdError(errors);

    if (isValid) {
      handleSavePasswordAndRedirect();
    }
  };

  const onLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let isValid = true;
    let tempErrors = { identity: "", password: "" };

    if (!identity.trim()) {
      tempErrors.identity = "Phone Number or Email is required";
      isValid = false;
    }
    if (authMode === "password" && !password) {
      tempErrors.password = "Password is required";
      isValid = false;
    }

    setLoginErrors(tempErrors);

    if (isValid) {
      if (authMode === "password") {
        handlePasswordLogin(e);
      } else {
        handleSendOtp();
      }
    }
  };
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
              onSubmit={onLoginSubmit}
              className="flex flex-col gap-5"
            >
              <TextField
                autoFocus
                fullWidth
                label="Phone Number or Email"
                value={identity}
                error={!!loginErrors.identity}
                helperText={loginErrors.identity}
                onChange={(e) => {
                  setIdentity(e.target.value);
                  if (loginErrors.identity)
                    setLoginErrors({ ...loginErrors, identity: "" });
                }}
              />

              {authMode === "password" && (
                <TextField
                  fullWidth
                  label="Password"
                  value={password}
                  error={!!loginErrors.password}
                  helperText={loginErrors.password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginErrors.password)
                      setLoginErrors({ ...loginErrors, password: "" });
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
                          <i
                            className={
                              isPasswordShown
                                ? "ri-eye-off-line"
                                : "ri-eye-line"
                            }
                          />
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
                  onClick={togglePasswordOTP}
                >
                  Login / Signup via{" "}
                  {authMode === "password" ? "OTP" : "Password"}
                </Typography>
              </div>

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

              {authMode === "otp" && (
                <Button
                  fullWidth
                  variant="contained"
                  className="btn btn-success"
                  onClick={handleSendOtp}
                  disabled={sendOtp || loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              )}

              {authMode === "otp" && (
                <>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <Typography color="error">Resend in 02:00</Typography>
                    <Button
                      color="error"
                      size="small"
                      variant="text"
                      onClick={handleSendOtp}
                    >
                      Resend OTP
                    </Button>
                  </div>
                  {sendOtp && (
                    <>
                      <MuiOtpInput
                        value={otp}
                        onChange={handleOtpChange}
                        length={6}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        disabled={!enableVerifyOTP || loading}
                        onClick={handleVerifyOtp}
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </>
                  )}
                </>
              )}

              <Button
                variant="text"
                onClick={() => router.push("/tac-dashboard")}
                size="small"
                color="error"
              >
                Log In as TAC
              </Button>

              <Divider className="gap-3">or</Divider>
              <div className="grid grid-cols-2 gap-3">
                {/* Social Login Buttons ... (Kept same as yours) */}
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={() => signIn("google", { callbackUrl: "/inquiry" })}
                >
                  Continue With &nbsp;{" "}
                  <i className="ri-google-fill text-googlePlus" />
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={() =>
                    signIn("facebook", { callbackUrl: "/inquiry" })
                  }
                >
                  Continue With &nbsp;{" "}
                  <i className="ri-facebook-fill text-facebook" />
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={() =>
                    signIn("linkedin", { callbackUrl: "/inquiry" })
                  }
                >
                  Continue With &nbsp;{" "}
                  <i className="ri-linkedin-box-fill text-linkedin" />
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={() =>
                    signIn("instagram", { callbackUrl: "/inquiry" })
                  }
                >
                  Continue With &nbsp;{" "}
                  <i className="ri-instagram-fill text-instagram" />
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={showSetupPassword}
        onClose={() => setShowSetupPassword(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ className: "rounded-[20px] p-3 relative" }}
      >
        <IconButton
          onClick={() => setShowSetupPassword(false)}
          className="absolute right-5 top-5 text-gray-500"
        >
          <i className="material-symbols--close-rounded" />
        </IconButton>
        <DialogContent className="flex flex-col items-center">
          <Typography variant="h4" className="mt-4 mb-8">
            Setup Password
          </Typography>

          <Box className="w-full mb-6">
            <Typography variant="subtitle2" fontWeight="600" className="mb-2">
              New Password
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter a password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              error={!!pwdError.newPwd}
              helperText={pwdError.newPwd}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{
                "& input::-ms-reveal, & input::-ms-clear": {
                  display: "none",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="material-symbols--lock" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      <i
                        className={
                          showNewPassword ? "ri-eye-off-line" : "ri-eye-line"
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                ),
                className: "rounded-[10px] !ring-0",
              }}
            />
          </Box>

          <Box className="w-full mb-8">
            <Typography variant="subtitle2" fontWeight="600" className="mb-2">
              Confirm Password
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter password again"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              error={!!pwdError.confirmPwd}
              helperText={pwdError.confirmPwd}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{
                "& input::-ms-reveal, & input::-ms-clear": {
                  display: "none",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="material-symbols--lock" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      <i
                        className={
                          showConfirmPassword
                            ? "ri-eye-off-line"
                            : "ri-eye-line"
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                ),
                className: "rounded-[10px] !ring-0",
              }}
            />
          </Box>
          <Box className="flex w-full justify-center gap-4 mb-4">
            {/* <Button
              variant="text"
              onClick={() => router.push("/complete-profile")}
            >
              Skip Now
            </Button> */}
            <Button
              variant="contained"
              onClick={handlePasswordValidation}
              className="normal-case min-w-[150px] rounded-[10px] font-semibold py-[9.6px] bg-[#007FFF]"
            >
              Save Password
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  );
};

export default Login;
