export interface ILeadNoteAuthor {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePic?: {
    _id?: string;
    path?: string;
  };
}

export interface ILeadNoteItem {
  _id: string;
  leadId: string;
  authorId: ILeadNoteAuthor;
  authorRole: string;
  note: string;
  createdAt: string;
}

export interface GetLeadNotesResponse {
  success: boolean;
  message: string;
  data: ILeadNoteItem[];
  error?: string | null;
}

export interface CreateLeadNoteResponse {
  success: boolean;
  message: string;
  data: ILeadNoteItem;
  error?: string | null;
}

export interface DeleteLeadNoteResponse {
  success: boolean;
  message: string;
  data: {
    noteId: string;
  };
  error?: string | null;
}
