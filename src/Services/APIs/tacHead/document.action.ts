import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { AxiosResponse } from "axios";
import { documentApprovalListPayload, approveRejectDocumentPayload } from "@/Types/Frontend_Payload/document.types";
import { documentApprovalListResponse, approveRejectDocumentResponse } from "@/Types/ApiResponse/documentRes.types";

export const getAwaitingDocumentsAction = async (
  payload: documentApprovalListPayload
): Promise<AxiosResponse<documentApprovalListResponse>> => {
  
   
  const { page = 1, limit = 10, search = "" } = payload;
  
  let url = `/tac/tachead/document/awaiting?page=${page}&limit=${limit}`;

  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await axiosClient.get<documentApprovalListResponse>(url);
  return response;
};

export const approveRejectDocumentAction = async (
  payload: approveRejectDocumentPayload
): Promise<AxiosResponse<approveRejectDocumentResponse>> => {
  const response = await axiosClient.post<approveRejectDocumentResponse>(
    "/tac/tachead/document/action",
    payload
  );
  return response;
};