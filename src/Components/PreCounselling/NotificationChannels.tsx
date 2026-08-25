"use client";

import React, { ChangeEvent, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import { NotificationPreferences } from "@/Types/Frontend_Payload/precounselling.types";
import toast from "react-hot-toast";
import { updateUserData } from "@/Redux/Auth/user.slice";
import { useDispatch } from "react-redux";
import { profileUpdateApi } from "@/Services/APIs/auth/auth.actions";

interface NotificationChannelsProps {
  // isEditingChannels: boolean;
  // setIsEditingChannels: (val: boolean) => void;
  // preferences: NotificationPreferences;
  // handlePrefChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // handleSavePreferences: () => void;
  reduxUser: any;
}

export const NotificationChannels: React.FC<NotificationChannelsProps> = ({
  // isEditingChannels, setIsEditingChannels, preferences, handlePrefChange, handleSavePreferences
  reduxUser
}) => {

  const [isEditingChannels, setIsEditingChannels] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: reduxUser?.notificationPreference?.email ?? true,
    whatsapp: reduxUser?.notificationPreference?.whatsapp ?? false,
    sms: reduxUser?.notificationPreference?.sms ?? false,
  });
  const dispatch = useDispatch();
  const handlePrefChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPreferences({
      ...preferences,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSavePreferences = async () => {
    if (!preferences.email && !preferences.whatsapp && !preferences.sms) {
      return toast.error("Please select at least one notification channel", {
        id: "pref-toast",
      });
    }
    setIsEditingChannels(false);
    try {
      const res = await profileUpdateApi({
        notificationPreference: preferences,
      });
      if (res?.data?.success) {
        dispatch(
          updateUserData({
            notificationPreference: res.data.data.notificationPreference,
          }),
        );
        toast.success("Preferences updated successfully", { id: "pref-toast" });
      }
    } catch (err) {
      toast.error("Failed to update preferences", { id: "pref-toast" });
    }
  };
  return (
    <Card className="rounded-[15px] shadow-none">
      <CardContent className="p-6">
        <Box className="flex justify-between items-center mb-8">
          <Typography variant="h6" fontWeight="bold">Notification Channels</Typography>
          <FormControlLabel
            control={<Switch checked={isEditingChannels} onChange={(e) => setIsEditingChannels(e.target.checked)} color="primary" />}
            label="Edit" labelPlacement="start"
          />
        </Box>

        {!isEditingChannels ? (
          <Box>
            {preferences.whatsapp && (
              <Box className="flex gap-4 items-start mb-8">
                <i className="ri-whatsapp-line text-[24px] text-[#25D366] mt-[2px]"></i>
                <Typography variant="body2"><span className="font-bold">WhatsApp:</span> Enabled for timely updates and session reminders.</Typography>
              </Box>
            )}
            {preferences.email && (
              <Box className="flex gap-4 items-start mb-8">
                <i className="ri-mail-line text-[24px] text-[#1976d2] mt-[2px]"></i>
                <Typography variant="body2"><span className="font-bold">Email:</span> Enabled for detailed session information and important documents.</Typography>
              </Box>
            )}
            {preferences.sms && (
              <Box className="flex gap-4 items-start mb-8">
                <i className="ri-message-2-line text-[18px] text-gray-600 mt-[2px]"></i>
                <Typography variant="body2"><span className="font-bold">SMS:</span> Enabled for quick alerts and notifications.</Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            <FormControl fullWidth>
              <FormGroup>
                <FormControlLabel label="Receive updates via Email" control={<Checkbox checked={preferences.email} onChange={handlePrefChange} name="email" />} />
                <FormControlLabel label="Receive updates via WhatsApp" control={<Checkbox checked={preferences.whatsapp} onChange={handlePrefChange} name="whatsapp" />} />
                <FormControlLabel label="Receive updates via SMS" control={<Checkbox checked={preferences.sms} onChange={handlePrefChange} name="sms" />} />
              </FormGroup>
            </FormControl>
            <Box className="flex justify-end mt-4">
              <Button variant="contained" size="small" onClick={handleSavePreferences} className="rounded-[8px] normal-case font-bold px-6 bg-[#1976d2] shadow-none">
                Save
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};