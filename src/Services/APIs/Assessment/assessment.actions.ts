import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { journeyTrackingRes, technicalResultResponse } from "@/Types/ApiResponse/leadRes.types";
import { trackingById } from "@/Types/Frontend_Payload/tracking.types";
import { AxiosResponse } from "axios";

export const getJourneyTimelineAction = async (bodyData: trackingById): Promise<AxiosResponse<journeyTrackingRes>> => {
  // try {
  const response = await axiosClient.get(
    `/tracking/journey?leadId=${bodyData?.leadId}`,
  );
  return response;
  // } catch (error: any) {
  //   return {
  //     success: false,
  //     message:
  //       error.response?.data?.message || "Failed to fetch journey timeline",
  //   };
  // }
};

export const scheduleAssessmentAction = async (data: {
  leadId: string;
  consultantId?: string;
  date: string;
  slotTime?: string;
  from?: string;
  to?: string;
  method: "on" | "off";
}): Promise<any> => {
  try {
    const response = await axiosClient.post(`/assessment/schedule`, data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to schedule assessment",
    };
  }
};

export const getTechnicalResultAction = async (bodyData: trackingById): Promise<AxiosResponse<technicalResultResponse>> => {
  // try {
  const res = await axiosClient.get(`/assessments/technical-result?leadId=${bodyData?.leadId}`);
  return res;
  // } catch (err) {
  //   return { success: false, message: "Network Error" };
  // }
};

export const getAssessmentResultAction = async (bodyData: trackingById): Promise<AxiosResponse<any>> => {
  // try {
  const res = await axiosClient.get(`/assessments/result?leadId=${bodyData?.leadId}`);
  return res
  //   .data;
  // } catch (err) {
  //   return { success: false, message: "Network Error" };
  // }
};
