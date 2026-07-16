import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { branchById } from "@/Types/Frontend_Payload/branch.types";
import { AxiosResponse } from "axios";

export const getSlotsAction = async (consultantId: string, date: string) => {
  try {
    const response = await axiosClient.get(`/pre-counselling/slots?consultantId=${consultantId}&date=${date}`);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch slots" };
  }
};

export const bookSlotAction = async (payload: any) => {
  try {
    const response = await axiosClient.post("/pre-counselling/book-slot", payload);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Booking failed" };
  }
};

// export const checkBranchView = async (bodyData: branchById): Promise<AxiosResponse<any>> => {
//   // try {
//   const response = await axiosClient.get(`/branch/view?id=${bodyData?.branchId}`);
//   return response
//   //   .data;
//   // } catch (error: any) {
//   //   return { success: false, message: error.response?.data?.message || "Failed to check branch details" };
//   // }
// };