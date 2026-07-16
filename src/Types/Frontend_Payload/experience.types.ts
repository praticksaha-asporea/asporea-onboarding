export interface ExperienceOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AdditionalDocument {
  _id: string;
  title: string;
  subTitle?: string;
  supportedExtensions?: string[];
  isMandatory: boolean;
  multiple?: boolean;
  section: string;
}

export interface saveMappedExpReq {
  leadId: string;
  experienceType: string;
}