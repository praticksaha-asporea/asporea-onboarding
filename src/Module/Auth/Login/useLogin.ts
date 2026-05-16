import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import {
  loginApi,
  sendOtpApi,
  verifyOtpApi,
} from "@/Services/APIs/auth/auth.actions";
import { setUserData, UserData } from "@/Redux/Auth/user.slice";

export function useLogin() {
  const router = useRouter();
  const dispatch = useDispatch();

  // --- UI & Toggles States ---
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");

  // --- Form Values ---
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- API Flow Control States ---
  const [sendOtp, setSendOtp] = useState(false);
  const [enableVerifyOTP, setEnableVerifyOTP] = useState(false);
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => setIsPasswordShown((show) => !show);
  const togglePasswordOTP = () =>
    setAuthMode(authMode === "password" ? "otp" : "password");

  const handleOtpChange = (newValue: string) => {
    setOtp(newValue);
    setEnableVerifyOTP(newValue.length === 6);
  };

  const handlePasswordLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!identity || !password) return alert("Please enter email and password");

    try {
      setLoading(true);
      const res = await loginApi({ identity, password });

      if (res.data?.success) {
        const { user, tokens } = res.data.data;

        Cookies.set("accessToken", tokens.accessToken);
        if (tokens.refreshToken) {
          Cookies.set("refreshToken", tokens.refreshToken);
        }

        dispatch(setUserData({ userData: user as UserData }));

        router.push("/inquiry");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!identity) return alert("Please enter your email");

    try {
      setLoading(true);
      const res = await sendOtpApi({ identity });

      if (res.data?.success) {
        setSendOtp(true);
        alert("OTP Sent! (Check Terminal Console)");
      }
    } catch (err: any) {
      console.error("Send OTP Error:", err);
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const res = await verifyOtpApi({ identity, otp });

      if (res.data?.success) {
        const isRegistered = res.data.data.isRegistered;

        if (isRegistered) {
          const { tokens, user } = res.data.data;
          Cookies.set("accessToken", tokens.accessToken);
          if (tokens.refreshToken)
            Cookies.set("refreshToken", tokens.refreshToken);

          if (user) dispatch(setUserData({ userData: user as UserData }));

          router.push("/inquiry");
        } else {
          setShowSetupPassword(true);
        }
      }
    } catch (err: any) {
      console.error("Verify OTP Error:", err);
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePasswordAndRedirect = () => {
    if (!newPassword || newPassword !== confirmPassword) {
      return alert("Passwords do not match!");
    }

    localStorage.setItem("temp_register_email", identity);
    localStorage.setItem("temp_register_password", newPassword);

    setShowSetupPassword(false);
    router.push("/complete-profile");
  };

  return {
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
  };
}
