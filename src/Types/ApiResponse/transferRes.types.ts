

export interface transferUserRef {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    role?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
}

export interface transferLeadRef {
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

export interface transferRecord {
    _id: string;
    fromId?: transferUserRef;
    toId?: transferUserRef;
    leadId?: transferLeadRef;
    reason: string;
    status: "requested" | "approved" | "rejected";
    remarks?: string;
    createdAt: string;
    updatedAt: string;
    actionedAt?: string;
}

export interface transferListResponse {
    success: boolean;
    message: string;
    data: {
        transfers: transferRecord[];
        meta: {
            totalRecords: number;
            currentPage: number;
            totalPages: number;
        };
    };
    error: string | null;
}

export interface transferViewResponse {
    success: boolean;
    message: string;
    data: transferRecord;
    error: string | null;
}

export interface transferActionResponse {
    success: boolean;
    message: string;
    data: transferRecord;
    error: string | null;
}

export interface transferActionResponse {
    success: boolean;
    message: string;
    data: transferRecord;
    error: string | null;
}
