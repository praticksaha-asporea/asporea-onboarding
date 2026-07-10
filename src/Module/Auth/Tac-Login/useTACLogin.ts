import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import {
  loginApi,
  sendOtpApi,
  verifyOtpApi,
} from "@/Services/APIs/auth/auth.actions";
import { setUserData, updateUserData, UserData } from "@/Redux/Auth/user.slice";
import toast from "react-hot-toast";
import { respectiveDashboard } from "@/Utils/common";
import { useImageVariant } from "@core/hooks/useImageVariant";
import { Mode } from "@/@core/types";

import { useFormik } from "formik";
import { getLoginValidationSchema } from "@/Validations/loginValidation";

export function useTACLogin({ mode }: { mode: Mode }) {
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

  const [countdown, setCountdown] = useState<number>(0);

  const darkImg = "/images/pages/auth-v1-mask-dark.png";
  const lightImg = "/images/pages/auth-v1-mask-light.png";
  const authBackground = useImageVariant(mode, lightImg, darkImg);


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
        const dummyEvent = { preventDefault: () => { } } as React.FormEvent<HTMLFormElement>;
        handlePasswordLogin(dummyEvent);
      } else {
        handleSendOtp();
      }
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


  useEffect(() => {
    const savedExpiry = localStorage.getItem("asporea_tac_otp_expiry");
    if (savedExpiry) {
      const remainingTime = Math.ceil((parseInt(savedExpiry) - Date.now()) / 1000);
      if (remainingTime > 0) {
        setCountdown(remainingTime);
        setSendOtp(true);
      } else {
        localStorage.removeItem("asporea_tac_otp_expiry");
      }
    }
  }, []);


  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("asporea_tac_otp_expiry");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);
  const handleClickShowPassword = () => setIsPasswordShown((show) => !show);
  const togglePasswordOTP = () =>
    setAuthMode(authMode === "password" ? "otp" : "password");

  const handleOtpChange = (newValue: string) => {
    setOtp(newValue);
    setEnableVerifyOTP(newValue.length === 6);
  };

  const handlePasswordLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();


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

        respectiveDashboard(user, router);

      }
    } catch (err: any) {
      console.error("Login Error:", err);

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
        const expiryTime = Date.now() + 120000;
        localStorage.setItem("asporea_tac_otp_expiry", expiryTime.toString());
        setCountdown(120);
        toast.success("OTP Sent! Successfully");
      }
    } catch (err: any) {
      console.error("Send OTP Error:", err);
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const res = await verifyOtpApi({ identity, otp });

      if (res.data?.success) {
        toast.success("OTP Verified Successfully!", { duration: 3000 });
        const responseData = res.data.data;
        const isRegistered = responseData.isRegistered;


        dispatch(updateUserData({
          isRegistered: responseData.isRegistered,
          verifiedIdentity: responseData.verifiedIdentity,
          channel: responseData.channel
        }));

        if (isRegistered) {
          const { tokens, user } = responseData;
          Cookies.set("accessToken", tokens.accessToken);
          if (tokens.refreshToken)
            Cookies.set("refreshToken", tokens.refreshToken);


          if (user) dispatch(setUserData({ userData: user as UserData }));

          respectiveDashboard(user, router);
        } else {

          setShowSetupPassword(true);
        }
      }
    } catch (err: any) {
      console.error("Verify OTP Error:", err);

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
    countdown,
    formik,
    authBackground,
    handleToggleAuthMode
  };
}
