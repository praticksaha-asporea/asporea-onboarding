export interface GetTacCandidatesPayload {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    experience?: string;
    kpis?: boolean;
}


export interface UpdateAssignmentPayload {
    assignmentId: string;
    status?: string;
    additionalDetails?: string;
    specificNotes?: string;
    advice?: string;
    attended?: boolean;
};

export interface UpdateAssignmentAssessPayload {
    assignmentId?: string;
    status?: string;
};

export interface UpdateAssessmentPayload {
    id: string;
    passportNo: string,
    note1: string,
    note2: string,
    note3: string,
    note4: string,
    candidateSign?: File | null,
    assessorSign?: File | null;
};

export interface sendEmailTACReq {
    leadId: string;
    message: string;
}