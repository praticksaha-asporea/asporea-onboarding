

export interface escalationUserRef {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    role?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
}

export interface escalationLeadRef {
    _id: string;
    fullName: string;
    status: string;
    inqNo?: string;
    preferences?: {
        visitType?: "online" | "offline";
        branchId?: string;
        consultantId?: string;
    };
}

export interface escalationRecord {
    _id: string;
    fromId?: escalationUserRef;
    toId?: escalationUserRef;
    leadId?: escalationLeadRef;
    reason: string;
    status: "requested" | "approved" | "rejected";
    remarks?: string;
    createdAt: string;
    updatedAt: string;
    actionedAt?: string;
}

export interface escalationListResponse {
    success: boolean;
    message: string;
    data: {
        escalations: escalationRecord[];
        meta: {
            totalRecords: number;
            currentPage: number;
            totalPages: number;
        };
    };
    error: string | null;
}

export interface escalationViewResponse {
  success: boolean;
  message: string;
  data: escalationRecord;
  error: string | null;
}

export interface escalationActionResponse {
    success: boolean;
    message: string;
    data: escalationRecord;
    error: string | null;
}