import { useState, useEffect, useCallback } from "react";
import { loadCaptchaEnginge, validateCaptcha } from "react-simple-captcha";

export const useCaptcha = () => {
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const handleCaptchaRefresh = useCallback(() => {
    try {
      const canvasElement = document.getElementById("canv");
      if (canvasElement) {
        loadCaptchaEnginge(5);
        setCaptchaValue("");
        setCaptchaVerified(false);
      }
    } catch (error) {
      console.warn("Captcha canvas not mounted yet:", error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleCaptchaRefresh();
    }, 150);

    return () => clearTimeout(timer);
  }, [handleCaptchaRefresh]);

   
  const handleCaptchaChange = (value: string) => {
    setCaptchaValue(value);
    setCaptchaVerified(false);
  };

  const handleCaptchaVerify = () => {
    if (!captchaValue.trim()) return;
    setCaptchaVerified(validateCaptcha(captchaValue));
  };

  return {
    captchaValue,
    captchaVerified,
    handleCaptchaChange,
    handleCaptchaVerify,
    handleCaptchaRefresh,
  };
};
