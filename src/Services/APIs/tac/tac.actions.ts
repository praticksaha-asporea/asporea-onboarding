import { IAssignment } from "@/lib/models/Assignment.model";
import { IBranchToken } from "@/lib/models/BranchToken.model";
import { ILead } from "@/lib/models/Lead.model";
import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { escalationActionResponse } from "@/Types/ApiResponse/escalationRes.types";
import { inquiryResponse, leadDocumentUpdateResponse } from "@/Types/ApiResponse/leadRes.types";
import { candidateDetailResponse, CandidatesResponse, QuestionsListReponse, sendEmailRes, TacAssessmentResponse } from "@/Types/ApiResponse/tacResponse.types";
import { documentStatusUpdateReq } from "@/Types/Frontend_Payload/document.types";
import { escalateReqPayload } from "@/Types/Frontend_Payload/escalation.types";
import { expStatusUpdateReq } from "@/Types/Frontend_Payload/experience.types";
import { InquiryUpdatePayload } from "@/Types/Frontend_Payload/lead.types";
import { GetTacCandidatesPayload, sendEmailTACReq, UpdateAssessmentPayload, UpdateAssignmentAssessPayload, UpdateAssignmentPayload } from "@/Types/Frontend_Payload/tac.types";
import { ExpType } from "@/Types/object.types";
import { AxiosResponse } from "axios";

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
) => {
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
): Promise<AxiosResponse<any>> => {
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
export const escalateLeadAction = async (payload: escalateReqPayload): Promise<AxiosResponse<escalationActionResponse>> => {
  // try {
  const res = await axiosClient.post("/tac/escalate", payload);
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