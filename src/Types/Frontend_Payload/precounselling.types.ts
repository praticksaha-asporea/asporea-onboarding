export interface Slot {
  time: string;
  from: string;
  to: string;
  available: boolean;
}

export interface ExistingBooking {
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
}
