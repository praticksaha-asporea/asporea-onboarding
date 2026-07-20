export interface CandidateContact {
  phone?: string;
  email?: string;
  whatsapp?: string;
}

export interface CandidateBranch {
  _id: string;
  title: string;
}

export interface CandidateConsultant {
  _id: string;
  firstName: string;
  lastName: string;
}

 
export interface TacHeadCandidate {
  _id: string;
  fullName: string;
  inqNo?: string;
  status: string;
  contact?: CandidateContact;
  preferences?: {
    branchId?: CandidateBranch;
    consultantId?: CandidateConsultant;
  };
}

 
export interface TacHeadCandidatesPayload {
  page?: number;
  limit?: number;
  branchId?: string;
  tacId?: string;
  search?: string;
}


export interface ParsedTacConsultant {
  _id: string;
  firstName: string;
  lastName: string;
  branchIds: string[];
}
