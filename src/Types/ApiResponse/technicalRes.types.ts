import { docBranchRef, docConsultantRef } from "./documentRes.types"; // Adjust import path if needed

 export interface technicalRequestedLeadRecord {
  _id: string;
  fullName: string;
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
  };
  address: string;
  preferences: {
    branchId: string | docBranchRef;
    consultantId: docConsultantRef;
    visitType: string;
  };
  status: string;
  inqNo: string;
  inqFy: string;
  documents?: {
    status: string;
    position: string;  
    submittedOn: string;
    actionBy?: string;
  };
  experience?: {
    status: string;
    submittedOn: string;
    type: string;
    actionBy?: string;
  };
  technical?: {
    required: boolean;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

 export interface technicalListResponse {
  success: boolean;
  message: string;
  data: {
    technicalRequestedLeads: technicalRequestedLeadRecord[];
    meta: {
      totalRecords: number;
      currentPage: number;
      totalPages: number;
    };
  };
  error: string | null;
}

export interface TechnicalActionData {
  leadId: string;
  assignmentId: string;
  totalScore: number;
  achievedScore: number;
  breakdownPdf: string; 
  timeTaken: string;
  questions: number;
  answered: number;
  feedback: string;
  status: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
 export interface technicalActionResponse {
  success: boolean;
  message: string;
  data?: TechnicalActionData;
  error?: string | null;
}