export interface InquiryFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  prefferedBranch: string;
  prefferedConsultant: string | null;
  visitOption: number;
  fullAddress: string;
  referedFrom: string;
  referedType: string | null;
  referedBy: string | null;
  otherReferedBy: string;
  passportNo: string;
}