export interface TrackingPhase {
  status: string;
  date?: string;
  canSchedule?: boolean;
  hasResult?: boolean;
  isVisible?: boolean;
  type?: string;
  assessLatestStatus?: { token: { generated: boolean, number: string }, status: string }
}

export interface JourneyData {
  activeStep: number;
  inquiry: TrackingPhase;
  preCounselling: TrackingPhase;
  documents: TrackingPhase;
  experience: TrackingPhase;
  assessment: TrackingPhase;
  technical: TrackingPhase;
}

export interface trackingById {
  leadId: string,
}