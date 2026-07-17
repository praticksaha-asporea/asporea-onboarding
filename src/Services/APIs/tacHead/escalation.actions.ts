import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { AxiosResponse } from "axios";
import {
  escalationListPayload,
  escalationViewPayload,
  approveRejectEscalationPayload
} from "@/Types/Frontend_Payload/escalation.types";
import {
  escalationListResponse,
  escalationViewResponse,
  escalationActionResponse
} from "@/Types/ApiResponse/escalationRes.types";


export const getEscalationListAction = async (
  payload: escalationListPayload
): Promise<AxiosResponse<escalationListResponse>> => {
  const { page = 1, limit = 10, search = "", tacId = "" } = payload;
  const url = `/tac/tachead/escalation/list?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&tacId=${encodeURIComponent(tacId)}`;

  const response = await axiosClient.get<escalationListResponse>(url);
  return response;
};


export const getEscalationViewAction = async (
  payload: escalationViewPayload
): Promise<AxiosResponse<escalationViewResponse>> => {
  const url = `/tac/tachead/escalation/view?id=${encodeURIComponent(payload.id)}`;

  const response = await axiosClient.get<escalationViewResponse>(url);
  return response;
};


export const approveRejectEscalationAction = async (
  payload: approveRejectEscalationPayload
): Promise<AxiosResponse<escalationActionResponse>> => {
  const response = await axiosClient.post<escalationActionResponse>(
    "/tac/tachead/escalation/action",
    payload
  );
  return response;
};