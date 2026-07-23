import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { tokenResponse } from "@/Types/ApiResponse/tokenRes.types";
import { AxiosResponse } from "axios";

export const createBranchTokenAction = async (payload: {
  identity: string;
}): Promise<AxiosResponse<tokenResponse>> => {
  // try {
  const response = await axiosClient.post("/branch-token/create", payload);
  return response//.data;
  // } catch (error: any) {    
  //   return {
  //     success: false,
  //     message: error.response?.data?.message || "Failed to save experience",
  //   };
  // }
};
