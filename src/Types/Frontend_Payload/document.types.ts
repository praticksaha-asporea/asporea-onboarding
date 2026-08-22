export interface Position {
  _id: string;
  title: string;
}

export interface DocumentRequirement {
  _id: string;
  title: string;
  subTitle?: string;
  supportedExtensions?: string[];
  isMandatory: boolean;
  multiple?: boolean;
  section: "resume" | "document" | "experience" | "academic" | "additional";
}

export interface GroupedDocuments {
  resume: DocumentRequirement[];
  document: DocumentRequirement[];
  experience: DocumentRequirement[];
  academic: DocumentRequirement[];
  additional: DocumentRequirement[];
}

export interface UploadMappedDocument {
  typeId: string;
  uploadId: string;
}

export interface UploadResult {
  uploadId: string;
  path: string;
};

export interface saveMappedDocumentReq {
  leadId: string,
  documents: UploadMappedDocument[],
  position: string,
}

export interface documentApprovalListPayload {
  page: number;
  limit: number;
  search: string;
}

export interface approveRejectDocumentPayload {
  leadId: string;
  status: "verified" | "rejected";
  remarks?: string;
  schedule?: {
    date: string;
    from: string;
    to: string;
    method?: "on" | "off";
  };
}

export interface getCandidateDocumentsPayload {
  leadId: string;
  settings?: boolean;
}

export interface UploadedDoc {
  _id: string;
  title: string;
  section: string;
  path: string;
  status: string;
}

export interface documentStatusUpdateReq {
  id: string,
  status: 'verified' | 'rejected' | 'awaiting_approval',
  remarks?: string
}