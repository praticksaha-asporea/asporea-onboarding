import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { AxiosResponse } from "axios";

export const getMyRemindersAction = async (): Promise<AxiosResponse<any>> => {
  return await axiosClient.get("reminder/my-reminders");
};

export const markReminderReadAction = async (payload: {
  reminderId?: string;
  markAll?: boolean;
}): Promise<AxiosResponse<any>> => {
  return await axiosClient.patch("reminder/mark-read", payload);
};
