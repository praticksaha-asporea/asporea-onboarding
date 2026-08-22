export interface GetLeadLogsParams {
  leadId: string;
}

export interface CreateLeadLogPayload {
  leadId: string;
  actionType: string;
  actionNote: string;
  eventDate?: string;
}
