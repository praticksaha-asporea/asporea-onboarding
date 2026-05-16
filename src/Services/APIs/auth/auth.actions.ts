import axiosClient from "@/Services/AxiosConfig/axiosClient";

export const loginApi = async (bodyData: {
  identity: string;
  password?: string;
}) => {
  return axiosClient.post("/auth/login", bodyData);
};

export const sendOtpApi = async (bodyData: { identity: string }) => {
  return axiosClient.post("/auth/send-otp", bodyData);
};

export const verifyOtpApi = async (bodyData: {
  identity: string;
  otp: string;
}) => {
  return axiosClient.post("/auth/verify-otp", bodyData);
};
