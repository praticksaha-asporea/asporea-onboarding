import { useState, useEffect } from "react";
import { NotificationPreferences } from "@/Types/Frontend_Payload/precounselling.types";

export const useInquiryPreferences = (userData: any) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    whatsapp: false,
  });

  useEffect(() => {
    if (userData?.notificationPreference) {
      setPreferences({
        email: userData.notificationPreference.email ?? true,
        sms: userData.notificationPreference.sms ?? false,
        whatsapp: userData.notificationPreference.whatsapp ?? false,
      });
    }
  }, [userData]);

  const handlePreferenceToggle = (type: keyof NotificationPreferences) => {
    setPreferences((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const isPreferenceError = !(
    preferences.email ||
    preferences.sms ||
    preferences.whatsapp
  );

  return {
    preferences,
    handlePreferenceToggle,
    isPreferenceError,
  };
};
