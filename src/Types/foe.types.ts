export type PassportStatusType = "having" | "applied" | "not";

export interface FoeInquiryPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  password?: string;
  passportStatus: PassportStatusType;
  passportNo?: string;
  inquiryCategory: string;
  inquiryFor: string;
  nationality: string;
  latestAcademic: string;
  latestTechnical?: string;
  workExperience?: string;
  referedFrom: string;
  referedType?: string;
  referedBy?: string;
  otherReferedBy?: string;
  otp: string;
  captchaValue: "",  
}

export interface FoeInquiryResponseData {
  _id: string;
  inqNo: string;
  fullName: string;
  status: string;
}

export interface FoeInquiryApiResponse {
  success: boolean;
  message: string;
  data?: FoeInquiryResponseData;
}

export interface FoeSendOtpPayload {
  identity: string;
  email: string;
  phone: string;
  whatsapp: string;
}

export interface FoeSendOtpApiResponse {
  success: boolean;
  message: string;
  data?: {
    channel: string;
    sentTo: string;
    expiresAt: Date;
    isRegistered: boolean;
  };
}