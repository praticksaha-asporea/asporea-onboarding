import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { documentUploadResponse, positionResponse } from "@/Types/ApiResponse/leadRes.types";
import { trackingById } from "@/Types/Frontend_Payload/tracking.types";
import { AxiosResponse } from "axios";

export const getPositionsListAction = async (): Promise<AxiosResponse<positionResponse>> => {
  // try {
  const response = await axiosClient.get("/document/positions");
  return response
  //.data;
  // } catch (error: any) {
  //   return {
  //     success: false,
  //     message: error.response?.data?.message || "Failed to fetch positions",
  //   };
  // }
};

export const getPositionDetailsAction = async (positionId: string) => {
  try {
    const response = await axiosClient.get(
      `/document/position-details?id=${positionId}`,
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch document requirements",
    };
  }
};
export const saveMappedDocumentsAction = async (payload: any) => {
  try {
    const response = await axiosClient.post("/document/save", payload);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Save failed",
    };
  }
};

export const checkDocumentStatusAction = async (bodyData: trackingById): Promise<AxiosResponse<documentUploadResponse>> => {
  // try {
  const response = await axiosClient.get(`/document/status?leadId=${bodyData.leadId}`);
  return response
  // .data;
  // } catch (error: any) {
  //   return { success: false, message: error.response?.data?.message || "Failed to check status" };
  // }
};



export const getCandidateDocumentsAction = async (leadId: string, settings?: boolean): Promise<any> => {
  try {
    const response = await axiosClient.get(`/tac/candidate/${leadId}`, {
      ...settings === true &&
      {
        params: {
          settings: true,
        }
      },
    });
    return response?.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to check status" };
  }
};