import axiosClient from "@/Services/AxiosConfig/axiosClient";

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
  return res.data.data;
};

export const getTacCandidateDetailAction = async (id: string) => {
  const res = await axiosClient.get(`/tac/candidate/${id}`);
  return res.data.data as { lead: any; branchToken: any };
};
