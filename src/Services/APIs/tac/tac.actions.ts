import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { leadDocumentUpdateResponse } from "@/Types/ApiResponse/leadRes.types";
import { AxiosResponse } from "axios";

export interface CandidateRow {
  _id: string;
  name: string;
  inqNo: string;
  stage: string;
  status: string;
  experience: string | null;
  visitType: string | null;
  token: string | null;
  lastActivity: string;
  branchId?: string | null
  contact: { phone?: string; email?: string; whatsapp?: string };
}

export interface CandidatesResponse {
  data: CandidateRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  kpis?: {
    openCases: number;
    pendingCounselling: number;
    pendingAssessment: number;
  } | null;
}
export type ExpType =
  | "fresher"
  | "domestic"
  | "abroad"
  | "free";
export const getTacCandidatesAction = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  experience?: string;
  kpis?: boolean;
}): Promise<CandidatesResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.experience) query.set("experience", params.experience);
  if (params.kpis) query.set("kpis", "true");

  const res = await axiosClient.get(`/tac/candidates?${query.toString()}`);
  console.log("Fetched candidate data:", res.data);
  return res.data.data;
};

export const getTacCandidateDetailAction = async (id: string) => {
  const res = await axiosClient.get(`/tac/candidate/${id}`);
  return res.data.data as {
    lead: any;
    branchToken: any;
    assignments: any[];
    assignmentByPhase: Record<string, any>;
  };
};

type UpdateAssignmentPayload =
  | FormData
  | {
    assignmentId: string;
    status?: string;
    additionalDetails?: string;
    specificNotes?: string;
    advice?: string;
    attended?: boolean;
  };

type UpdateAssignmentAssessPayload =
  | FormData
  | {
    assignmentId: string;
    status?: string;
  };
export const updateAssignmentAction = async (
  payload: UpdateAssignmentPayload
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
  payload: UpdateAssignmentAssessPayload
) => {
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

export const updateDocumentStatusAction = async (id: string, status: 'verified' | 'rejected' | 'awaiting_approval'
): Promise<AxiosResponse<leadDocumentUpdateResponse>> => {

  const payload = { id, status };
  return axiosClient.patch(
    "/tac/assignment/document-verify",
    payload
  );
};

export const updateExpStatusAction = async (id: string, status: 'verified' | 'rejected' | 'refer_technical', expType: ExpType
): Promise<AxiosResponse<leadDocumentUpdateResponse>>  => {

  const payload = { id, status, expType };
  return axiosClient.patch(
    "/tac/assignment/exp-verify",
    payload
  );
};

export const updateLeadAction = async (payload: {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  passportStatus?: string;
  passportNo?: string;
}) => {
  const res = await axiosClient.patch("/tac/lead/update", payload);
  return res.data;
};

export const escalateLeadAction = async (payload: {
  leadId: string;
  toId: string;
  reason: string;
}) => {
  try {
    const res = await axiosClient.post("/tac/escalate", payload);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};
