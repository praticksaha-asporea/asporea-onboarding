import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { assessmentResultResponse, assessmentScheduleResponse, journeyTrackingRes, technicalResultResponse } from "@/Types/ApiResponse/leadRes.types";
import { scheduleAssessmentPayload } from "@/Types/Frontend_Payload/assessment.types";
import { trackingById } from "@/Types/Frontend_Payload/tracking.types";
import { AxiosResponse } from "axios";

export const getJourneyTimelineAction = async (bodyData: trackingById): Promise<AxiosResponse<journeyTrackingRes>> => {
  const response = await axiosClient.get(
    `/tracking/journey?leadId=${bodyData?.leadId}`,
  );
  return response;
};

export const scheduleAssessmentAction = async (data: FormData | scheduleAssessmentPayload): Promise<AxiosResponse<assessmentScheduleResponse>> => {
  const response = await axiosClient.post(`/assessment/schedule`, data);
  return response
};

export const getTechnicalResultAction = async (bodyData: trackingById): Promise<AxiosResponse<technicalResultResponse>> => {
  const res = await axiosClient.get(`/assessments/technical-result?leadId=${bodyData?.leadId}`);
  return res;
};

export const getAssessmentResultAction = async (bodyData: trackingById): Promise<AxiosResponse<assessmentResultResponse>> => {
  const res = await axiosClient.get(`/assessments/result?leadId=${bodyData?.leadId}`);
  return res
};
