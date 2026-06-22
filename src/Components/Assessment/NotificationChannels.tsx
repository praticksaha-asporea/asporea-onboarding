"use client";

import React, { ChangeEvent } from "react";
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
import { NotificationChannels as ChannelsType } from "@/Types/Frontend_Payload/assessment.types";

interface NotificationChannelsProps {
  isEditingChannels: boolean;
  setIsEditingChannels: (val: boolean) => void;
  channels: ChannelsType;
  handleChannelChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSavePreferences: () => void; // 🌟 Prop interface mein add kiya
}

export const NotificationChannels: React.FC<NotificationChannelsProps> = ({
  isEditingChannels,
  setIsEditingChannels,
  channels,
  handleChannelChange,
  handleSavePreferences, // 🌟 Destructure kiya
}) => {
  return (
    <Card className="rounded-[15px] border border-[#e0e0e0] shadow-none">
      <CardContent className="p-6">
        <Box className="flex justify-between items-center mb-8">
          <Typography variant="h6" fontWeight="bold">
            Notification Channels
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isEditingChannels}
                onChange={(e) => setIsEditingChannels(e.target.checked)}
                color="primary"
              />
            }
            label="Edit"
            labelPlacement="start"
          />
        </Box>
        {!isEditingChannels ? (
          <Box>
            {/* Conditional icons or text mapping based on real state */}
            <Box className="flex gap-4 items-start mb-8">
              <i className={`ri-whatsapp-line text-[20px] ${channels.whatsapp ? "text-[#25D366]" : "text-gray-400"} mt-[2px]`}></i>
              <Typography variant="body2">
                <span className="font-bold">WhatsApp:</span> {channels.whatsapp ? "Enabled for timely updates." : "Disabled."}
              </Typography>
            </Box>
            <Box className="flex gap-4 -mt-4 items-start">
              <i className={`ri-mail-line text-[19px] ${channels.email ? "text-[#1976d2]" : "text-gray-400"} mt-[2px]`}></i>
              <Typography variant="body2">
                <span className="font-bold">Email:</span> {channels.email ? "Enabled for detailed information." : "Disabled."}
              </Typography>
            </Box>
            <Box className="flex gap-4 mt-4 items-start">
              <i className={`ri-message-3-line text-[19px] ${channels.sms ? "text-[#ff9800]" : "text-gray-400"} mt-[2px]`}></i>
              <Typography variant="body2">
                <span className="font-bold">SMS:</span> {channels.sms ? "Enabled for important reminders." : "Disabled."}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            <FormControl fullWidth>
              <FormGroup>
                <FormControlLabel
                  label="Receive updates via Email"
                  control={
                    <Checkbox
                      checked={channels.email}
                      onChange={handleChannelChange}
                      name="email"
                    />
                  }
                />
                <FormControlLabel
                  label="Receive updates via WhatsApp"
                  control={
                    <Checkbox
                      checked={channels.whatsapp}
                      onChange={handleChannelChange}
                      name="whatsapp"
                    />
                  }
                />
            <FormControlLabel
                  label="Receive updates via SMS"
                  control={
                    <Checkbox
                      checked={channels.sms}
                      onChange={handleChannelChange}
                      name="sms"
                    />
                  }
                />
              </FormGroup>
            </FormControl>
            <Box className="flex justify-end mt-4">
              <Button
                variant="contained"
                size="small"
                onClick={handleSavePreferences}  
                className="rounded-[8px] normal-case font-bold px-6 bg-[#1976d2] shadow-none"
              >
                Save
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};