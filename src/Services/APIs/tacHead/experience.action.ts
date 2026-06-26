import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { AxiosResponse } from "axios";

export const getAwaitingExperienceAction = async (
  page = 1,
  limit = 10,
  search = "",
  status = "",
) => {
  try {
    let url = `/tac/tachead/technical/list?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;

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

export const technicalExperienceAction = async (payload: any)=> 
// :Promise<AxiosResponse<any>> 
{
  try {
    const response = await axiosClient.post(
      "/tac/tachead/technical/action",
      payload,
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Action failed",
    };
  }
};
