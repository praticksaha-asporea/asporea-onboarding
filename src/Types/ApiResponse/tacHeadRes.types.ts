import { TacHeadCandidate } from "../Frontend_Payload/tacHead.types";

export interface AllCandidatesTacHeadResponse {
  success: boolean;
  message: string;
  data: {
    candidates: TacHeadCandidate[];
    total: number;
    page: number;
    totalPages: number;
  };
  error: string | null;
}
