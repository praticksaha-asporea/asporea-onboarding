export interface IPendingLeadContact {
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface IPendingLeadInquiryStages {
  stage1?: "pending" | "done";
  stage2?: "pending" | "done";
  stage3?: "pending" | "done";
}

export interface IPendingLead {
  _id: string;
  fullName?: string;
  contact?: IPendingLeadContact;
  inqNo?: string;
  profilePic?: string;
  inquiryStages?: IPendingLeadInquiryStages;
  status?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PendingLeadsData {
  delayedLeads: IPendingLead[];
  meta: {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface PendingLeadsApiResponse {
  success: boolean;
  message: string;
  data: PendingLeadsData;
}