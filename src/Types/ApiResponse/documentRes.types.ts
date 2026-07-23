import { NotificationPreference } from "../Frontend_Payload/auth.types";

export interface docPositionRef {
  _id: string;
  title: string;
}

export interface docConsultantRef {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
}

export interface docBranchRef {
  _id: string;
  title: string;
  location?: string;
  timeZone?: string;
}

export interface leadUploadedDocumentItem {
  _id: string;
  typeId: string;
  status: "pending" | "verified" | "rejected" | "uploaded";
  title: string;
  section: string;
  path: string;
}


export interface deepPopulatedLeadDetails {
  _id: string;
  fullName: string;
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
  };
  address: string;
  preferences?: {
    branchId?: string | docBranchRef;
    consultantId?: docConsultantRef;
    visitType?: "online" | "offline";
  };
  source?: {
    type: string;
  };
  status: string;
  inqNo: string;
  inqFy: string;
  documents?: {
    status: string;
    position?: docPositionRef;
    submittedOn?: string;
    actionBy?: string;
    remarks?: string;
    uploadedDocs?: leadUploadedDocumentItem[];
  };
  passport?: {
    status: string;
    no: string;
  };
  createdBy?: {
    id: string;
    type: string;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
  experience?: {
    status: string;
    submittedOn: string;
    type: string;
  };
  notificationPreference?: NotificationPreference;
}

export interface awaitingDocLeadRecord {
  _id: string;
  fullName: string;
  inqNo: string;
  preferences?: {
    branchId?: string | docBranchRef;
    consultantId?: docConsultantRef;
  };
  documents?: {
    position?: docPositionRef;
    submittedOn?: string;
    status?: string;
    remarks?: string;
    actionBy?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
  };
  createdAt: string;
}

export interface documentApprovalListResponse {
  success: boolean;
  message: string;
  data: {
    leads: awaitingDocLeadRecord[];
    meta: {
      totalRecords: number;
      currentPage: number;
      totalPages: number;
    };
  };
  error: string | null;
}


export interface docBranchTokenRef {
  _id: string;
  tokenNo: string;
  status: string;
  generateDate: string;
}


export interface docPhaseAssignmentItem {
  _id: string;
  phase: "pre" | "assess";
  assignedTo: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  attended: boolean;
  createdAt: string;
  updatedAt: string;
  status: string;
  schedule?: {
    date: string;
    from: string;
    to: string;
    method: "on" | "off";
  };
  token?: {
    generated: boolean;
    number: string | null;
  };
  escalation?: {
    requested: boolean;
    escalatedTo?: string;
  };
  pre?: {
    additionalDetails?: string;
    specificNotes?: string;
    advice?: string;
  };
}


export interface candidateDocumentDetailsResponse {
  success: boolean;
  message: string;
  data: {
    lead: deepPopulatedLeadDetails;
    branchToken: docBranchTokenRef | null;
    assignments: docPhaseAssignmentItem[];
    assignmentByPhase: {
      pre?: docPhaseAssignmentItem;
      assess?: docPhaseAssignmentItem;
    };
    generalSettings?: Record<string, unknown>;
    assessResult?: Record<string, unknown>;
  };
  error: string | null;
}

export interface approveRejectDocumentResponse {
  success: boolean;
  message: string;
  data: awaitingDocLeadRecord;
  error: string | null;
}

export interface consultantSlotItem {
  time: string;
  from: string;
  to: string;
  available: boolean;
}

export interface experienceSaveResponse {

  success: boolean;
  message: string;
  data: deepPopulatedLeadDetails;
  error: string | null;
}