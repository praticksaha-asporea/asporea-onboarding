import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { preCounsellingStatus, slotsResponse } from "@/Types/ApiResponse/leadRes.types";
import { getSlotsPayload } from "@/Types/Frontend_Payload/precounselling.types";
import { trackingById } from "@/Types/Frontend_Payload/tracking.types";
import { AxiosResponse } from "axios";

export const getSlotsAction = async (bodyData: getSlotsPayload): Promise<AxiosResponse<slotsResponse>> => {
  // try {
  const response = await axiosClient.get(`/pre-counselling/slots?consultantId=${bodyData?.consultantId}&date=${bodyData?.date}`);
  return response;
  // } catch (error: any) {
  //   return { success: false, message: error.response?.data?.message || "Failed to fetch slots" };
  // }
};

export const bookSlotAction = async (payload: any) => {
  try {
    const response = await axiosClient.post("/pre-counselling/book-slot", payload);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Booking failed" };
  }
};


export const checkBookingStatusAction = async (bodyData: trackingById): Promise<AxiosResponse<preCounsellingStatus>> => {
  const response = await axiosClient.get(`/pre-counselling/status?leadId=${bodyData.leadId}`);
  return response;
};