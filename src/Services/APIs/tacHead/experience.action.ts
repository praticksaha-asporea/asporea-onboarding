import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { technicalActionResponse, technicalListResponse } from "@/Types/ApiResponse/technicalRes.types";
 import { technicalListPayload } from "@/Types/Frontend_Payload/technical.types"; 
import { AxiosResponse } from "axios";

export const getAwaitingExperienceAction = async (
  payload: technicalListPayload
): Promise<AxiosResponse<technicalListResponse>> => {
  let url = `/tac/tachead/technical/list?page=${payload.page}&limit=${payload.limit}`;
  
  if (payload.search) url += `&search=${encodeURIComponent(payload.search)}`;
  if (payload.status) url += `&status=${encodeURIComponent(payload.status)}`;

   
  const response = await axiosClient.get(url);
  return response;
};
export const technicalExperienceAction = async (
  payload: FormData
): Promise<AxiosResponse<technicalActionResponse>> => {
  const response = await axiosClient.post(
    "/tac/tachead/technical/action",
    payload
  );
  return response;
};