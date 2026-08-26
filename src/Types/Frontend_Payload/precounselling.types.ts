export interface ExistingBooking {
  _id?: string;
  leadId?: string;
  schedule?: {
    date: string;
    from: string;
    to: string;
    method: string;
  };
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
  consultantId: string,
  date: string
}