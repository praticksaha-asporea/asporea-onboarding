export interface InquiryFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  // prefferedBranch: string;
  // prefferedConsultant: string | null;
  // visitOption: number;
  // fullAddress: string;
  referedFrom?: string;
  referedType?: string | null;
  referedBy?: string | null;
  otherReferedBy?: string;
  // passportNo: string;
  inquiryCategory: string;
  inquiryFor: string;
  nationality?: string;
  latestAcademic?: string;
  latestTechnical?: string;
  workExperience?: string;
  latitude?: string;
  longitude?: string;
}

export interface InquiryUpdatePayload {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  passportStatus?: string;
  passportNo?: string;
}

export interface Step2InquiryUpdatePayload {
  id?: string;
  nationality?: string | null;
  latestAcademic?: string | null;
  latestTechnical?: string | null;
  workExperience?: string | null;
  referedFrom?: string | null;
  referedType?: string | null;
  referedBy?: string | null;
  otherReferedBy?: string | null;
}