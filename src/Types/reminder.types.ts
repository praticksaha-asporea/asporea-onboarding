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


export interface IReminderListItem {
  _id: string;
  notifyTo: string;
  notifyType: "candidate" | "tac";
  sentFrom: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  heading: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  notifyToDetails?: {
    id: string;
    name: string;
    inqNo?: string;
    email?: string;
    profilePic?: string | null;
    type: "candidate" | "tac";
  };
}

export interface IGetRemindersListResponse {
  success: boolean;
  message: string;
  data: {
    reminders: IReminderListItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}