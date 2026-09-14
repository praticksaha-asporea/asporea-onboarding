import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { AxiosResponse } from "axios";
import {
  GetReminderTargetsResponse,
  ICreateBulkReminderPayload,
  IGetRemindersListResponse,
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

export const getRemindersListAction = async (
  params?: Record<string, any>
): Promise<AxiosResponse<IGetRemindersListResponse>> => {
  return await axiosClient.get("tac/tachead/reminders/list", { params });
};

export const getReminderByIdAction = async (id: string) => {
  return await axiosClient.get(`tac/tachead/reminders/${id}`);
};

export const deleteReminderAction = async (id: string) => {
  return await axiosClient.delete(`tac/tachead/reminders/${id}`);
};
