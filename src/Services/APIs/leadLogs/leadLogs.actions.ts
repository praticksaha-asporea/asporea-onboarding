import { AxiosResponse } from "axios";
import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { GetLeadLogsResponse } from "@/Types/ApiResponse/leadLogRes.types";
import {
  CreateLeadLogPayload,
  GetLeadLogsParams,
} from "@/Types/Frontend_Payload/leadLog.types";

export const getLeadLogsAction = async (
  bodyData: GetLeadLogsParams,
): Promise<AxiosResponse<GetLeadLogsResponse>> => {
  const res = await axiosClient.get(`/lead-logs?leadId=${bodyData.leadId}`);
  return res;
};

export const createLeadLogAction = async (
  formData: CreateLeadLogPayload,
): Promise<AxiosResponse<any>> => {
  const res = await axiosClient.post("/lead-logs", formData);
  return res;
};
