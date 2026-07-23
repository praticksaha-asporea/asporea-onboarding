import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { experienceSaveResponse } from "@/Types/ApiResponse/documentRes.types";
import { saveMappedExpReq } from "@/Types/Frontend_Payload/experience.types";
import { AxiosResponse } from "axios";

export const saveExperienceTypeAction = async (payload: saveMappedExpReq): Promise<AxiosResponse<experienceSaveResponse>> => {
  // try {
  const response = await axiosClient.post("/experience/save", payload);
  return response
  //   .data;
  // } catch (error: any) {
  //   return {
  //     success: false,
  //     message: error.response?.data?.message || "Failed to save experience",
  //   };
  // }
};
