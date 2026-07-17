import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { technicalActionResponse, technicalListResponse } from "@/Types/ApiResponse/technicalRes.types";
 import { technicalListPayload } from "@/Types/Frontend_Payload/technical.types"; 
import { AxiosResponse } from "axios";

export const getAwaitingExperienceAction = async (
  payload: technicalListPayload
): Promise<technicalListResponse | { success: boolean; message: string }> => {
  try {
    let url = `/tac/tachead/technical/list?page=${payload.page}&limit=${payload.limit}`;
    if (payload.search) url += `&search=${encodeURIComponent(payload.search)}`;
    if (payload.status) url += `&status=${encodeURIComponent(payload.status)}`;

    const response = await axiosClient.get(url);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch awaiting technical round candidates",
    };
  }
};
export const technicalExperienceAction = async (
  payload: FormData
): Promise<technicalActionResponse> => {
  try {
     const response: AxiosResponse<technicalActionResponse> = await axiosClient.post(
      "/tac/tachead/technical/action",
      payload
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Action failed",
    };
  }
};