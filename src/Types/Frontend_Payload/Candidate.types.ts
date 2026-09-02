import { IUser } from "@/lib/models/User.model";
import { ExpType } from "@/Types/object.types";

export interface BranchType {
  _id: string;
  title: string;
  location?: string;
  timeZone?: string;
}

export interface ConsultantType {
  _id: string;
  firstName: string;
  lastName?: string;
}

export interface AssignmentSchedule {
  date: string;
  from: string;
  to: string;
  method: string;
}

export interface AssignmentPhase {
  _id: string;
  phase: string;
  assignedTo: ConsultantType | string;
  attended: boolean;
  status: string;
  schedule: AssignmentSchedule;
  token?: { generated: boolean; number: string | null };
  pre?: {
    additionalDetails?: string;
    specificNotes?: string;
    advice?: string;
    initialCV?: { path: string };
  };
}

export interface DocumentBaseCandidate {
  _id: string;
  documents?: {
    status?: string;
    position?: { _id: string; title: string } | string;
    uploadedDocs?: any[];
  };
}

export interface CandidateLead extends DocumentBaseCandidate {
  profilePic: string | undefined;
  _id: string;
  name?: string;
  fullName?: string;
  inqNo: string;
  status: string;
  contact?: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  inqForType: string;
  inqForPosition: string;
  address?: string;
  preferences?: {
    branchId?: BranchType | string;
    consultantId?: ConsultantType | string;
    visitType?: string;
  };
  inquiryStages?: {
    stage1?: string;
    stage2?: string;
    stage3?: string;
  };
  source?: { type?: string; refType?: string; refName?: string };
  experience?: { type?: ExpType; status?: string };
  documents?: {
    status?: string;
    position?: { _id: string; title: string } | string;
    uploadedDocs?: any[];
  };

  technical?: { status?: string; classify?: string };
  passport?: { status?: string; no?: string };
  lastActivity?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  notificationPreference?: { email?: boolean; sms?: boolean; whatsapp?: boolean } | any;
  assignmentByPhase?: Record<string, any>;
  followUpRequired?: boolean;
  stage?: string;
  token?: string | null;
  user?: IUser;
  offeredPosition?: string;
}