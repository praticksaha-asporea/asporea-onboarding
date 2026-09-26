export interface GetLeadLogsParams {
  leadId: string;
}

export interface CreateLeadLogPayload {
  leadId: string;
  actionType: string;
  actionNote: string;
  eventDate?: string;
}


export interface IActivityLog {
  _id?: string;
  leadId: string;
  actionType: string;
  actionNote: string;
  actionBy: { _id: string, firstName: string; lastName: string, role: string; };
  actionByName?: string; // optional resolved display name for actionBy
  triggeredBy: "USER" | "SYSTEM";
  eventDate?: string | Date;
  createdAt: string | Date;
}

export interface IActivityLogListResponse {
  success: boolean,
  message: string,

  data: IActivityLog[],
  nextCursor: string | null,
  hasMore: boolean,

  error: null
}

export interface IFetchActivityLogsParams {
  leadId: string;
  cursor?: string | null;
  limit?: number;
  bycandidate?: boolean;
}