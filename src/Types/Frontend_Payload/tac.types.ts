export interface GetTacCandidatesPayload {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    experience?: string;
    kpis?: boolean;
}