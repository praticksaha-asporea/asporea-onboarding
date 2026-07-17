 
export interface technicalListPayload {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

 export interface technicalActionPayload {
  leadId: string;
  type: string;
  achievedScore: number | string;
  totalScore: number | string;
  answered: number | string;
  questions: number | string;
  timeTaken: string;
  feedback?: string;
  breakdownPdf?: File | null;
  scheduleDate?: string;
  scheduleFrom?: string;
  scheduleTo?: string;
}