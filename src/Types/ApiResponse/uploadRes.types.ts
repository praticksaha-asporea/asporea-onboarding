import { IDocument } from "@/lib/models/Document.model"
import { ILead } from "@/lib/models/Lead.model"

export interface uploadResponse {
    success: boolean,
    message: string,
    data: {
        uploadId: string,
        path: string
    },
    error: string | null
}

export interface saveMappedDocumentRes {
    success: boolean,
    message: string,
    data: IDocument[],
    error: string | null
}

export interface saveMappedExpRes {
    success: boolean,
    message: string,
    data: ILead,
    error: null
}
