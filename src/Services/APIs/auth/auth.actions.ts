import axiosClient from "@/Services/AxiosConfig/axiosClient";
 

type ChangePasswordData = {
  userId: string,
  oldPassword: string,
  newPassword:string,
  confirmPassword: string
};

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

export const changePasswordApi = async (bodyData: ChangePasswordData) => {
  return axiosClient.post("admin/auth/change-password", bodyData); 
};

