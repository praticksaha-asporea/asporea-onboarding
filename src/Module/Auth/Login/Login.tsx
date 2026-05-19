"use client";

import { useFormik } from "formik";
import { getLoginValidationSchema, passwordSetupSchema } from "@/Validations/loginValidation";
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
    setNewPassword,
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
   
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  
  const formik = useFormik({
    initialValues: {
      identity: identity || "",
      password: password || "",
    },
    enableReinitialize: true,
    
    validateOnBlur: false, 
    validationSchema: getLoginValidationSchema(authMode),
    onSubmit: (values) => {
      setIdentity(values.identity);
      
      if (authMode === "password") {
        setPassword(values.password);
        const dummyEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
        handlePasswordLogin(dummyEvent);
      } else {
        handleSendOtp();
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validateOnBlur: false,
    validationSchema: passwordSetupSchema,
    onSubmit: (values) => {
       
      setNewPassword(values.newPassword);
      setConfirmPassword(values.confirmPassword);
      
      
      handleSavePasswordAndRedirect();
    },
  });

   
  const handleToggleAuthMode = () => {
    formik.resetForm({
      values: {
        identity: formik.values.identity,  
        password: "",
      },
    });
    togglePasswordOTP();
  };

  const handleCloseDialog = () => {
    passwordFormik.resetForm();
    setShowSetupPassword(false);
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
                  Login / Signup via{" "}
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

              {/* OTP SEND BUTTON */}
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

              {authMode === "otp" && (
                <>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <Typography color="error">Resend in 02:00</Typography>
                    <Button
                      color="error"
                      size="small"
                      variant="text"
                      type="button"
                      onClick={() => formik.handleSubmit()}
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
                        type="button"
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
                type="button"
                onClick={() => router.push("/tac-dashboard")}
                size="small"
                color="error"
              >
                Log In as TAC
              </Button>

              <Divider className="gap-3">or</Divider>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/inquiry" })}
                >
                  Continue With &nbsp;{" "}
                  <i className="ri-google-fill text-googlePlus" />
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  type="button"
                  onClick={() => signIn("facebook", { callbackUrl: "/inquiry" })}
                >
                  Continue With &nbsp;{" "}
                  <i className="ri-facebook-fill text-facebook" />
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  type="button"
                  onClick={() => signIn("linkedin", { callbackUrl: "/inquiry" })}
                >
                  Continue With &nbsp;{" "}
                  <i className="ri-linkedin-box-fill text-linkedin" />
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  type="button"
                  onClick={() => signIn("instagram", { callbackUrl: "/inquiry" })}
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
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ className: "rounded-[20px] p-3 relative" }}
      >
        <IconButton onClick={handleCloseDialog} className="absolute right-5 top-5 text-gray-500">
          <i className="material-symbols--close-rounded" />
        </IconButton>
        <DialogContent className="flex flex-col items-center">
          <Typography variant="h4" className="mt-4 mb-8">
            Setup Password
          </Typography>

          {/* Form wrapper for popup formik */}
          <form onSubmit={passwordFormik.handleSubmit} className="w-full">
            
            {/* NEW PASSWORD FIELD */}
            <Box className="w-full mb-6">
              <Typography variant="subtitle2" fontWeight="600" className="mb-2">
                New Password
              </Typography>
              <TextField
                fullWidth
                id="newPassword"
                name="newPassword"
                placeholder="Enter a password"
                type={showNewPassword ? "text" : "password"}
                value={passwordFormik.values.newPassword}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                error={passwordFormik.submitCount > 0 && Boolean(passwordFormik.errors.newPassword)}
                helperText={passwordFormik.submitCount > 0 && passwordFormik.errors.newPassword ? (passwordFormik.errors.newPassword as string) : undefined}
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
                      <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                        <i className={showNewPassword ? "ri-eye-off-line" : "ri-eye-line"} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  className: "rounded-[10px] !ring-0",
                }}
              />
            </Box>

            {/* CONFIRM PASSWORD FIELD */}
            <Box className="w-full mb-8">
              <Typography variant="subtitle2" fontWeight="600" className="mb-2">
                Confirm Password
              </Typography>
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Enter password again"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordFormik.values.confirmPassword}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                error={passwordFormik.submitCount > 0 && Boolean(passwordFormik.errors.confirmPassword)}
                helperText={passwordFormik.submitCount > 0 && passwordFormik.errors.confirmPassword ? (passwordFormik.errors.confirmPassword as string) : undefined}
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
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        <i className={showConfirmPassword ? "ri-eye-off-line" : "ri-eye-line"} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  className: "rounded-[10px] !ring-0",
                }}
              />
            </Box>

            <Box className="flex w-full justify-center gap-4 mb-4">
              <Button
                variant="contained"
                type="submit" // 🚀 Trigger passwordFormik onSubmit natively
                className="normal-case min-w-[150px] rounded-[10px] font-semibold py-[9.6px] bg-[#007FFF]"
              >
                Save Password
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  );
};

export default Login;