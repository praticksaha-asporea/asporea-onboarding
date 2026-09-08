import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { AxiosResponse } from "axios";
import {
  FoeInquiryPayload,
  FoeInquiryApiResponse,
  FoeSendOtpPayload,
  FoeSendOtpApiResponse,
} from "@/Types/foe.types";

export const foeSendCandidateOtpAction = async (
  payload: FoeSendOtpPayload,
): Promise<AxiosResponse<FoeSendOtpApiResponse>> => {
  return await axiosClient.put("/foe/inquiry", payload);
};

export const foeCreateInquiryAction = async (
  payload: FoeInquiryPayload,
): Promise<AxiosResponse<FoeInquiryApiResponse>> => {
  return await axiosClient.post("/foe/inquiry", payload);
};
