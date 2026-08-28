import { useState, useEffect } from "react";
import { loadCaptchaEnginge, validateCaptcha } from "react-simple-captcha";

export const useCaptcha = () => {
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);

  useEffect(() => {
    loadCaptchaEnginge(5);
  }, []);

  const handleCaptchaChange = (value: string) => {
    setCaptchaValue(value);
    setCaptchaVerified(false);
  };

  const handleCaptchaVerify = () => {
    if (!captchaValue.trim()) return;
    setCaptchaVerified(validateCaptcha(captchaValue));
  };

  const handleCaptchaRefresh = () => {
    loadCaptchaEnginge(5);
    setCaptchaValue("");
    setCaptchaVerified(false);
  };

  return {
    captchaValue,
    captchaVerified,
    handleCaptchaChange,
    handleCaptchaVerify,
    handleCaptchaRefresh,
  };
};
