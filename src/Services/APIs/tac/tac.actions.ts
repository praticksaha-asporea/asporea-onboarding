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

export interface TacAssessmentResponse {
    success: boolean,
    message: string,
    data: {
        _id: string,
        leadId: string,
        phase: string,
        assignedTo: string,
        schedule: {
            date: string,
            from: string,
            to: string,
            method: string
        },
        status: string,
        token: {
            generated: boolean
        },
        attended: boolean,
        escalation: {
            requested: boolean
        },
        createdAt: string,
        updatedAt: string
    },
    error: null
}

export interface QuestionType {
  _id: string,
  title: string,
  shortName: string,
  marks: number,
  section: string,
  subSection: string,
  isDeleted: boolean,
  type: boolean,
  levels: string[],
  order: number,
  createdAt: string,
  updatedAt: string,
  __v: number
}
export interface QuestionsListReponse {
  success: boolean,
  message: string,
  data: {
    data: QuestionType[],
    pagination: {
      total: number,
      page: number,
      limit: number,
      totalPages: number,
      hasNextPage: boolean,
      hasPrevPage: boolean
    }
  },
  error: string
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

  type UpdateAssessmentPayload =
  | FormData
  | {
  id: string;
  passportNo: string,
  note1: string,
  note2: string,
  note3: string,
  note4: string,
  candidateSign?: File | null,
  assessorSign?: File | null;
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
) :Promise<AxiosResponse<any>>  => {
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

export const updateDocumentStatusAction = async (id: string, status: 'verified' | 'rejected' | 'awaiting_approval',remarks?: string
): Promise<AxiosResponse<leadDocumentUpdateResponse>> => {

  const payload = { id, status, remarks };
  return axiosClient.patch(
    "/tac/assignment/document-verify",
    payload
  );
};

export const updateExpStatusAction = async (id: string, status: 'verified' | 'rejected' | 'request_technical', expType: ExpType
): Promise<AxiosResponse<leadDocumentUpdateResponse>> => {

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

export const getAssessmentQuestionsList = async (
): Promise<AxiosResponse<QuestionsListReponse>> => {
  return axiosClient.get(
    "/assessment/questions/list");
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


export const updateAssessmentScoreAction = async (payload: UpdateAssessmentPayload):Promise<AxiosResponse<TacAssessmentResponse>> => {
  const res = await axiosClient.patch("/tac/assessment/tool-update", payload);
  return res;
};