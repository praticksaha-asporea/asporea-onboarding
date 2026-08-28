export interface IPopulatedLead {
  _id: string;
  inqNo?: string;
  preferences?: {
    branchId?: string;
  };
  candidateResume?: {
    _id?: string;
    path?: string;
  };
}

export interface ExistingBooking {
  _id?: string;
  leadId?: string | IPopulatedLead; 
assignedTo?: string | { _id: string; [key: string]: any }; 
  phase?: string;
  schedule?: {
    date: string;
    from: string;
    to: string;
    method: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ChecklistState {
  materials: boolean;
  environment: boolean;
  questions: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
}

export interface PreCounsellingPayload {
  leadId: string;
  consultantId: string;
  date: string;
  from: string;
  to: string;
  method: string;
  resumeFile?: File;
  branchId?: string;
}

export interface getSlotsPayload {
  consultantId: string;
  date: string;
}

export interface CancelBookingPayload {
  leadId: string;
  actionBy: string;
  cancelReason?: string;
}