import { ILead } from "@/lib/models/Lead.model";
import { IUser } from "@/lib/models/User.model";


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

export interface escalationRecord {
    _id: string;
    fromId?: IUser;
    toId?: transferUserRef;
    leadId?: ILead;
    reason: string;
    status: "requested" | "approved" | "rejected";
    remarks?: string;
    createdAt: string;
    updatedAt: string;
    actionedAt?: string;
    candidate?: IUser
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

export interface transferViewResponse {
    success: boolean;
    message: string;
    data: escalationRecord;
    error: string | null;
}

export interface transferActionResponse {
    success: boolean;
    message: string;
    data: escalationRecord;
    error: string | null;
}

export interface transferActionResponse {
    success: boolean;
    message: string;
    data: escalationRecord;
    error: string | null;
}
