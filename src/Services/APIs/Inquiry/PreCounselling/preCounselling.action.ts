import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { bookPreCounsellingRes, pre_TacListRes, preCounsellingStatus, slotsResponse } from "@/Types/ApiResponse/leadRes.types";
import { LeadListPayload } from "@/Types/Frontend_Payload/lead.types";
import { getSlotsPayload, PreCounsellingPayload } from "@/Types/Frontend_Payload/precounselling.types";
import { trackingById } from "@/Types/Frontend_Payload/tracking.types";
import { AxiosResponse } from "axios";

interface GetConsultantsParams {
  leadId: string;
  branchId: string;
  method: "on" | "off";
}

export const getSlotsAction = async (bodyData: getSlotsPayload): Promise<AxiosResponse<slotsResponse>> => {
  // try {
  const response = await axiosClient.get(`/pre-counselling/slots?consultantId=${bodyData?.consultantId}&date=${bodyData?.date}`);
  return response;
  // } catch (error: any) {
  //   return { success: false, message: error.response?.data?.message || "Failed to fetch slots" };
  // }
};

export const bookSlotAction = async (
  payload: FormData
): Promise<AxiosResponse<bookPreCounsellingRes>> => {
  return axiosClient.post(
    "/pre-counselling/book-slot",
    payload,
    payload instanceof FormData
      ? {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
      : undefined
  );
};


export const checkBookingStatusAction = async (bodyData: trackingById): Promise<AxiosResponse<preCounsellingStatus>> => {
  const response = await axiosClient.get(`/pre-counselling/status?leadId=${bodyData.leadId}`);
  return response;
};

export const getConsultantsAction = async ({
  leadId,
  branchId,
  method,
}: GetConsultantsParams) => {
  return axiosClient.get("/precounselling/consultants", {
    params: { leadId, branchId, method },
  });
};

export const getTacsListAction = async (bodyData: LeadListPayload): Promise<AxiosResponse<pre_TacListRes>> => {
  return axiosClient.get("/pre-counselling/tac-list", {
    params: bodyData,
  });
};

export const cancelBookingAction = async (bodyData: any): Promise<AxiosResponse<any>> => {
  // try {
  const response = await axiosClient.post("/pre-counselling/cancel-booking", bodyData);
  return response;
  // } catch (error: any) {
  //   return error;
  // }
}