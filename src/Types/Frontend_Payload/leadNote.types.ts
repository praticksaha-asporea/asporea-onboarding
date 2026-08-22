export interface GetLeadNotesParams {
  leadId: string;
}

export interface CreateLeadNotePayload {
  leadId: string;
  note: string;
}

export interface DeleteLeadNoteParams {
  noteId: string;
}
