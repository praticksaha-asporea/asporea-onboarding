import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { inquiryResponse } from "@/Types/ApiResponse/leadRes.types";
import { InquiryFormValues } from "@/Types/Frontend_Payload/lead.types";
import { AxiosResponse } from "axios";

export const getTacListAction = async (branchId: string) => {
  const res = await axiosClient.get(`/inquiry/tac-list?branchId=${branchId}`);
  return res.data;
};

export const getExternalSourcesAction = async (type: string) => {
  const res = await axiosClient.get(`/inquiry/external-sources?type=${type}`);
  return res.data;
};

export const createInquiryAction = async (formData:InquiryFormValues): Promise<AxiosResponse<inquiryResponse>> => {
  const res = await axiosClient.post("/inquiry/create", formData);
  // return res.data;
  return res;
};
