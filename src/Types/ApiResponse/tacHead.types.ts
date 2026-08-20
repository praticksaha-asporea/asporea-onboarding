 
export interface TacHeadPendingLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  stageFilter?: string;
}

 
export interface TacHeadPendingLeadItem {
  _id: string;
  name: string;
  fullName: string;
  inqNo: string;
  profilePic?: string;
  contact?: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  inquiryStages?: {
    stage1?: string;
    stage2?: string;
    stage3?: string;
  };
  status?: string;
  createdAt: string;
  updatedAt: string;
}

 
export interface TacHeadPendingLeadsMeta {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
}
 
export interface TacHeadPendingLeadsData {
  delayedLeads: TacHeadPendingLeadItem[];
  meta: TacHeadPendingLeadsMeta;
}

 
export interface TacHeadPendingLeadsApiResponse {
  success: boolean;
  message: string;
  data: TacHeadPendingLeadsData;
  error?: string | null;
}