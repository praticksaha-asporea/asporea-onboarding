export interface ILeadLogActionBy {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ILeadLogItem {
  _id: string;
  leadId: string;
  actionType: string;
  actionNote: string;
  actionBy?: ILeadLogActionBy;
  triggeredBy: "USER" | "SYSTEM";
  eventDate?: string;
  createdAt: string;
}

export interface GetLeadLogsResponse {
  success: boolean;
  message: string;
  data: ILeadLogItem[];
  error?: string | null;
}
