import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { documentUploadResponse, positionDetailResponse, positionResponse } from "@/Types/ApiResponse/leadRes.types";
import { saveMappedDocumentRes } from "@/Types/ApiResponse/uploadRes.types";
import { getCandidateDocumentsPayload, saveMappedDocumentReq } from "@/Types/Frontend_Payload/document.types";
import { trackingById } from "@/Types/Frontend_Payload/tracking.types";
import { positionById } from "@/Types/object.types";
import { AxiosResponse } from "axios";
import { candidateDocumentDetailsResponse } from "@/Types/ApiResponse/documentRes.types";

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

export const getPositionDetailsAction = async (bodyData: positionById): Promise<AxiosResponse<positionDetailResponse>> => {
  // try {
  const response = await axiosClient.get(
    `/document/position-details?id=${bodyData.positionId}`,
  );
  return response
  //.data;
  // } catch (error: any) {
  //   return {
  //     success: false,
  //     message:
  //       error.response?.data?.message ||
  //       "Failed to fetch document requirements",
  //   };
  // }
};
export const saveMappedDocumentsAction = async (bodyData: saveMappedDocumentReq): Promise<AxiosResponse<saveMappedDocumentRes>> => {
  // try {
  const response = await axiosClient.post("/document/save", bodyData);
  return response
  //   .data;
  // } catch (error: any) {
  //   return {
  //     success: false,
  //     message: error.response?.data?.message || "Save failed",
  //   };
  // }
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


export const getCandidateDocumentsAction = async (
  bodyData: getCandidateDocumentsPayload
): Promise<AxiosResponse<candidateDocumentDetailsResponse>> => {
  const response = await axiosClient.get<candidateDocumentDetailsResponse>(
    `/tac/candidate/${bodyData?.leadId}`,
    {
      ...(bodyData?.settings === true && {
        params: {
          settings: true,
        },
      }),
    }
  );
  return response;
};