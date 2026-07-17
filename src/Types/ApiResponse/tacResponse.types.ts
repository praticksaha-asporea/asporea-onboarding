import { CandidateRow, QuestionType } from "../object.types"


export interface CandidatesResponse {
    success: boolean,
    message: string,
    data: {
        data: CandidateRow[],
        pagination: {
            total: number,
            page: number,
            limit: number,
            totalPages: number,
            hasNextPage: boolean,
            hasPrevPage: boolean
        },
        kpis: {
            openCases: number,
            pendingCounselling: number,
            pendingAssessment: number
        }
    },
    error: null
}
export interface TacAssessmentResponse {
    success: boolean,
    message: string,
    data: {
        _id: string,
        leadId: string,
        phase: string,
        assignedTo: string,
        schedule: {
            date: string,
            from: string,
            to: string,
            method: string
        },
        status: string,
        token: {
            generated: boolean
        },
        attended: boolean,
        escalation: {
            requested: boolean
        },
        createdAt: string,
        updatedAt: string
    },
    error: null
}

export interface QuestionsListReponse {
    success: boolean,
    message: string,
    data: {
        data: QuestionType[],
        pagination: {
            total: number,
            page: number,
            limit: number,
            totalPages: number,
            hasNextPage: boolean,
            hasPrevPage: boolean
        }
    },
    error: string
}
