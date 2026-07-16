import { Slot } from "../Frontend_Payload/assessment.types"
import { JourneyData } from "../Frontend_Payload/tracking.types"
import { positionDBData, techDBData } from "../object.types"

export interface inquiryResponse {

    success: boolean,
    message: string,
    data: {
        fullName: string,
        contact: {
            phone: string,
            whatsapp: string,
            email: string,
        },
        address: string,
        preferences: {
            branchId: string,
            consultantId: string,
            visitType: string
        },
        source: {
            type: string
        },
        status: string,
        inqNo: string,
        inqFy: string,
        documents: {
            status: string
        },
        createdBy: {
            id: string,
            type: string
        },
        _id: string,
        createdAt: string,
        updatedAt: string,
        __v: number
    },
    error: string | null
}


export interface leadDocumentUpdateResponse {
    success: boolean,
    message: string,
    data: {
        contact: {
            phone: number,
            whatsapp: number,
            email: string
        },
        preferences: {
            branchId: string,
            consultantId: string,
            visitType: 'online' | 'offline'
        },
        source: {
            type: string
        },
        experience: {
            submittedOn: string,
            type: string,
            status: 'verified' | 'selected' | 'request_technical'
        },
        documents: {
            position: string,
            status: string,
            submittedOn: string,
        },
        createdBy: {
            id: string,
            type: string
        },
        _id: string,
        fullName: string,
        address: string,
        status: string,
        inqNo: string,
        inqFy: string,
        createdAt: string,
        updatedAt: string,
        __v: number
    },
    error: string | null
}

export interface assessmentResultResponse {
    success: boolean,
    message: string,
    data: resultData,
    error: string | null
};

interface Note {
    _id: string;
    text: string;
    createdAt: string;
}

export interface resultData {
    scores: {
        total: number,
        achieved: number
    },
    _id: string,
    leadId: string,
    __v: number,
    assessedBy: string,
    createdAt: string,
    date: string,
    notes: Note[];
    passportNo: string,
    updatedAt: string
}

export interface journeyTrackingRes {
    success: boolean,
    message: string,
    data: JourneyData,
    error: null
}

export interface preCounsellingStatus {
    success: true,
    message: string,
    data: {
        _id: string,
        leadId: string,
        phase: string,
        assignedTo: string | { _id: string, },
        attended: boolean,
        createdAt: string,
        escalation: {
            requested: boolean
        },
        schedule: {
            date: string,
            from: string,
            to: string,
            method: string
        },
        status: string,
        token: {
            generated: boolean,
            number: string
        },
        updatedAt: string,
        pre: {
            additionalDetails: string,
            specificNotes: string,
            advice: string
        }
    },
    error: null
}

export interface slotsResponse {
    success: boolean,
    message: string,
    data: Slot[],
    error: null
}

export interface technicalResultResponse {
    success: boolean,
    message: string,
    data: techDBData,
    error: null
}

export interface assessmentScheduleResponse {
    success: boolean,
    message: string,
    data: {
        schedule: {
            date: string,
            from: string,
            to: string,
            method: string
        },
        token: {
            generated: boolean,
            number: string | null
        },
        escalation: {
            requested: boolean
        },
        _id: string,
        leadId: string,
        phase: string,
        assignedTo: string | { _id: string, },
        attended: boolean,
        createdAt: string,
        status: string,
        updatedAt: string
    },
    error: null
}

export interface documentUploadResponse {
    success: boolean,
    message: string,
    data: {
        status: string,
        documentStatus: string,
        realDocsCount: number,
        experienceType: string
    },
    error: null
}

export interface positionResponse {
    success: boolean,
    message: string,
    data: positionDBData[],
    error: null
}

export interface positionDetailResponse {
    success: boolean,
    message: string,
    data: positionDBData,
    error: null
}