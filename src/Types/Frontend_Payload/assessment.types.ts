export interface Slot {
  time: string;
  from?: string;
  to?: string;
  available: boolean;
}

export interface Checklist {
  documents: boolean;
  environment: boolean;
  aspirations: boolean;
  lighting: boolean;
}

export interface NotificationChannels {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
  [key: string]: boolean;
}

export interface TechData {
  achievedScore: number;
  totalScore: number;
  answered: number;
  questions: number;
  timeTaken: string;
  status: string;
  breakdownPdf?: {
    _id: string,
    userId: string,
    publicId: string,
    path: string,
    createdAt: string,
    updatedAt: string,
    __v: number
  }
}
