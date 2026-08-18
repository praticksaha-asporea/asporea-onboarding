import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { transferActionResponse } from "@/Types/ApiResponse/transferRes.types";
import { inquiryResponse, leadDocumentUpdateResponse, updateAssessmentRes } from "@/Types/ApiResponse/leadRes.types";
import { candidateDetailResponse, CandidatesResponse, QuestionsListReponse, sendEmailRes, TacAssessmentResponse } from "@/Types/ApiResponse/tacResponse.types";
import { documentStatusUpdateReq } from "@/Types/Frontend_Payload/document.types";
import { expStatusUpdateReq } from "@/Types/Frontend_Payload/experience.types";
import { InquiryUpdatePayload } from "@/Types/Frontend_Payload/lead.types";
import { GetTacCandidatesPayload, sendEmailTACReq, UpdateAssessmentPayload, UpdateAssignmentAssessPayload, UpdateAssignmentPayload } from "@/Types/Frontend_Payload/tac.types";
import { AxiosResponse } from "axios";
import { transferReqPayload } from "@/Types/Frontend_Payload/transfer.types";
import { PendingLeadsApiResponse } from "@/Types/ApiResponse/pendingLeadsRes.types";

export const getTacCandidatesAction = async (params: GetTacCandidatesPayload): Promise<AxiosResponse<CandidatesResponse>> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.experience) query.set("experience", params.experience);
  if (params.kpis) query.set("kpis", "true");

  const res = await axiosClient.get(`/tac/candidates?${query.toString()}`);
  return res;
};

export const getTacCandidateDetailAction = async (id: string): Promise<AxiosResponse<candidateDetailResponse>> => {
  const res = await axiosClient.get(`/tac/candidate/${id}`);
  return res
  // .data.data as {
  //   lead: ILead;
  //   branchToken: IBranchToken;
  //   assignments: IAssignment[];
  //   assignmentByPhase: Record<string, IAssignment>;
  // };
};

export const updateAssignmentAction = async (
  payload: UpdateAssignmentPayload | FormData
): Promise<AxiosResponse<updateAssessmentRes>> => {
  return axiosClient.patch(
    "/tac/assignment/update",
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

export const updateAssignmentAssessAction = async (
  payload: UpdateAssignmentAssessPayload | FormData
): Promise<AxiosResponse<updateAssessmentRes>> => {
  return axiosClient.patch(
    "/tac/assignment/update-assessment",
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

export const updateDocumentStatusAction = async (payload: documentStatusUpdateReq
): Promise<AxiosResponse<leadDocumentUpdateResponse>> => {

  // const payload = { id, status, remarks };
  return axiosClient.patch(
    "/tac/assignment/document-verify",
    payload
  );
};

export const updateExpStatusAction = async (payload: expStatusUpdateReq
): Promise<AxiosResponse<leadDocumentUpdateResponse>> => {

  // const payload = { id, status, expType };
  return axiosClient.patch(
    "/tac/assignment/exp-verify",
    payload
  );
};

export const updateLeadAction = async (payload: InquiryUpdatePayload): Promise<AxiosResponse<inquiryResponse>> => {
  const res = await axiosClient.patch("/tac/lead/update", payload);
  return res;//.data
};

export const getAssessmentQuestionsList = async (
): Promise<AxiosResponse<QuestionsListReponse>> => {
  return axiosClient.get(
    "/assessment/questions/list");
};
export const transferLeadAction = async (payload: transferReqPayload): Promise<AxiosResponse<transferActionResponse>> => {
  // try {
  const res = await axiosClient.post("/tac/transfer", payload);
  return res;//.data;
  // } catch (error: any) {
  //   throw error;
  // }
};


export const updateAssessmentScoreAction = async (payload: UpdateAssessmentPayload | FormData): Promise<AxiosResponse<TacAssessmentResponse>> => {
  const res = await axiosClient.patch("/tac/assessment/tool-update", payload);
  return res;
};

export const sendTacEmailAction = async (bodyData: sendEmailTACReq): Promise<AxiosResponse<sendEmailRes>> => {
  // try {
  const res = await axiosClient.post("/tac/communication/send-email", bodyData);
  return res
  //   .data;
  // } catch (error: any) {
  //   return {
  //     success: false,
  //     message: error.response?.data?.message || "Failed to send email",
  //   };
  // }
};
export const getPendingTrackingAction = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<AxiosResponse<PendingLeadsApiResponse>> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);

  const res = await axiosClient.get<PendingLeadsApiResponse>(
    `/tac/pending-leads?${query.toString()}`
  );
  return res;
};