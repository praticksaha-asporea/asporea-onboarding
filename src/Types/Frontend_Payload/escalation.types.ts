export interface escalationScheduleInfo {
  date: string;
  from: string;
  to: string;
  method: "on" | "off";
}

export interface escalationListPayload {
  page?: number;
  limit?: number;
  search?: string;
  tacId?: string;
}

export interface escalationViewPayload {
  id: string;
}

export interface approveRejectEscalationPayload {
  escalationId: string;
  status: "approved" | "rejected";
  remarks: string;
  schedule?: escalationScheduleInfo;
}