export interface ReminderCandidateTarget {
  leadId: string;
  inqNo: string;
  fullName: string;
  profilePic?: { url?: string; path?: string } | string | null;
}

export interface ReminderTacTarget {
  assignmentId: string | null;
  tacId: string;
  tacName: string;
  profilePic?: string | null;  
  leadId: string;
  inqNo: string;
}

export interface GetReminderTargetsResponse {
  success: boolean;
  message: string;
  data: {
    candidates: ReminderCandidateTarget[];
    tacs: ReminderTacTarget[];
  };
}

export interface ICreateBulkReminderPayload {
  candidateReminders?: {
    leadIds: string[];
    heading: string;
    message: string;
  };
 tacReminders?: {
   
    items: {
      tacId: string;
      leadId: string;
      inqNo: string;
    }[];
    heading: string;
    message: string;
  };
}
export interface SendRemindersResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    message: string;
  };
}
