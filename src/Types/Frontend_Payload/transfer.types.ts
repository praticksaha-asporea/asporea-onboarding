export interface transferScheduleInfo {
  date: string;
  from: string;
  to: string;
  method: "on" | "off";
}

export interface transferListPayload {
  page?: number;
  limit?: number;
  search?: string;
  tacId?: string;
}

export interface transferViewPayload {
  id: string;
}

export interface approveRejecttransferPayload {
  transferId: string;
  status: "approved" | "rejected";
  remarks: string;
  schedule?: transferScheduleInfo;
}

export interface transferReqPayload {
  leadId: string;
  toId: string;
  reason: string;
}