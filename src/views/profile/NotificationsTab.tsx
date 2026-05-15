"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { updateUserData } from "@/Redux/Auth/user.slice";

// MUI Imports
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

// Style Imports
import tableStyles from "@core/styles/table.module.css";

const NotificationsTab = () => {
  const dispatch = useDispatch();

  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );

  const [preferences, setPreferences] = useState({
    email: true,
    sms: true,
    whatsapp: true,
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (reduxUser?.notificationPreference) {
      setPreferences({
        email: reduxUser.notificationPreference.email ?? true,
        sms: reduxUser.notificationPreference.sms ?? true,
        whatsapp: reduxUser.notificationPreference.whatsapp ?? true,
      });
    }
  }, [reduxUser]);

  const handleToggle = (type: "email" | "sms" | "whatsapp") => {
    setPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const userId = reduxUser?.id || reduxUser?._id;
    if (!userId) {
      alert("User ID not found. Please relogin.");
      return;
    }

    setUpdating(true);

    try {
      const payload = {
        id: userId,
        notificationPreference: preferences,
      };

      const res = await axiosClient.patch("/user/profile-update", payload);

      if (res.data?.success) {
        dispatch(
          updateUserData({
            notificationPreference: res.data.data.notificationPreference,
          }),
        );

        alert("Notification Preferences Saved Successfully! 🎉");
      }
    } catch (error) {
      console.error("Failed to update preferences:", error);
      alert("Failed to update preferences.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card>
      {/* Form Submit handle karega */}
      <form onSubmit={handleSubmit}>
        <div className="overflow-x-auto">
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Preferences</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="border-be">
              {/* EMAIL ROW */}
              <tr>
                <td>
                  <Typography color="text.primary">Email</Typography>
                </td>
                <td>
                  <Checkbox
                    checked={preferences.email}
                    onChange={() => handleToggle("email")}
                  />
                </td>
              </tr>

              {/* SMS ROW */}
              <tr>
                <td>
                  <Typography color="text.primary">SMS</Typography>
                </td>
                <td>
                  <Checkbox
                    checked={preferences.sms}
                    onChange={() => handleToggle("sms")}
                  />
                </td>
              </tr>

              {/* WHATSAPP ROW */}
              <tr>
                <td>
                  <Typography color="text.primary">WhatsApp</Typography>
                </td>
                <td>
                  <Checkbox
                    checked={preferences.whatsapp}
                    onChange={() => handleToggle("whatsapp")}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <CardContent>
          <Grid container spacing={6}>
            <Grid size={12} className="flex justify-end gap-4 flex-wrap mt-4">
              <Button variant="contained" type="submit" disabled={updating}>
                {updating ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </form>
    </Card>
  );
};

export default NotificationsTab;
