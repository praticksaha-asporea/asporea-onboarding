import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { AxiosResponse } from "axios";
import {
  GetReminderTargetsResponse,
  ICreateBulkReminderPayload,
  SendRemindersResponse,
} from "@/Types/reminder.types";

export const getReminderTargetsAction = async (
  status: string,
): Promise<AxiosResponse<GetReminderTargetsResponse>> => {
  return await axiosClient.get(
    `tac/tachead/reminders/get-targets?status=${status}`,
  );
};

export const sendBulkRemindersAction = async (
  payload: ICreateBulkReminderPayload,
): Promise<AxiosResponse<SendRemindersResponse>> => {
  return await axiosClient.post(`tac/tachead/reminders/send`, payload);
};
