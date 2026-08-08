import axiosClient from "@/Services/AxiosConfig/axiosClient";
import {
  transferListPayload,
  transferViewPayload,
  approveRejecttransferPayload,
} from "@/Types/Frontend_Payload/transfer.types";
import {
  transferListResponse,
  transferViewResponse,
  transferActionResponse,
} from "@/Types/ApiResponse/transferRes.types";
import { AxiosResponse } from "axios";



export const getEscalationListAction = async (
  payload: transferListPayload
): Promise<AxiosResponse<transferListResponse>> => {
  const { page = 1, limit = 10, search = "", tacId = "" } = payload;
  const url = `/tac/tachead/escalation/list?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&tacId=${encodeURIComponent(tacId)}`;

  const response = await axiosClient.get(url);
  return response;
};


export const getEscalationViewAction = async (
  payload: transferViewPayload
): Promise<AxiosResponse<transferViewResponse>> => {
  const url = `/tac/tachead/escalation/view?id=${encodeURIComponent(payload.id)}`;

  const response = await axiosClient.get(url);
  return response;
};


export const approveRejectTransgerAction = async (
  payload: approveRejecttransferPayload
): Promise<AxiosResponse<transferActionResponse>> => {
  const response = await axiosClient.post(
    "/tac/tachead/escalation/action",
    payload
  );
  return response;
};