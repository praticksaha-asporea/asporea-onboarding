import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { ChangePasswordResponse, loginResponse, profileUpdateResponse, sendOtpResponse, verifyOtpResponse } from "@/Types/ApiResponse/authRes.types";
import { ChangePasswordData, loginBodyData, profileUpdateData, SendOtpData, VerifyOtpData } from "@/Types/Frontend_Payload/auth.types";
import { AxiosResponse } from "axios";
import { boolean } from "joi";

export const loginApi = async (bodyData: loginBodyData): Promise<AxiosResponse<loginResponse>> => {
  return axiosClient.post("/auth/login", bodyData);
};

export const sendOtpApi = async (bodyData: SendOtpData): Promise<AxiosResponse<sendOtpResponse>> => {
  return axiosClient.post("/auth/send-otp", bodyData);
};

export const verifyOtpApi = async (bodyData: VerifyOtpData): Promise<AxiosResponse<verifyOtpResponse>> => {
  return axiosClient.post("/auth/verify-otp", bodyData);
};

export const changePasswordApi = async (bodyData: ChangePasswordData): Promise<AxiosResponse<ChangePasswordResponse>> => {
  return axiosClient.post("admin/auth/change-password", bodyData);
};

export const profileUpdateApi = async (bodyData: profileUpdateData): Promise<AxiosResponse<profileUpdateResponse>> => {
  return await axiosClient.patch("/user/profile-update", bodyData);
};