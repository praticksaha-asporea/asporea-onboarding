import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { externalSourceResponse, inquiryResponse, tacListResponse } from "@/Types/ApiResponse/leadRes.types";
import { userDetailsRes } from "@/Types/ApiResponse/userRes.types";
import { branchById, externalSourceByType } from "@/Types/Frontend_Payload/branch.types";
import { InquiryFormValues } from "@/Types/Frontend_Payload/lead.types";
import { userById } from "@/Types/object.types";
import { AxiosResponse } from "axios";

export const getTacListAction = async (bodyData: branchById): Promise<AxiosResponse<tacListResponse>> => {
  const res = await axiosClient.get(`/inquiry/tac-list?branchId=${bodyData.branchId}`);
  return res;
};

export const getExternalSourcesAction = async (bodyData: externalSourceByType): Promise<AxiosResponse<externalSourceResponse>> => {
  const res = await axiosClient.get(`/inquiry/external-sources?type=${bodyData?.type}`);
  return res;
};

export const createInquiryAction = async (formData: InquiryFormValues): Promise<AxiosResponse<inquiryResponse>> => {
  const res = await axiosClient.post("/inquiry/create", formData);
  // return res.data;
  return res;
};


export const updateInquiryAction = async (inquiryId: string, payload: any): Promise<AxiosResponse<any>> => {
  const res = await axiosClient.put(`/inquiry/update/${inquiryId}`, payload);
  // return res.data;
  return res;
};

export const userDetailsAction = async (bodyData: userById): Promise<AxiosResponse<userDetailsRes>> => {
  const res = await axiosClient.get(`/user/details?id=${bodyData?.userId}`);
  return res;
};
